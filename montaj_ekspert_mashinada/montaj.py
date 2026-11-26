#!/usr/bin/env python3
"""Spina bifida / homiladorlikda vitamin — 50/50 Reels montaji.

Ishlatish: python3 montaj.py <versiya>
Kirish: work/full.mov (6 ta iPhone bo'lagi birlashtirilgan, 102.5 s), broll/raw_bNN.mp4.
"""
import subprocess, sys, textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORK, OUT, BROLL = ROOT / "work", ROOT / "out", ROOT / "broll"
SRC = WORK / "full.mov"
FPS = 30
GRADE = ("eq=contrast=1.07:saturation=1.12:gamma=1.03,"
         "colorbalance=rm=-0.02:bm=0.03:rh=-0.02:bh=0.04,unsharp=5:5:0.5")
MID = "crop=1080:960:0:250"
CLOSE = "crop=828:736:80:250,scale=1080:960"
JUNCTIONS = [19.433, 38.700, 58.767, 78.874, 97.574]  # iPhone fayllari tutashgan joylar

# Nutq bo'laklari (asl vaqt) va tozalangan matn. *so'z* — sariq kalit so'z.
SEGS = [
    (0.00, 6.94, "Yoshligidan ikki yoshgacha davom etayotgan holat bo'lganligi uchun, men *spina bifidaga* yuborgandim."),
    (7.27, 17.12, "Ulardan spina bifida aniqlangani uchun, tug'ilish jarayonini so'radim, ya'ni homiladorlik payti ona homilani qanday holatda ko'targanini so'radim."),
    (17.22, 21.09, "Ular menga aytdilarki, homiladorlik payti birinchi navbatda"),
    (21.20, 24.93, "yaxshi ovqatlanmaganman, *och qolgan* kunlarim bo'ldi"),
    (25.28, 30.54, "va bolamga yetarlicha *vitaminlarni* yetkazib berolmaganman. Sababi,"),
    (30.91, 34.52, "kalsiy ichasan, deb ginekolog aytgan payti"),
    (34.71, 36.17, "qaynonalari: «Yo'q,"),
    (36.31, 42.26, "biz ham kalsiy, vitamin ichmasdan bolamizni sopa-sog'lom tug'ganmiz,"),
    (42.38, 47.10, "buni siz ham ichmasangiz bo'ladi», degan gapni gapirganlar. Hurmatli *qaynonajonlar,*"),
    (47.21, 54.64, "hozirgi muhit bilan oldingi muhitni *taqqoslashni* to'xtating, iltimos qilaman. Ba'zi bir qaynonalarga tegishli bu gapim."),
    (54.84, 58.22, "Sababi, oldingi payt bilan hozirgi paytda"),
    (58.33, 78.04, "*90 foiz* o'zgarish bor. Shuning uchun iltimos qilardim: kelinlaringizga vaqtida o'sha vitaminlarni ichishga qo'yib bering. Sababi, spina bifida — bu *tug'ma* kasallik. Nimagaki, o'sha paytda ona homiladorlik paytida kalsiyni vaqtida ichmagani sabab"),
    (78.17, 80.67, "bolada spina bifida vujudga keladi."),
    (80.97, 88.21, "Mana endi nima bo'ldi? O'sha paytda berilmagan kalsiy hozir *ikki barobar* qimmatga aylanib, bolani"),
    (88.33, 94.00, "bosqichma-bosqich, qancha pul sarflab, aynan spina bifidadan davolashga to'g'ri keladi."),
    (94.18, 96.52, "Shuni yana takrorlardimki,"),
    (96.68, 101.93, "homiladorlik paytida kerakli *vitaminlarni* ichishga to'sqinlik qilmasangizlar, juda ham xohlardim."),
]
EXTRA_SPLITS = [66.0, 72.0]  # uzun bo'lakda plan almashinuvi

