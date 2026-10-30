#!/usr/bin/env python3
"""Reels montaji: pauzalarni kesish + punch-in zoom + so'zma-so'z subtitr + raqamli kartalar.

Foydalanish: python3 build.py project.json out_dir fonts_dir
"""
import json, os, re, subprocess, sys

W, H, FPS = 1080, 1920, 30
BROWN = "&H00122645&"      # #452612
YELLOW = "&H001CB2F2&"     # #F2B21C
WHITE = "&H00FFFFFF&"
CARD_BG = "&H00FCFCFC&"

# Pauza kesish sozlamalari: gap oxiridan TAIL, keyingi gap boshidan LEAD qoldiriladi
SIL_DB, SIL_MIN = -40, 0.55
TAIL, LEAD, MIN_CUT, MIN_SEG = 0.3, 0.2, 0.25, 1.2


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout
    return float(out.strip())


def rms_db(path, a, b):
    """[a, b] oraliqdagi o'rtacha ovoz balandligi, dB."""
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-t", str(max(b - a, 0.02)), "-i", path,
                          "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9) if len(x) else -120.0


def speech_segments(path):
    """Ovoz bor bo'laklar (src_start, src_end).

    Faqat uzun pauzalar kesiladi: gap oxiridan TAIL qoldiriladi (so'zning so'nggi
    tovushi yutilmasin), MIN_SEG dan qisqa bo'lak hosil qiladigan kesish tashlanadi.
    """
    err = run(["ffmpeg", "-i", path, "-af", f"silencedetect=n={SIL_DB}dB:d={SIL_MIN}", "-f", "null", "-"]).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", err)]
    dur = duration(path)
    ends += [dur] * (len(starts) - len(ends))
    cuts = []
    for s, e in zip(starts, ends):
        a, b = s + TAIL, e - LEAD
        # klip boshidagi shovqin/sukut: klipning umumiy ovozidan ancha past bo'lsagina kesiladi
        if not cuts and s < 0.7 and rms_db(path, 0, s) < rms_db(path, 0, dur) - 12:
            a = 0.0
        if e >= dur - 0.4:            # klip oxiridagi sukut
            b = dur
        if b - a >= MIN_CUT:
            cuts.append((max(a, 0.0), min(b, dur)))
    segs, cur = [], 0.0
    for a, b in cuts:
        if a <= 0.01:          # klip boshidagi sukut
            cur = b
            continue
        if a - cur < MIN_SEG and b < dur - 0.01:   # juda qisqa bo'lak hosil qilmaslik
            continue
        segs.append((cur, a))
        cur = b
    if dur - cur > 0.1:
        segs.append((cur, dur))
    return [(round(a, 3), round(b, 3)) for a, b in segs if b - a > 0.15]


ZOOM_EVERY = 2.5  # uzun bo'lakda zoom shu oraliqdan keyin, yangi jumla boshida almashadi


class Timeline:
    def __init__(self, clips, splits=None, ends=None):
        """splits: {clip_no: [jumla boshlanish vaqtlari]} - vaqt kesilmaydi, faqat zoom almashadi.
        ends: {clip_no: soniya} - klipni shu joyda tugatish (yozuv chala gap bilan tugaganda)."""
        self.segs = []  # (clip_no, src_start, src_end, out_start)
        t = 0.0
        for ci, path in enumerate(clips, 1):
            end = (ends or {}).get(str(ci))
            for a, b in speech_segments(path):
                if end is not None:
                    if a >= end:
                        continue
                    b = min(b, end)
                cur = a
                for x in sorted((splits or {}).get(ci, [])):
                    if cur + ZOOM_EVERY <= x <= b - 1.0:
                        self.segs.append((ci, cur, x, t))
                        t += x - cur
                        cur = x
                self.segs.append((ci, cur, b, t))
                t += b - cur
        self.total = t

    def map(self, clip, t):
        cand = [s for s in self.segs if s[0] == clip]
        for c, a, b, o in cand:
            if t <= b:
                return o + max(0.0, t - a)
        c, a, b, o = cand[-1]
        return o + (b - a)


def ts(t):
    t = max(0.0, t)
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def rrect(w, h, r):
    k = r * 0.45
    return (f"m {r} 0 l {w - r} 0 b {w - k} 0 {w} {k} {w} {r} l {w} {h - r} b {w} {h - k} {w - k} {h} {w - r} {h} "
            f"l {r} {h} b {k} {h} 0 {h - k} 0 {h - r} l 0 {r} b 0 {k} {k} 0 {r} 0")


