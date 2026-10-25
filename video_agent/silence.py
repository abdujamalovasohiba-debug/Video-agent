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


def auto_threshold(media: str | Path) -> float:
    """Ovoz darajasiga qarab jimlik chegarasini tanlaydi (past yozilgan videolar uchun muhim).

    50 ms bo'laklar RMS'i: 15-persentil ~ fon shovqini, 75-persentil ~ nutq.
    Chegara ularning orasida, shovqinga yaqinroq bo'ladi.
    """
    import subprocess

    proc = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(media), "-vn", "-af",
         "aresample=48000,asetnsamples=2400,astats=metadata=1:reset=1,"
         "ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    vals = sorted(float(v) for v in re.findall(r"RMS_level=(-?[\d.]+)", proc.stdout))
    if len(vals) < 20:
        return -35.0
    noise, speech = vals[int(len(vals) * 0.15)], vals[int(len(vals) * 0.75)]
    return round(max(-70.0, min(-25.0, noise + (speech - noise) * 0.6)), 1)
