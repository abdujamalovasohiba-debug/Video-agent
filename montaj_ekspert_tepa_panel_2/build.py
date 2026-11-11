#!/usr/bin/env python3
"""50/50 Reels montaji: tepada ekspert (1080x960), pastda B-roll yoki grafik karta.

Ishlatish:
    python3 build.py <ekspert_tepa_panel.mp4> <versiya>   # masalan: v1

- Tepa panel: allaqachon kesilgan, crop va rang berilgan 1080x960 video.
- Past panel: har bo'lak uchun broll/segNN.mp4 bo'lsa o'sha, bo'lmasa
  Pexels kaliti (PEXELS_API_KEY yoki ~/.montajor/pexels_key.txt) bo'lsa
  avtomatik qidiradi, aks holda kalit iborali grafik karta qo'yadi.
- Subtitr: caps.ass, \\pos(540,960) - ikki panel tutashgan joyda.
"""
import json, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
WORK, BROLL, OUT, ASSETS = (ROOT / d for d in ("work", "broll", "out", "assets"))
FPS = 30
W, H = 1080, 960
FONT_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
FONT_M = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
GRADE = ("eq=contrast=1.07:saturation=1.12:gamma=1.03,"
         "colorbalance=rm=-0.02:bm=0.03:rh=-0.02:bh=0.04,unsharp=5:5:0.5")

# (boshi, oxiri — kesilgan video vaqti; Pexels qidiruvi; karta: katta matn, kichik matn)
PLAN = [
    (0.00, 11.23, "couple therapy", "Psixologik suhbat", "o'zlari tushunib yetadi"),
    (11.23, 15.07, "woman peaceful window", "O'zi qaror qildi", "va baxtli bo'ldi"),
    (15.07, 23.20, "couple calm conversation", "Do'stona ajrashish", "xatoni tushunib, anglab"),
    (23.20, 30.33, "parents arguing child", "Nafrat bolaga o'tadi", "do'stona ajrashmasa"),
    (30.33, 35.80, "sad child window", "Ota-ona bor", "ketib qolmaydi"),
    (35.80, 43.53, "father and child", "Otasi ham, onasi ham", "mehr beradi"),
    (43.53, 47.20, "child between parents", "Bolani bahona qilmang", "o'rtaga qo'ymang"),
    (47.20, None, "happy family", "Muhabbat bor joyda", "baxt bor"),
]
# Kartalar foni: xotirjam, psixologiya mavzusiga mos (to'q ko'k-yashil / iliq qum)
PALETTES = [((22, 52, 64), (46, 110, 112)), ((70, 52, 44), (150, 112, 84))]


def run(cmd):
    print("+", " ".join(map(str, cmd))[:200])
    subprocess.run(list(map(str, cmd)), check=True)


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", str(path)])
    return float(out)


# ---------- Pexels ----------
def pexels_key():
    k = os.environ.get("PEXELS_API_KEY")
    p = Path.home() / ".montajor" / "pexels_key.txt"
    if not k and p.exists():
        k = p.read_text().strip()
    return k


def pexels_fetch(query, dest, min_len):
    import requests
    key = pexels_key()
    if not key:
        return False
    try:
        r = requests.get("https://api.pexels.com/videos/search",
                         params={"query": query, "per_page": 8, "orientation": "landscape"},
                         headers={"Authorization": key}, timeout=30)
        r.raise_for_status()
    except Exception as e:  # tarmoq yoki kalit muammosi — karta qo'yiladi
        print("Pexels xato:", e)
        return False
    for v in r.json().get("videos", []):
        if v.get("duration", 0) < min_len:
            continue
        files = [f for f in v["video_files"] if f.get("file_type") == "video/mp4"
                 and 1280 <= (f.get("width") or 0) <= 1920]
        if not files:
            continue
        f = max(files, key=lambda f: f["width"])
        data = requests.get(f["link"], timeout=120).content
        dest.write_bytes(data)
        with open(OUT / "broll_manbalar.txt", "a") as fh:
            fh.write(f"{dest.name}\t{query}\t{v['url']}\t{v['user']['name']}\n")
        return True
    return False