def word_times(words, i0, i1, n, tl, clip):
    """n ta ko'rinadigan so'zni ASR so'zlari [i0..i1] vaqtlariga taqsimlash."""
    idx = list(range(i0, i1 + 1))
    out = []
    for k in range(n):
        j = idx[round(k * (len(idx) - 1) / max(1, n - 1))] if n > 1 else idx[0]
        out.append(tl.map(clip, words[j]["s"]))
    return out


FONT_FILES = {"Sub1": "Poppins-Bold.ttf", "Sub2": "Poppins-Regular.ttf", "Card1": "Poppins-Bold.ttf",
              "Card2": "Poppins-Medium.ttf", "Card3": "Poppins-Regular.ttf"}
SIZES = {"Sub1": 104, "Sub2": 82, "Card1": 100, "Card2": 68, "Card3": 54}
ROW_H = {"Card1": 108, "Card2": 80, "Card3": 64}
SUB_MAXW, CARD_X, CARD_MAXW = 1000, 545, 505
_fonts = {}


def text_width(style, text, fs, fonts_dir):
    """libass o'lchamidagi (fs) matn kengligi, px."""
    from PIL import ImageFont
    f = _fonts.setdefault(style, ImageFont.truetype(os.path.join(fonts_dir, FONT_FILES[style]), 200))
    asc, desc = f.getmetrics()
    return f.getlength(text) * fs / (asc + desc)


def fit_size(style, text, fonts_dir, maxw):
    fs = SIZES[style]
    w = text_width(style, text, fs, fonts_dir)
    return fs if w <= maxw else int(fs * maxw / w)


def wrap(style, words, fonts_dir, maxw):
    """So'zlar ro'yxatini maxw ga sig'adigan qatorlarga bo'lish (indekslar bilan)."""
    rows, cur = [], []
    for i, w in enumerate(words):
        if cur and text_width(style, " ".join(words[j] for j in cur + [i]), SIZES[style], fonts_dir) > maxw:
            rows.append(cur)
            cur = []
        cur.append(i)
    return rows + [cur] if cur else rows


def reveal(text, times, t0, dur=0.18, blur=10):
    """Har bir so'z o'z vaqtida blurdan aniqlikka + shaffoflikdan chiqadi; joylashuv oldindan tayyor."""
    parts = []
    for w, t in zip(text.split(), times):
        a = int((t - t0) * 1000)
        b = a + int(dur * 1000)
        parts.append(f"{{\\alpha&HFF&\\blur{blur}\\t({max(a, 0)},{max(b, 1)},\\alpha&H00&\\blur0)}}{w}")
    return " ".join(parts)


