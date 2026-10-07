"""Agentning asosiy oqimi: tahlil -> montaj -> subtitr -> motion -> ovoz -> formatlar."""

from __future__ import annotations

import logging
import shutil
import time
from dataclasses import dataclass, field
from pathlib import Path

from . import audio, editing, ffmpeg_utils as ff, highlights, silence, subtitles, transcribe
from .look import look_filters
from .compose import ComposeJob, compose, main_offset, total_duration
from .config import FORMATS, StyleConfig
from .motion import MotionJob, MotionText, render_motion
from .timeline import Segment, Timeline, build_keep_segments
from .transcribe import Word

log = logging.getLogger("video_agent")


@dataclass
class Options:
    input: Path
    style: StyleConfig
    output_dir: Path
    music: Path | None = None
    title: str | None = None
    subtitle: str = ""
    name: str = ""
    role: str = ""
    handle: str = ""
    keywords: list[str] = field(default_factory=list)
    transcript: Path | None = None
    whisper_model: str = "large-v3"
    language: str | None = "uz"
    device: str = "auto"
    cut: bool = True
    remove_fillers: bool = True
    focus_x: float = 0.5
    keep_temp: bool = False
    music_from: Path | None = None  # musiqani shu videodan ajratib olish
    avatar: Path | None = None     # expert: "obuna bo'ling" joyida profil rasmi
    plan: Path | None = None       # expert uslubi: tayyor reja (plan.json)
    points: list[str] = field(default_factory=list)  # expert: ro'yxat punktlari
    script: Path | None = None     # Whisper bo'lmasa: nutq matni (.txt)
    hide_face: str | None = None   # blur | emoji
    face_emoji: str = "🌸"


@dataclass
class Result:
    outputs: dict[str, Path]
    transcript: Path | None
    srt: Path | None
    original_duration: float
    edited_duration: float
    segments: int
    keywords: list[str]


class Step:
    """Bosqich vaqtini o'lchab, chiroyli log chiqaradi."""

    def __init__(self, n: int, total: int, title: str):
        self.label = f"[{n}/{total}] {title}"

    def __enter__(self):
        self.t = time.time()
        log.info("%s ...", self.label)
        return self

    def __exit__(self, *exc):
        if exc[0] is None:
            log.info("%s ✓ (%.1fs)", self.label, time.time() - self.t)


def auto_title(words: list[Word], fallback: str, max_words: int = 6) -> str:
    out = []
    for w in words:
        out.append(w.text.strip(".,!?;:"))
        if len(out) >= max_words or w.text.rstrip()[-1:] in ".!?":
            break
    return " ".join(out) if out else fallback


def punch_terms(tl: Timeline, min_block: float = 4.0) -> str:
    """Kesim joylarida har >= min_block soniyada kadr yaqinlashadi/uzoqlashadi (jump-cut uslubi)."""
    blocks, last, state = [], 0.0, 0
    for cut in tl.out_starts[1:]:
        if cut - last >= min_block:
            if state:
                blocks.append((last, cut))
            last, state = cut, 1 - state
    if state:
        blocks.append((last, tl.duration + 1))
    return "+".join(f"between(t,{a:.3f},{b - 0.001:.3f})" for a, b in blocks) or "0"


def remap_words(words: list[Word], tl: Timeline) -> list[Word]:
    out = []
    for w in words:
        span = tl.map_span(w.start, w.end)
        if span and span[1] - span[0] > 0.04:
            out.append(Word(w.text, round(span[0], 3), round(span[1], 3), w.probability))
    return out


