#!/usr/bin/env python3
"""Tuzatilgan matnni nutq vaqtlariga moslash.

Whisper o'zbekcha nutqni ko'pincha fonetik yozadi. Gaplarni adabiy tilda qayta yozib,
har biriga Whisper bergan vaqt oralig'ini qo'yasiz; skript so'zlarni shu oraliqdagi
nutq bo'laklariga taqsimlaydi.

Ishlatish:
    python tools/fix_transcript.py video.mp4 gaplar.json tuzatilgan.transcript.json
gaplar.json: [[boshlanish, tugash, "Gap matni."], ...]  (soniyalarda, asl video vaqti)
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from video_agent import ffmpeg_utils as ff, silence  # noqa: E402
from video_agent.expert import align_script  # noqa: E402
from video_agent.timeline import invert  # noqa: E402
from video_agent.transcribe import save_words  # noqa: E402


def main(video: str, sentences: str, out: str) -> None:
    dur = ff.probe(video).duration
    th = silence.auto_threshold(video)
    speech = [(s.start, s.end) for s in invert(silence.detect_silences(video, th, 0.15, dur), dur)]
    words = []
    for a, b, text in json.loads(Path(sentences).read_text(encoding="utf-8")):
        clipped = [(max(a, s), min(b, e)) for s, e in speech if min(b, e) - max(a, s) > 0.05] or [(a, b)]
        words += align_script(text, clipped)
    save_words(words, Path(out), "uz")
    print(f"{len(words)} so'z -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