def build_ass(proj, words, tl, fonts, broll_spans=()):
    ev = []

    def add(layer, a, b, style, text):
        ev.append(f"Dialogue: {layer},{ts(a)},{ts(b)},{style},,0,0,0,,{text}")

    # --- hook plashkasi (statik, referensdagidek)
    hk = proj["hook"]
    hc, hi = hk["until"]
    t_end = tl.map(hc, words[str(hc)][hi]["e"]) + 0.1
    bw, bh, x0, y0 = 900, 250, (W - 900) // 2, 1080
    add(5, 0, t_end, "Box", f"{{\\an7\\pos({x0 - 5},{y0 - 5})\\p1\\c{WHITE}}}{rrect(bw + 10, bh + 10, 26)}")
    add(6, 0, t_end, "Box", f"{{\\an7\\pos({x0},{y0})\\p1\\c{BROWN}}}{rrect(bw, bh, 22)}")
    add(7, 0, t_end, "Hook", f"{{\\an8\\pos({W // 2},{y0 + 22})\\fs138}}{hk['l1']}")
    add(7, 0, t_end, "Hook", f"{{\\an8\\pos({W // 2},{y0 + 152})\\fs84}}{hk['l2']}")
    sw, sh = 600, 120
    add(6, 0, t_end, "Box", f"{{\\an7\\pos({(W - sw) // 2 - 5},{y0 + bh + 8})\\p1\\c{BROWN}}}{rrect(sw + 10, sh + 10, 20)}")
    add(7, 0, t_end, "Box", f"{{\\an7\\pos({(W - sw) // 2},{y0 + bh + 13})\\p1\\c{WHITE}}}{rrect(sw, sh, 16)}")
    add(8, 0, t_end, "Hook", f"{{\\an5\\pos({W // 2},{y0 + bh + 13 + sh // 2 + 4})\\fs110\\c{BROWN}\\3c{BROWN}\\shad0}}{hk['l3']}")

    # --- subtitrlar: 1-qator sariq BOSH HARF, 2-qator oq
    ph = [p for p in proj["phrases"]]
    starts = []
    for p in ph:
        c, i0, i1 = p[:3]
        starts.append(tl.map(c, words[str(c)][i0]["s"]))
    card_spans = []
    for cd in proj["cards"]:
        cw = words[str(cd["clip"])]
        card_spans.append((tl.map(cd["clip"], cw[cd["from"]]["s"]) - 0.35, tl.map(cd["clip"], cw[cd["to"]]["e"]) + 0.25))
    # ketma-ket kartalar ustma-ust tushmasin
    card_spans = [(a, min(b, card_spans[k + 1][0]) if k + 1 < len(card_spans) else b)
                  for k, (a, b) in enumerate(card_spans)]
    nexts = sorted(starts + [a for a, _ in card_spans] + [tl.total])

    for p, t0 in zip(ph, starts):
        c, i0, i1, l1, l2 = p[:5]
        if "hide" in p[5:]:
            continue
        cw = words[str(c)]
        n1, n2 = len(l1.split()), len(l2.split())
        times = word_times(cw, i0, i1, n1 + n2, tl, c)
        t_last = tl.map(c, cw[i1]["e"])
        nxt = min(x for x in nexts if x > t0 + 0.01)
        t1 = min(nxt, t_last + 0.7)
        on_broll = any(a <= t0 + 0.05 and t0 < b - 0.2 for a, b in broll_spans)
        c1 = "\\c" + WHITE if on_broll else ""   # b-roll ustida ikkala qator oq (referensdagidek)
        add(10, t0, t1, "Sub1", f"{{\\an5\\pos({W // 2},1160)\\fs{fit_size('Sub1', l1, fonts, SUB_MAXW)}{c1}}}"
            + reveal(l1, times[:n1], t0))
        if l2:
            add(10, t0, t1, "Sub2", f"{{\\an5\\pos({W // 2},1278)\\fs{fit_size('Sub2', l2, fonts, SUB_MAXW)}}}"
                + reveal(l2, times[n1:], t0))

    # --- raqamli kartalar: oq fon, raqam pastdan blur bilan ko'tariladi, matn so'zma-so'z
    for cd, (a, b) in zip(proj["cards"], card_spans):
        c, cw = cd["clip"], words[str(cd["clip"])]
        add(20, a, b, "Box", f"{{\\an7\\pos(0,0)\\p1\\c{CARD_BG}}}m 0 0 l {W} 0 {W} {H} 0 {H}")
        r0, r1 = 120, 620  # ms
        add(21, a, b, "Num", f"{{\\an2\\move(290,1930,290,1625,{r0},{r1})\\alpha&HFF&\\blur28"
                             f"\\t({r0},{r1},0.5,\\alpha&H00&\\blur0)}}{cd['num']}")
        rows = []  # (style, so'zlar, vaqtlar)
        for k, (j0, j1, text) in enumerate(cd["lines"]):
            style = ["Card1", "Card2", "Card3"][min(k, 2)]
            ws = text.split()
            times = word_times(cw, j0, j1, len(ws), tl, c)
            for r in wrap(style, ws, fonts, CARD_MAXW):
                rows.append((style, [ws[i] for i in r], [times[i] for i in r]))
        y = 960 - sum(ROW_H[st] for st, _, _ in rows) / 2
        for st, ws, times in rows:
            y += ROW_H[st] / 2
            add(22, a, b, st, f"{{\\an4\\pos({CARD_X},{int(y)})}}" + reveal(" ".join(ws), times, a, blur=8))
            y += ROW_H[st] / 2

    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub1,Poppins,104,{YELLOW},{YELLOW},&H00000000,&H8C000000,-1,0,0,0,100,100,0,0,1,0,3,5,0,0,0,1
Style: Sub2,Poppins,82,{WHITE},{WHITE},&H00000000,&H8C000000,0,0,0,0,100,100,0,0,1,0,3,5,0,0,0,1
Style: Hook,Bebas Neue,120,{WHITE},{WHITE},{WHITE},&H64000000,0,0,0,0,100,100,1,0,1,1.5,2,8,0,0,0,1
Style: Box,Arial,20,{WHITE},{WHITE},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Num,Anton,1500,{BROWN},{BROWN},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,2,0,0,0,1
Style: Card1,Poppins,100,{BROWN},{BROWN},&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,4,0,0,0,1
Style: Card2,Poppins Medium,68,{BROWN},{BROWN},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,4,0,0,0,1
Style: Card3,Poppins,54,{BROWN},{BROWN},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,4,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    return head + "\n".join(ev) + "\n"


