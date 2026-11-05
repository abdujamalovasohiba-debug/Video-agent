"""Sinov uchun namuna video yaratadi: nutq (flite TTS) + uzun pauzalar + shovqin.

Ishlatish: python tests/make_sample.py out_dir [--vertical]
Natija: sample.mp4, sample.transcript.json (taxminiy so'z vaqtlari), music.mp3
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

PHRASES = [
    "Hello friends, welcome to my channel",
    "Today we talk about video editing",
    "This agent removes silence automatically",
    "Subscribe and share with your friends",
]
PAUSE = 1.4  # bo'laklar orasidagi jimlik (s)


def sh(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)], check=True)


def dur(path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def make(out_dir: Path, vertical: bool = False, with_music: bool = True) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    parts, words, t = [], [], 0.6
    lead = out_dir / "lead.wav"
    sh("-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", "0.6", lead)
    parts.append(lead)
    for i, text in enumerate(PHRASES):
        p = out_dir / f"p{i}.wav"
        sh("-f", "lavfi", "-i", f"flite=text='{text}':voice=slt", "-ar", "48000", "-ac", "1", p)
        d = dur(p)
        toks = text.replace(",", "").split()
        # So'z vaqtlarini harflar soniga mutanosib taqsimlaymiz (taxminiy).
        total = sum(len(w) for w in toks)
        cur = t + 0.05
        span = d - 0.15
        for w in toks:
            wd = span * len(w) / total
            words.append({"text": w, "start": round(cur, 3), "end": round(cur + wd * 0.9, 3), "probability": 0.9})
            cur += wd
        parts.append(p)
        t += d
        if i < len(PHRASES) - 1:
            s = out_dir / f"s{i}.wav"
            sh("-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", PAUSE, s)
            parts.append(s)
            t += PAUSE
    lst = out_dir / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    speech = out_dir / "speech.wav"
    sh("-f", "concat", "-safe", "0", "-i", lst, speech)
    total = dur(speech) + 0.8
    size = "1080x1920" if vertical else "1920x1080"
    video = out_dir / "sample.mp4"
    sh("-f", "lavfi", "-i", f"testsrc2=s={size}:r=30:d={total}",
       "-i", speech,
       "-f", "lavfi", "-i", f"anoisesrc=c=pink:a=0.004:d={total}:r=48000",
       "-filter_complex", "[1:a]apad[s];[s][2:a]amix=inputs=2:duration=shortest:normalize=0[a]",
       "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-t", total, video)
    (out_dir / "sample.transcript.json").write_text(json.dumps(
        {"language": "en", "words": words}, ensure_ascii=False, indent=1))
    if with_music:
        sh("-f", "lavfi", "-i", "sine=f=220:d=6", "-f", "lavfi", "-i", "sine=f=330:d=6",
           "-filter_complex", "[0][1]amix=inputs=2,volume=4,aecho=0.8:0.7:300:0.3", "-ac", "2",
           out_dir / "music.mp3")
    for p in parts + [lst, speech]:
        p.unlink()
    return video


if __name__ == "__main__":
    print(make(Path(sys.argv[1] if len(sys.argv) > 1 else "sample"), "--vertical" in sys.argv))