# B-roll rejasi (kesilgan video vaqti): (boshi, oxiri, klip, klipdan boshlanish) yoki karta
BPLAN = [
    (0.00, 6.94, "b00", 2.0),     # shifokor ona va qiz bilan
    (6.94, 16.79, "b01", 3.0),    # homilador ayol UZI'da
    (16.79, 24.39, "b02", 0.0),   # homilador ayol qorni
    (24.39, 29.65, "b03", 1.0),   # homilador ayol vitamin ichmoqda
    (29.65, 33.26, "b04", 2.0),   # ginekolog qabulida
    (33.26, 39.00, "b05", 3.0),   # keksa ayol
    (39.00, 45.39, "b06", 2.0),   # buvi va nevara
    (45.39, 56.20, "card", ("Hurmatli qaynonajonlar!", "oldingi va hozirgi davr boshqa")),
    (56.20, 62.00, "b07", 0.5),   # homilador ayol salat tayyorlamoqda
    (62.00, 68.00, "b08", 1.0),   # homilador ayol vitamin olmoqda
    (68.00, 72.50, "b09", 1.0),   # chaqaloq oyoqlari
    (72.50, 78.41, "b10", 1.0),   # chaqaloq barmoqni ushlamoqda
    (78.41, 85.65, "b11", 2.0),   # pul sanash
    (85.65, 91.32, "b12", 2.0),   # shifokor bola bilan
    (91.32, None, "b13", 9.0),    # baxtli homilador ayol deraza oldida
]


def run(cmd):
    subprocess.run(list(map(str, cmd)), check=True)


def pieces():
    """Nutq bo'laklarini fayl tutashgan joylar va qo'shimcha nuqtalarda bo'lib, crop navbatini beradi."""
    cuts = sorted(JUNCTIONS + EXTRA_SPLITS)
    out = []
    for a, b, _ in SEGS:
        pts = [a] + [c for c in cuts if a + 0.5 < c < b - 0.5] + [b]
        for x, y in zip(pts, pts[1:]):
            out.append((x, y))
    # Foydalanuvchi so'rovi: yaqinlashish kerak emas — butun video bir xil uzoq (o'rta) planda.
    return [(a, b, MID) for a, b in out]


def build_top():
    parts = []
    t = 0
    for i, (a, b, crop) in enumerate(pieces()):
        n = round(b * FPS) - round(a * FPS)
        d = n / FPS
        f = WORK / f"top{i:02d}.mov"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", SRC, "-t", f"{d:.4f}",
             "-vf", f"{crop},{GRADE},setsar=1,format=yuv420p", "-frames:v", n, "-r", FPS,
             "-af", f"afade=t=in:d=0.02,afade=t=out:st={d - 0.02:.4f}:d=0.02",
             "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-c:a", "pcm_s16le", "-ar", 48000, f])
        parts.append(f)
        t += d
    (WORK / "top.txt").write_text("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", WORK / "top.txt",
         "-c", "copy", WORK / "top.mov"])
    return t


def seg_times():
    """Har nutq bo'lagining kesilgan videodagi boshlanish/oxiri."""
    res, t = [], 0.0
    for a, b, txt in SEGS:
        d = sum(round(y * FPS) - round(x * FPS) for x, y, _ in pieces() if a <= x and y <= b) / FPS
        res.append((t, t + d, txt))
        t += d
    return res