def build_video(proj, tl, ass_path, fonts, out, brolls=()):
    clips = proj["clips"]
    fx, fy = proj["focus"]
    zooms = proj["zooms"]
    fc, vl, al = [], [], []
    for k, (c, a, b, _) in enumerate(tl.segs):
        z = zooms[k % len(zooms)]
        sw, sh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
        cx, cy = int(min(max(fx * sw - W * fx, 0), sw - W)), int(min(max(fy * sh - H * fy, 0), sh - H))
        d = b - a
        fc.append(f"[{c - 1}:v]trim={a}:{b},setpts=PTS-STARTPTS,scale={sw}:{sh}:flags=lanczos,crop={W}:{H}:{cx}:{cy},setsar=1[v{k}]")
        fc.append(f"[{c - 1}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={max(d - 0.02, 0):.3f}:d=0.02[a{k}]")
        vl.append(f"[v{k}][a{k}]")
    n = len(tl.segs)
    fc.append("".join(vl) + f"concat=n={n}:v=1:a=1[vraw][ac]")
    # rang faqat spiker kadriga (b-rollga vinyetka tushsa osmonda halqa paydo bo'ladi)
    fc.append("[vraw]eq=contrast=1.06:saturation=1.08:brightness=-0.01,colorbalance=rs=0.03:gs=0.01:bs=-0.03,"
              "vignette=PI/5[vc]")
    base = "vc"
    for k, (path, ss, a, b, bx) in enumerate(brolls):
        i = len(clips) + k
        fc.append(f"[{i}:v]trim={ss}:{ss + b - a},setpts=PTS-STARTPTS+{a}/TB,fps={FPS},"
                  f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}:(iw-{W})*{bx}:(ih-{H})/2,setsar=1,"
                  f"eq=contrast=1.04:saturation=1.05[br{k}]")
        fc.append(f"[{base}][br{k}]overlay=enable='between(t,{a:.3f},{b:.3f})':eof_action=pass[ov{k}]")
        base = f"ov{k}"
    fc.append(f"[{base}]fps={FPS},ass={ass_path}:fontsdir={fonts},format=yuv420p[vo]")
    fc.append("[ac]highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[ao]")
    cmd = ["ffmpeg", "-y", "-v", "error"]
    for p in clips:
        cmd += ["-i", p]
    for path, *_ in brolls:
        cmd += ["-an", "-i", path]
    cmd += ["-filter_complex", ";".join(fc), "-map", "[vo]", "-map", "[ao]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)


def main():
    proj_path, out_dir, fonts = sys.argv[1:4]
    base = os.path.dirname(os.path.abspath(proj_path))
    proj = json.load(open(proj_path))
    words = json.load(open(os.path.join(base, proj["words"])))
    os.makedirs(out_dir, exist_ok=True)
    splits = {}
    for c, i0 in [(p[0], p[1]) for p in proj["phrases"]] + [(cd["clip"], cd["from"]) for cd in proj["cards"]]:
        splits.setdefault(c, []).append(round(words[str(c)][i0]["s"] - 0.05, 3))
    tl = Timeline(proj["clips"], splits, proj.get("clip_end"))
    brolls = []
    ph = proj["phrases"]
    for br in proj.get("broll", []):
        p0, p1 = ph[br["phrases"][0]], ph[br["phrases"][1]]
        a = max(0.0, tl.map(p0[0], words[str(p0[0])][p0[1]]["s"]) - 0.05)
        b = tl.map(p1[0], words[str(p1[0])][p1[2]]["e"]) + 0.15
        path = br["file"] if os.path.isabs(br["file"]) else os.path.join(base, br["file"])
        brolls.append((path, br.get("ss", 0), round(a, 3), round(min(b, a + duration(path) - br.get("ss", 0)), 3),
                       br.get("x", 0.5)))
    ass_path = os.path.join(out_dir, "subs.ass")
    open(ass_path, "w").write(build_ass(proj, words, tl, fonts, [(a, b) for _, _, a, b, _ in brolls]))
    json.dump([dict(clip=c, src=[a, b], out=round(o, 3)) for c, a, b, o in tl.segs],
              open(os.path.join(out_dir, "timeline.json"), "w"), indent=1)
    print(f"{len(tl.segs)} ta bo'lak, yakuniy davomiylik {tl.total:.1f} s")
    build_video(proj, tl, ass_path, fonts, os.path.join(out_dir, "final.mp4"), brolls)


if __name__ == "__main__":
    main()
