#!/usr/bin/env python3
"""B-roll ketma-ketligini yig'ish (yuzsiz montaj uchun).

Har bir kadr 1080x1920 ga qirqiladi (focus_x - gorizontal markaz), sekin yaqinlashadi
va kerakli uzunlikka moslanadi (kalta bo'lsa sekinlashtiriladi yoki takrorlanadi).

Ishlatish:
    python tools/build_broll.py spec.json clips_dir total_seconds out.mp4
spec.json: [[boshlanish, "klip_nomi.mp4", focus_x], ...]  - har kadr keyingisigacha davom etadi
"""

import json
import subprocess
import sys
from pathlib import Path

W, H, FPS = 1080, 1920, 30


def probe_duration(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def shot(src: Path, dur: float, focus_x: float, out: Path) -> None:
    have = probe_duration(src) - 0.3
    speed = 1.0
    loop = []
    if have < dur:
        speed = max(have / dur, 0.67)          # 1.5 barobargacha sekinlashtirish
        if have / speed < dur:
            loop = ["-stream_loop", "-1"]
    fx = min(max(focus_x, 0.0), 1.0)
    frames = max(1, round(dur * FPS))
    vf = (f"setpts=PTS/{speed:.4f},fps={FPS},"
          f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
          f"crop={W}:{H}:(iw-{W})*{fx:.3f}:(ih-{H})/2,"
          # sekin yaqinlashish 1.00 -> 1.06
          f"scale=w='trunc({W}*(1+0.06*n/{frames})/2)*2':h='trunc({H}*(1+0.06*n/{frames})/2)*2':eval=frame,"
          f"crop={W}:{H}:x='(in_w-{W})/2':y='(in_h-{H})/2',setsar=1,format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *loop, "-ss", "0.3", "-i", str(src), "-an", "-vf", vf,
                    "-frames:v", str(frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", str(out)],
                   check=True)


def main(spec_path: str, clips_dir: str, total: str, out: str) -> None:
    spec = json.loads(Path(spec_path).read_text())
    total_s = float(total)
    work = Path(out).with_suffix("")
    work.mkdir(parents=True, exist_ok=True)
    parts = []
    for i, (start, name, fx) in enumerate(spec):
        end = spec[i + 1][0] if i + 1 < len(spec) else total_s
        p = work / f"shot_{i:03d}.mp4"
        shot(Path(clips_dir) / name, end - start, fx, p)
        parts.append(p)
        print(f"{start:7.2f}-{end:7.2f}  {name}")
    lst = work / "list.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", out],
                   check=True)


if __name__ == "__main__":
    main(*sys.argv[1:5])