def run(opt: Options) -> Result:
    ff.require_ffmpeg()
    st = opt.style
    if not opt.input.exists():
        raise FileNotFoundError(f"Video topilmadi: {opt.input}")
    opt.output_dir.mkdir(parents=True, exist_ok=True)
    stem = opt.input.stem
    work = opt.output_dir / f".{stem}_work"
    work.mkdir(parents=True, exist_ok=True)
    total_steps = 7

    with Step(1, total_steps, "Videoni tahlil qilish"):
        info = ff.probe(opt.input)
        if not info.has_video:
            raise ValueError("Faylda video oqimi yo'q")
        src = opt.input
        if opt.hide_face:
            from .faceblur import hide_faces
            src = hide_faces(opt.input, work / "faceless", opt.hide_face, opt.face_emoji)
        log.info("    %dx%d, %.1f fps, %.1fs, ovoz: %s", info.width, info.height, info.fps, info.duration,
                 "bor" if info.has_audio else "yo'q")

    words: list[Word] = []
    transcript_path = None
    with Step(2, total_steps, "Nutqni matnga aylantirish (Whisper)"):
        if opt.transcript:
            words = transcribe.load_words(opt.transcript)
            log.info("    tayyor transkript yuklandi: %s (%d so'z)", opt.transcript, len(words))
        elif info.has_audio and (st.captions.enabled or opt.remove_fillers or opt.title is None):
            wav = transcribe.extract_audio(opt.input, work / "speech16k.wav")
            try:
                words = transcribe.transcribe(wav, opt.whisper_model, opt.language, opt.device)
                log.info("    %d so'z aniqlandi", len(words))
            except Exception as e:  # model yuklanmasa ham montaj davom etadi
                log.warning("    Whisper ishlamadi, matnsiz davom etiladi: %s", str(e).strip().splitlines()[-1][:200])
                log.warning("    Yechim: --transcript, --script yoki internetda huggingface.co ga ruxsat")
        if words:
            transcript_path = opt.output_dir / f"{stem}.transcript.json"
            if not opt.transcript or opt.transcript.resolve() != transcript_path.resolve():
                transcribe.save_words(words, transcript_path, opt.language or "auto")

    with Step(3, total_steps, "Montaj: jimlik va pauzalarni kesish, o'tishlar"):
        if opt.cut and info.has_audio:
            noise_db = st.cut.noise_db
            if st.cut.auto_threshold:
                noise_db = silence.auto_threshold(opt.input)
                log.info("    jimlik chegarasi: %.1f dB (avtomatik)", noise_db)
            sil = silence.detect_silences(opt.input, noise_db, st.cut.min_silence, info.duration)
            remove = highlights.filler_spans(words) if opt.remove_fillers else []
            segments = build_keep_segments(sil, info.duration, st.cut.padding,
                                           max(st.cut.min_segment, 2 * st.transition.duration + 0.05),
                                           remove, st.fps)
        else:
            segments = [Segment(0.0, info.duration)]
        t = editing.effective_transition(segments, st.transition.duration)
        tl = Timeline(segments, t)
        cut = editing.cut_and_join(src, segments, work, editing.working_size(info.width, info.height),
                                   st.fps, info.has_audio, st.transition.type, t)
        if abs(st.look.speed - 1.0) > 1e-3:
            cut = editing.change_speed(cut, work / "cut_speed", st.look.speed, st.fps)
            log.info("    tezlik: x%.2f", st.look.speed)
        cut_info = ff.probe(cut)
        log.info("    %d bo'lak, %.1fs -> %.1fs (%.0f%% qisqardi)", len(segments), info.duration,
                 cut_info.duration, 100 * (1 - cut_info.duration / max(info.duration, 0.01)))

    with Step(4, total_steps, "Subtitr va muhim so'zlar"):
        out_words = remap_words(words, tl)
        if not out_words and opt.script:
            from .expert import align_script
            from .timeline import invert
            sil = silence.detect_silences(cut, -35, 0.25, cut_info.duration)
            speech = [(sg.start, sg.end) for sg in invert(sil, cut_info.duration)]
            out_words = align_script(opt.script.read_text(encoding="utf-8"), speech)
            log.info("    matn nutqqa moslandi: %d so'z (taxminiy vaqtlar)", len(out_words))
        if abs(st.look.speed - 1.0) > 1e-3:
            out_words = [Word(w.text, round(w.start / st.look.speed, 3), round(w.end / st.look.speed, 3),
                              w.probability) for w in out_words]
        if opt.remove_fillers:
            out_words = [w for w in out_words if highlights.normalize(w.text) not in highlights.FILLERS]
        hls = []
        if st.highlight.enabled and out_words:
            hls = highlights.pick_keywords(out_words, cut_info.duration, st.highlight.per_minute,
                                           st.highlight.min_gap, opt.keywords)
            log.info("    urg'u: %s", ", ".join(h.word for h in hls) or "-")
        zoom = highlights.zoom_expression(hls, st.highlight.zoom, st.highlight.ramp, st.highlight.hold) \
            if st.highlight.enabled else "1"
        if st.look.punch > 0 and len(tl.segments) > 1:
            zoom = f"({zoom})*(1+{st.look.punch:.3f}*({punch_terms(tl)}))"
        if st.look.push > 0:
            # Kamera sekin yaqinlashadi (Ken Burns), urg'u zoomi ustiga ko'paytiriladi.
            zoom = f"({zoom})*(1+{st.look.push:.4f}*t/{max(cut_info.duration, 0.1):.3f})"
        srt = None
        if out_words:
            srt = subtitles.write_srt(out_words, opt.output_dir / f"{stem}.srt")

    with Step(5, total_steps, "Motion grafika (sarlavha, intro/outro, pastki yozuv)"):
        mc = st.motion
        text = MotionText(
            title=opt.title if opt.title is not None else auto_title(out_words, stem.replace("_", " ")),
            subtitle=opt.subtitle, name=opt.name, role=opt.role,
            handle=("@" + opt.handle.lstrip("@")) if opt.handle else "",
        )
        jobs: list[MotionJob] = []
        motion_cache: dict = {}
        main_d = cut_info.duration
        if mc.enabled:
            for fmt in st.formats:
                size, tag = FORMATS[fmt], fmt.replace(":", "x")
                if mc.intro and text.title:
                    jobs.append(MotionJob(fmt, "Intro", size, st.fps, mc.intro_duration, work / f"intro_{tag}"))
                if mc.outro:
                    jobs.append(MotionJob(fmt, "EndCard" if mc.outro_style == "endcard" else "Outro", size, st.fps, mc.outro_duration, work / f"outro_{tag}"))
                if mc.title_style == "expert":
                    from .expert import build_plan, load_plan, save_plan
                    if "plan" not in motion_cache:
                        avatar_rel = None
                        if opt.avatar:
                            import shutil as _sh
                            from .motion import REMOTION_DIR
                            dst = REMOTION_DIR / "public" / "user" / f"avatar{opt.avatar.suffix.lower()}"
                            dst.parent.mkdir(parents=True, exist_ok=True)
                            _sh.copyfile(opt.avatar, dst)
                            avatar_rel = f"user/{dst.name}"
                        plan = load_plan(opt.plan) if opt.plan else build_plan(
                            out_words, main_d, opt.title or "", opt.points, fx=mc.expert_fx, avatar=avatar_rel)
                        motion_cache["plan"] = plan
                        save_plan(plan, opt.output_dir / f"{stem}.plan.json")
                        log.info("    reja: %d element -> %s", len(plan), opt.output_dir / f"{stem}.plan.json")
                    from .expert import caption_top
                    from .reframe import reframe_filter
                    if not motion_cache["plan"]:
                        continue
                    if mc.text_y is not None:  # qo'lda berilgan (masalan B-roll montajida)
                        top = mc.text_y
                    else:
                        # Yuz o'rni aynan shu formatdagi kadrda aniqlanadi
                        probe_v = work / f"layout_{tag}.mp4"
                        ff.run(["-i", cut, "-t", "20", "-filter_complex",
                                reframe_filter(cut_info.width, cut_info.height, *size, st.reframe, opt.focus_x,
                                               "[0:v]", "[o]"), "-map", "[o]", "-an", "-c:v", "libx264",
                                "-preset", "ultrafast", "-crf", "28", probe_v])
                        top = caption_top(probe_v, *size)
                    log.info("    matn balandligi (%s): %.0f%%", fmt, top * 100)
                    if motion_cache["plan"]:  # bo'sh reja uchun overlay render qilinmaydi
                        jobs.append(MotionJob(fmt, "ExpertOverlay", size, st.fps, main_d, work / f"expert_{tag}",
                                              0.0, alpha=True, props={"items": motion_cache["plan"], "captionTop": top}))
                elif text.title and mc.title_style == "aesthetic":
                    jobs.append(MotionJob(fmt, "AestheticText", size, st.fps, main_d, work / f"title_{tag}",
                                          0.0, alpha=True))
                elif text.title and not mc.intro:
                    d = min(mc.title_duration, main_d - mc.title_start)
                    if d > 1:
                        comp = "CinematicTitle" if mc.title_style == "cinematic" else "TitleOverlay"
                        jobs.append(MotionJob(fmt, comp, size, st.fps, d, work / f"title_{tag}",
                                              mc.title_start, alpha=True))
                if text.name:
                    d = min(mc.lower_third_duration, main_d - mc.lower_third_start)
                    if d > 1:
                        jobs.append(MotionJob(fmt, "LowerThird", size, st.fps, d, work / f"lower_{tag}",
                                              mc.lower_third_start, alpha=True))
        rendered = render_motion(jobs, mc, text, work) if jobs else {}
        motion_assets: dict[str, dict] = {fmt: {"overlays": []} for fmt in st.formats}
        for i, j in enumerate(jobs):
            a = motion_assets[j.fmt]
            if j.alpha:
                a["overlays"].append(rendered[i])
            else:
                a["intro" if j.comp == "Intro" else "outro"] = rendered[i]

    with Step(6, total_steps, "Ovoz: tozalash, balans, fon musiqasi (ducking)"):
        voice = audio.clean_voice(cut, work / "voice.wav", st.audio)
        music = opt.music
        if opt.music_from:
            from .music import extract_instrumental, loop_to
            log.info("    musiqa referensdan ajratilmoqda: %s", opt.music_from.name)
            music = loop_to(extract_instrumental(opt.music_from, work / "music"), work / "music_bed.wav",
                            cut_info.duration + 10)
        probe_job = ComposeJob(cut, voice, work / "x.mp4", (cut_info.width, cut_info.height), (0, 0), st.fps,
                               cut_info.duration, intro=next((a.get("intro") for a in motion_assets.values()), None),
                               intro_duration=mc.intro_duration,
                               outro=next((a.get("outro") for a in motion_assets.values()), None),
                               outro_duration=mc.outro_duration, edge=st.transition.edge_duration)
        mixed = audio.mix(voice, work / "mix.wav", st.audio, total_duration(probe_job), main_offset(probe_job),
                          music)

    outputs: dict[str, Path] = {}
    with Step(7, total_steps, f"Render: {', '.join(st.formats)}"):
        for fmt in st.formats:
            size = FORMATS[fmt]
            tag = fmt.replace(":", "x")
            ass = None
            if st.captions.enabled and out_words:
                ass = subtitles.write_ass(out_words, st.captions, *size, work / f"captions_{tag}.ass")
            a = motion_assets[fmt]
            platform = "youtube" if fmt == "16:9" else "reels"
            job = ComposeJob(
                video=cut, audio=mixed, out=opt.output_dir / f"{stem}_{platform}_{tag}.mp4",
                src_size=(cut_info.width, cut_info.height), size=size, fps=st.fps,
                main_duration=cut_info.duration, reframe=st.reframe, focus_x=opt.focus_x,
                zoom_expr=zoom, ass=ass, overlays=a["overlays"],
                intro=a.get("intro"), intro_duration=mc.intro_duration,
                outro=a.get("outro"), outro_duration=mc.outro_duration,
                edge=st.transition.edge_duration, edge_type=st.transition.edge_type, crf=st.crf, preset=st.preset, workdir=work,
                look=look_filters(st.look, cut_info.duration),
            )
            outputs[fmt] = compose(job)
            log.info("    ✓ %s -> %s", fmt, outputs[fmt])

    if not opt.keep_temp:
        shutil.rmtree(work, ignore_errors=True)
    return Result(outputs, transcript_path, srt, info.duration, cut_info.duration, len(segments),
                  [h.word for h in hls])
