"""Integratsion testlar: haqiqiy ffmpeg bilan to'liq oqim (Remotion'siz, tez)."""

import shutil
import subprocess
from pathlib import Path

import pytest

from agent import main
from video_agent import transcribe
from video_agent.transcribe import Word

from make_sample import make

pytestmark = pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg kerak")


def probe(path: Path) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration",
                          "-of", "default=nw=1", str(path)], capture_output=True, text=True, check=True).stdout
    vals: dict = {}
    for line in out.splitlines():
        k, v = line.split("=", 1)
        vals.setdefault(k, v)
    return vals


@pytest.fixture(scope="module")
def sample(tmp_path_factory):
    d = tmp_path_factory.mktemp("sample")
    make(d)
    return d


def test_full_pipeline_both_formats(sample, tmp_path):
    out = tmp_path / "out"
    rc = main([str(sample / "sample.mp4"), "--style", "reels", "--renderer", "ffmpeg", "--draft",
               "--transcript", str(sample / "sample.transcript.json"), "--music", str(sample / "music.mp3"),
               "--name", "Ali Valiyev", "--role", "Bloger", "-o", str(out)])
    assert rc == 0
    yt, reels = out / "sample_youtube_16x9.mp4", out / "sample_reels_9x16.mp4"
    assert (out / "sample.srt").exists()
    p1, p2 = probe(yt), probe(reels)
    assert (p1["width"], p1["height"]) == ("1920", "1080")
    assert (p2["width"], p2["height"]) == ("1080", "1920")
    # 16s video: pauzalar kesiladi (+2.5s intro +3s outro -1s o'tishlar)
    assert 11.0 < float(p1["duration"]) < 15.5
    assert not any(out.glob(".*_work")), "vaqtinchalik fayllar o'chirilishi kerak"


def test_no_cut_no_motion_single_format(sample, tmp_path):
    out = tmp_path / "out"
    rc = main([str(sample / "sample.mp4"), "--style", "minimal", "--formats", "9:16", "--no-cut", "--no-motion",
               "--draft", "--transcript", str(sample / "sample.transcript.json"), "-o", str(out)])
    assert rc == 0
    p = probe(out / "sample_reels_9x16.mp4")
    assert abs(float(p["duration"]) - 16.0) < 0.6


def test_whisper_backend_is_used_and_transliterated(sample, tmp_path, monkeypatch):
    calls = {}

    def fake(audio, model, language, device):
        calls["args"] = (model, language)
        return [Word("Ассалому", 0.7, 1.1), Word("алайкум", 1.15, 1.6), Word("дўстлар!", 1.7, 2.2)]

    monkeypatch.setattr(transcribe, "_faster_whisper", fake)
    out = tmp_path / "out"
    rc = main([str(sample / "sample.mp4"), "--formats", "16:9", "--no-motion", "--draft", "--model", "small",
               "-o", str(out)])
    assert rc == 0
    assert calls["args"] == ("small", "uz")
    words = transcribe.load_words(out / "sample.transcript.json")
    assert [w.text for w in words] == ["Assalomu", "alaykum", "doʻstlar!"]


def test_missing_file_returns_error(tmp_path):
    assert main([str(tmp_path / "yoq.mp4"), "-o", str(tmp_path)]) == 1
