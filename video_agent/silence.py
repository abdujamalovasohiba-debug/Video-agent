"""Jim joylarni ffmpeg silencedetect bilan aniqlash."""

from __future__ import annotations

import re
from pathlib import Path

from . import ffmpeg_utils as ff

_START = re.compile(r"silence_start:\s*(-?[\d.]+)")
_END = re.compile(r"silence_end:\s*(-?[\d.]+)")


def parse_silencedetect(log: str, duration: float) -> list[tuple[float, float]]:
    silences, start = [], None
    for line in log.splitlines():
        if m := _START.search(line):
            start = max(0.0, float(m.group(1)))
        elif (m := _END.search(line)) and start is not None:
            silences.append((start, float(m.group(1))))
            start = None
    if start is not None:  # video jimlik bilan tugaydi
        silences.append((start, duration))
    return silences


def detect_silences(media: str | Path, noise_db: float, min_silence: float, duration: float) -> list[tuple[float, float]]:
    log = ff.run_stderr([
        "-i", media, "-vn", "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}", "-f", "null", "-",
    ])
    return parse_silencedetect(log, duration)
