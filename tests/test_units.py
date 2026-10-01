"""Tez unit testlar (ffmpeg render talab qilmaydi)."""

import pytest

from video_agent import highlights, silence, subtitles
from video_agent.config import load_style
from video_agent.pipeline import auto_title, remap_words
from video_agent.reframe import reframe_filter
from video_agent.timeline import Segment, Timeline, build_keep_segments, invert, subtract
from video_agent.transcribe import Word
from video_agent.transliterate import cyr_to_lat


def W(text, s, e):
    return Word(text, s, e)


def test_parse_silencedetect():
    log = ("[silencedetect @ 0x1] silence_start: 0\n"
           "[silencedetect @ 0x1] silence_end: 0.8 | silence_duration: 0.8\n"
           "[silencedetect @ 0x1] silence_start: 3.5\n")
    assert silence.parse_silencedetect(log, 10.0) == [(0.0, 0.8), (3.5, 10.0)]


def test_invert_and_subtract():
    assert invert([(0, 1), (3, 4)], 6) == [Segment(1, 3), Segment(4, 6)]
    assert subtract([Segment(0, 10)], [(2, 3)]) == [Segment(0, 2), Segment(3, 10)]


def test_build_keep_segments_padding_merge_and_min():
    segs = build_keep_segments([(1.0, 1.1), (2.0, 5.0)], 6.0, padding=0.1, min_segment=0.3, fps=10)
    # 1.0-1.1 dagi qisqa jimlik padding bilan yopilib ketadi -> birlashadi
    assert segs == [Segment(0.0, 2.1), Segment(4.9, 6.0)]


def test_build_keep_segments_all_silent_returns_full():
    assert build_keep_segments([(0, 5)], 5.0, 0.1, 0.3) == [Segment(0, 5)]


def test_timeline_with_transition():
    tl = Timeline([Segment(1, 3), Segment(5, 8)], transition=0.5)
    assert tl.duration == pytest.approx(4.5)
    assert tl.map_time(1.0) == pytest.approx(0.0)
    assert tl.map_time(5.0) == pytest.approx(1.5)
    assert tl.map_time(4.0) is None
    assert tl.map_span(2.5, 5.5) == pytest.approx((1.5, 2.0))  # uzunroq saqlangan qism


def test_remap_words_drops_cut_words():
    tl = Timeline([Segment(0, 2), Segment(4, 6)])
    out = remap_words([W("a", 0.5, 1.0), W("cut", 2.5, 3.0), W("b", 4.5, 5.0)], tl)
    assert [(w.text, w.start) for w in out] == [("a", 0.5), ("b", 2.5)]


def test_transliteration():
    assert cyr_to_lat("Ўзбекистон") == "Oʻzbekiston"
    assert cyr_to_lat("Ассалому алайкум") == "Assalomu alaykum"
    assert cyr_to_lat("ғалаба") == "gʻalaba"


def test_fillers_and_keywords():
    words = [W("Bugun", 0, 0.3), W("eee", 0.4, 0.9), W("biz", 1, 1.2), W("100", 1.3, 1.6),
             W("million", 1.7, 2.1), W("daromad", 6, 6.6), W("va", 7, 7.1)]
    assert highlights.filler_spans(words) == [(0.4, 0.9)]
    hl = highlights.pick_keywords(words, 60, per_minute=2, min_gap=3)
    assert [h.word for h in hl] == ["100", "daromad"]
    assert all(w.keyword for w in words if w.text in ("100", "daromad"))
    manual = highlights.pick_keywords([W("Pul", 0, 0.5), W("topish", 1, 1.4)], 60, 1, 1, ["pul"])
    assert [h.word for h in manual] == ["Pul"]


def test_zoom_expression():
    assert highlights.zoom_expression([], 1.2, 0.2, 0.5) == "1"
    expr = highlights.zoom_expression([highlights.Highlight(1.0, 1.4, "x")], 1.2, 0.2, 0.5)
    assert expr.startswith("1+0.2000*min(1,") and "between(t,0.900,1.100)" in expr