# ---------- Grafik karta ----------
def make_card(i, big, small):
    top, bot = PALETTES[i % 2]
    bw = W + 240  # sekin siljish uchun keng fon
    bg = Image.new("RGB", (bw, H))
    px = bg.load()
    for y in range(H):
        for x in range(bw):
            t = (0.65 * y / H + 0.35 * x / bw)
            px[x, y] = tuple(int(a + (b - a) * t) for a, b in zip(top, bot))
    glow = Image.new("L", (bw, H), 0)
    d = ImageDraw.Draw(glow)
    d.ellipse((bw * 0.15, H * 0.30, bw * 0.75, H * 1.05), fill=70)
    d.ellipse((bw * 0.55, H * 0.05, bw * 1.05, H * 0.55), fill=40)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    bg = Image.composite(Image.new("RGB", (bw, H), (255, 236, 205)), bg, glow)
    bg.save(ASSETS / f"card{i:02d}_bg.png")

    fg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(fg)
    size = 92
    fb = ImageFont.truetype(FONT_B, size)
    while d.textlength(big, font=fb) > W - 140:
        size -= 4
        fb = ImageFont.truetype(FONT_B, size)
    fs = ImageFont.truetype(FONT_M, 50)
    cy = 560  # subtitr panel tepasida (y≈0-70), matn pastroqda
    d.rounded_rectangle((W / 2 - 40, cy - 120, W / 2 + 40, cy - 112), radius=4, fill=(255, 215, 0, 255))
    d.text((W / 2, cy), big, font=fb, fill=(255, 255, 255, 255), anchor="ms")
    d.text((W / 2, cy + 80), small, font=fs, fill=(255, 255, 255, 215), anchor="ms")
    shadow = fg.split()[3].filter(ImageFilter.GaussianBlur(8)).point(lambda a: a * 0.45)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.paste((0, 0, 0, 255), (0, 0), shadow)
    out.alpha_composite(fg)
    out.save(ASSETS / f"card{i:02d}_fg.png")


def render_card(i, dur, dest):
    run(["ffmpeg", "-v", "error", "-y",
         "-loop", "1", "-framerate", FPS, "-i", ASSETS / f"card{i:02d}_bg.png",
         "-loop", "1", "-framerate", FPS, "-i", ASSETS / f"card{i:02d}_fg.png",
         "-filter_complex",
         f"[0]crop={W}:{H}:'min(240,t*{240 / max(dur, 1):.3f})':0[b];"
         f"[1]format=rgba,fade=in:st=0.15:d=0.5:alpha=1[f];"
         f"[b][f]overlay=0:0,format=yuv420p",
         "-t", f"{dur:.3f}", "-r", FPS, "-c:v", "libx264", "-crf", "12", "-preset", "fast", dest])


def render_broll(src, dur, dest):
    run(["ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-i", src, "-an",
         "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},"
                f"{GRADE},setsar=1,format=yuv420p",
         "-t", f"{dur:.3f}", "-c:v", "libx264", "-crf", "12", "-preset", "fast", dest])


def main():
    top, ver = Path(sys.argv[1]), sys.argv[2]
    for d in (WORK, BROLL, OUT, ASSETS):
        d.mkdir(exist_ok=True)
    total = duration(top)
    parts, used = [], []
    for i, (a, b, query, big, small) in enumerate(PLAN):
        b = total if b is None else b
        dur = round((b - a) * FPS) / FPS
        seg = WORK / f"bottom{i:02d}.mp4"
        clip = BROLL / f"seg{i:02d}.mp4"
        if clip.exists() or pexels_fetch(query, clip, dur):
            render_broll(clip, dur, seg)
            used.append(f"{a:5.2f}-{b:5.2f}  B-roll  {clip.name}")
        else:
            make_card(i, big, small)
            render_card(i, dur, seg)
            used.append(f"{a:5.2f}-{b:5.2f}  karta   {big} / {small}")
        parts.append(seg)
    (WORK / "bottom.txt").write_text("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", WORK / "bottom.txt",
         "-c", "copy", WORK / "bottom.mp4"])

    dest = OUT / f"{top.stem}_{ver}.mp4"
    ass = str(ROOT / "caps.ass").replace(":", "\\:")
    run(["ffmpeg", "-v", "error", "-y", "-i", top, "-i", WORK / "bottom.mp4",
         "-filter_complex",
         f"[0:v]fps={FPS},scale={W}:{H},setsar=1[t];[1:v]fps={FPS},setsar=1[b];"
         f"[t][b]vstack=inputs=2,ass='{ass}':fontsdir=/usr/share/fonts/opentype/inter,"
         f"format=yuv420p[v];"
         f"[0:a]highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
         "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "12M", "-bufsize", "24M",
         "-r", FPS, "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", dest])
    (OUT / f"{top.stem}_{ver}_past_panel.txt").write_text("\n".join(used) + "\n")
    print("\n".join(used))
    print("TAYYOR:", dest)


if __name__ == "__main__":
    main()
