#!/usr/bin/env python3
"""Tepa panelni (1080x960) asl iPhone fayllaridan qayta kesish.

Asl yozuv uch faylga bo'lingan; ovoz korrelyatsiyasi bo'yicha har fayl boshining
asl videodagi vaqti: IMG_8568 = 8.786 s, IMG_8569 = 23.890 s, IMG_8570 = 44.077 s.
Asl videoning 0-8.79 s qismi bu fayllarda yo'q, u joyga eski panel qo'yiladi.

Ishlatish: python3 top_panel.py <uploads_papka> <eski_panel.mp4> <chiqish.mp4>
"""
import subprocess, sys
from pathlib import Path

FPS = 30
GRADE = ("eq=contrast=1.07:saturation=1.12:gamma=1.03,"
         "colorbalance=rm=-0.02:bm=0.03:rh=-0.02:bh=0.04,unsharp=5:5:0.5")
MID = "crop=1080:960:0:150"                     # o'rta plan, bosh tepasida joy bor
CLOSE = "crop=828:736:150:160,scale=1080:960"   # yaqin plan ~1.3x, yuz markazda
OFF = {"8568": 8.786, "8569": 23.890, "8570": 44.077}

# (tepa panel boshi, oxiri, manba, asl videodagi vaqt, crop)
PIECES = [
    (0.00, 8.04, "old", 0.00, None),
    (8.04, 11.17, "8568", 8.79, CLOSE),
    (11.17, 14.95, "8568", 12.59, MID),
    (14.95, 20.28, "8568", 17.41, CLOSE),
    (20.28, 20.83, "8568", 23.37, MID),
    (20.83, 23.04, "8569", 23.92, MID),
    (23.04, 30.16, "8569", 26.63, CLOSE),
    (30.16, 35.62, "8569", 34.28, MID),
    (35.62, 39.65, "8569", 40.05, CLOSE),
    (39.65, 43.35, "8570", 44.08, CLOSE),
    (43.35, 46.96, "8570", 48.87, MID),
    (46.96, None, "8570", 54.08, CLOSE),
]


def main():
    up, old, dest = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    work = dest.parent / "top_pieces"
    work.mkdir(exist_ok=True)
    total_frames = int(round(float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(old)])) * FPS))
    files = []
    for i, (a, b, src, orig, crop) in enumerate(PIECES):
        fa = round(a * FPS)
        fb = total_frames if b is None else round(b * FPS)
        n = fb - fa
        out = work / f"p{i:02d}.mp4"
        if src == "old":
            inp, ss, vf = old, a, "setsar=1"
        else:
            inp = next(up.glob(f"*IMG_{src}.MOV"))
            ss, vf = orig - OFF[src], f"{crop},{GRADE},setsar=1"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(ss, 0):.3f}", "-i", str(inp), "-an",
                        "-vf", f"fps={FPS},{vf},format=yuv420p", "-frames:v", str(n),
                        "-c:v", "libx264", "-crf", "12", "-preset", "fast", str(out)], check=True)
        files.append(out)
    (work / "list.txt").write_text("".join(f"file '{f.resolve()}'\n" for f in files))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(work / "list.txt"),
                    "-i", str(old), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy", str(dest)],
                   check=True)
    print("TAYYOR:", dest)


if __name__ == "__main__":
    main()