def test_chunk_words_breaks():
    ws = [W("bir", 0, .2), W("ikki.", .3, .5), W("uch", .6, .8), W("to'rt", .9, 1.1), W("besh", 3, 3.2)]
    chunks = subtitles.chunk_words(ws, max_words=3, max_chars=30)
    assert [[w.text for w in c.words] for c in chunks] == [["bir", "ikki."], ["uch", "to'rt"], ["besh"]]


def test_build_ass_highlights_active_word():
    cfg = load_style("reels").captions
    ws = [W("salom", 0, .4), W("dunyo", .5, .9)]
    ws[1].keyword = True
    ass = subtitles.build_ass(ws, cfg, 1080, 1920)
    assert "PlayResY: 1920" in ass
    events = [l for l in ass.splitlines() if l.startswith("Dialogue")]
    assert len(events) == 2
    assert "0:00:00.00,0:00:00.50" in events[0] and "SALOM" in events[0]
    assert subtitles.ass_color(cfg.keyword_color) in events[1]
    assert subtitles.ass_color("#FF8800") == "&H000088FF"


def test_ass_escapes_braces():
    ass = subtitles.build_ass([W("{bad}", 0, 1)], load_style("youtube").captions, 1920, 1080)
    assert "(bad)" in ass


def test_reframe_modes():
    assert "crop=1080:1920" in reframe_filter(1920, 1080, 1080, 1920, "crop")
    assert "gblur" in reframe_filter(1920, 1080, 1080, 1920, "blur")
    assert "split" not in reframe_filter(1920, 1080, 1920, 1080, "blur")
    # tik -> gorizontal: crop so'ralsa ham xira fon ishlatiladi
    assert "gblur" in reframe_filter(1080, 1920, 1920, 1080, "crop")


def test_style_overrides_and_validation():
    s = load_style("youtube", {"formats": ["9:16"], "captions": {"size": 50}})
    assert s.formats == ["9:16"] and s.captions.size == 50
    with pytest.raises(ValueError):
        load_style("nope")
    with pytest.raises(ValueError):
        load_style("reels", {"formats": ["4:3"]})
    with pytest.raises(ValueError):
        load_style("reels", {"unknown": 1})


def test_auto_title():
    assert auto_title([W("Salom", 0, 1), W("do'stlar!", 1, 2), W("Bugun", 2, 3)], "x") == "Salom do'stlar"
    assert auto_title([], "fallback") == "fallback"


def test_cinematic_style_and_look_filters():
    from video_agent.editing import atempo_chain
    from video_agent.look import look_filters

    s = load_style("cinematic")
    assert s.motion.title_style == "cinematic" and not s.motion.outro and s.look.speed < 1
    f = look_filters(s.look, 10.0)
    assert f[0].startswith("curves=") and any(x.startswith("vignette") for x in f)
    assert f[-1] == "fade=t=out:st=9.000:d=1.00"
    assert look_filters(load_style("reels").look, 10.0) == []
    assert atempo_chain(0.25) == "atempo=0.5,atempo=0.5000"
    with pytest.raises(ValueError):
        look_filters(type(s.look)(grade="nope"), 5)


def test_aesthetic_style():
    from video_agent.look import look_filters

    s = load_style("aesthetic", {"motion": {"text_y": 0.12}})
    assert s.motion.title_style == "aesthetic" and s.motion.outro_style == "endcard"
    assert s.transition.edge_type == "fadeblack" and s.look.push > 0
    assert look_filters(s.look, 9.0)[0].startswith("curves=")
    assert s.motion.text_y == 0.12


def test_face_track_fill_and_smooth():
    from video_agent.faceblur import fill_and_smooth

    boxes = [[0, 0, 10, 10], None, [10, 0, 10, 10], None]
    out = fill_and_smooth(boxes, window=1)
    assert out[1][0] == pytest.approx(5.0) and out[3][0] == pytest.approx(10.0)
    assert fill_and_smooth([None, None]) == [None, None]