def ass_time(s):
    h, s = divmod(s, 3600)
    m, s = divmod(s, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def lines_of(txt):
    words, lines, cur = txt.split(), [], []
    for w in words:
        plain = " ".join(cur + [w]).replace("*", "")
        if cur and (len(plain) > 30 or len(cur) >= 6):
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        if lines and len(cur) == 1:
            lines[-1].append(cur[0])
        else:
            lines.append(cur)
    return lines


def styled(words, on=False):
    """Satrni ASS rang teglari bilan qaytaradi; kalit so'z keyingi satrga o'tsa ham davom etadi."""
    prefix = "{\\c&H00D7FF&}" if on else ""
    out = []
    for w in words:
        s = w
        if s.startswith("*"):
            s = "{\\c&H00D7FF&}" + s[1:]
            on = True
        if on and s.endswith("*"):
            s = s[:-1] + "{\\c&HFFFFFF&}"
            on = False
        out.append(s)
    return prefix + " ".join(out), on


def write_ass():
    ev = []
    for t0, t1, txt in seg_times():
        ls = lines_of(txt)
        total = sum(len(" ".join(l).replace("*", "")) for l in ls)
        t = t0
        on = False
        for l in ls:
            txt_l, on = styled(l, on)
            d = (t1 - t0) * len(" ".join(l).replace("*", "")) / total
            ev.append(f"Dialogue: 0,{ass_time(t)},{ass_time(t + d)},Cap,,0,0,0,,"
                      f"{{\\pos(540,960)\\fad(60,40)}}{txt_l}")
            t += d
    head = textwrap.dedent("""\
        [Script Info]
        ScriptType: v4.00+
        PlayResX: 1080
        PlayResY: 1920
        WrapStyle: 2

        [V4+ Styles]
        Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
        Style: Cap,Inter,54,&H00FFFFFF,&H00FFFFFF,&H00201A15,&H00201A15,-1,0,0,0,100,100,0,0,3,18,0,5,40,40,0,1

        [Events]
        Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
        """)
    (ROOT / "caps.ass").write_text(head + "\n".join(ev) + "\n")
    # Oddiy matn ham — tekshirish uchun
    (OUT / "matn.txt").write_text("\n".join(f"[{ass_time(a)}] {t.replace('*', '')}" for a, _, t in seg_times()) + "\n")


def build_bottom(total):
    sys.path.insert(0, str(ROOT.parent / "montaj_ekspert_tepa_panel_2"))
    import build as B  # karta chizish funksiyalari
    B.ASSETS = ROOT / "assets"
    parts = []
    for i, (a, b, clip, arg) in enumerate(BPLAN):
        b = total if b is None else b
        d = (round(b * FPS) - round(a * FPS)) / FPS
        f = WORK / f"bot{i:02d}.mp4"
        if clip == "card":
            B.make_card(i, *arg)
            B.render_card(i, d, f)
        else:
            slow = "setpts=1.25*PTS," if clip == "b02" else ""  # qisqa klip — sekinlashtirish
            run(["ffmpeg", "-v", "error", "-y", "-ss", arg, "-stream_loop", "-1", "-i", BROLL / f"raw_{clip}.mp4", "-an",
                 "-vf", f"{slow}scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,fps={FPS},"
                        f"{GRADE},setsar=1,format=yuv420p",
                 "-frames:v", round(d * FPS), "-c:v", "libx264", "-crf", "12", "-preset", "fast", f])
        parts.append(f)
    (WORK / "bot.txt").write_text("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", WORK / "bot.txt",
         "-c", "copy", WORK / "bottom.mp4"])


def main():
    ver = sys.argv[1]
    OUT.mkdir(exist_ok=True)
    if "--faqat-yakun" in sys.argv:  # tepa/past panel tayyor bo'lsa, faqat subtitr va eksport
        total = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                               "-of", "csv=p=0", str(WORK / "top.mov")]))
        write_ass()
    elif "--faqat-tepa" in sys.argv:  # past panel o'zgarmagan bo'lsa
        total = build_top()
        write_ass()
    else:
        total = build_top()
        write_ass()
        build_bottom(total)
    run(["python3", "-I", ROOT.parent / "montaj_ekspert_tepa_panel_2" / "music.py", f"{total:.2f}", WORK / "music.wav"])
    ass = str(ROOT / "caps.ass")
    dest = OUT / f"spina_bifida_{ver}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", WORK / "top.mov", "-i", WORK / "bottom.mp4", "-i", WORK / "music.wav",
         "-filter_complex",
         f"[0:v][1:v]vstack=inputs=2,ass='{ass}':fontsdir=/usr/share/fonts/opentype/inter,format=yuv420p[v];"
         "[0:a]highpass=f=80,afftdn=nf=-30,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,asplit=2[sp][sc];"
         "[2:a]loudnorm=I=-31:TP=-6:LRA=7,aresample=48000,volume=2dB[m];"
         "[m][sc]sidechaincompress=threshold=0.03:ratio=4:attack=80:release=600[md];"
         "[sp][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.84:level=false[a]",
         "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "12M", "-bufsize", "24M",
         "-r", FPS, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "320k", "-ar", 48000,
         "-movflags", "+faststart", dest])
    print("TAYYOR:", dest, f"{total:.2f}s")


if __name__ == "__main__":
    main()
