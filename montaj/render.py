#!/usr/bin/env python3
"""«Storis progrev» uslubidagi montaj renderi.

Foydalanish:  python3 montaj/render.py projects/<nom>/edit.json out.mp4

edit.json vaqtlari manba klip vaqtida beriladi: ["<klip>", soniya].
Uslub parametrlari: presets/storis-progrev/style.json
"""
import json
import math
import os
import subprocess
import sys
import tempfile

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")

YELLOW = (242, 230, 0)
RED = (163, 20, 30)
OLIVE = (184, 162, 30)
BROWN_TOP, BROWN_BOT = (91, 58, 30), (168, 121, 46)

# tier -> (shrift, o'lcham, rang, highlight)
TIERS = {
    "small": ("Montserrat-Medium", 56, (255, 255, 255)),
    "light": ("Montserrat-LightItalic", 56, (255, 255, 255)),
    "mid": ("Montserrat-Bold", 74, (255, 255, 255)),
    "key": ("Montserrat-ExtraBold", 104, (255, 255, 255)),
    "key_y": ("Montserrat-ExtraBoldItalic", 104, YELLOW),
    "hook": ("Anton-Regular", 128, YELLOW),
    "hook_big": ("Anton-Regular", 220, YELLOW),
    "q_small": ("Montserrat-SemiBold", 58, "brown"),
    "q_big": ("Montserrat-ExtraBold", 118, "brown"),
}


def ease_out(p):
    p = min(max(p, 0.0), 1.0)
    return 1 - (1 - p) ** 3


def ease_in(p):
    p = min(max(p, 0.0), 1.0)
    return p ** 3


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name + ".ttf"), size)


# ---------------------------------------------------------------- timeline
class Timeline:
    def __init__(self, segments):
        self.segs = []
        f = 0
        for s in segments:
            n = int(round((s["out"] - s["in"]) * FPS))
            self.segs.append(dict(s, n=n, f0=f))
            f += n
        self.total = f

    def frame(self, ref):
        """[klip, t] -> chiqish kadri (pauza ichida bo'lsa keyingi bo'lakka yopishadi)."""
        clip, t = ref
        best = None
        for s in self.segs:
            if s["clip"] != clip:
                continue
            if s["in"] - 1e-6 <= t <= s["in"] + s["n"] / FPS + 1e-6:
                return s["f0"] + int(round((t - s["in"]) * FPS))
            if t < s["in"] and (best is None or s["in"] < best["in"]):
                best = s
        if best is not None:
            return best["f0"]
        last = [s for s in self.segs if s["clip"] == clip][-1]
        return last["f0"] + last["n"]


# ---------------------------------------------------------------- sprites
def premult(rgba):
    a = rgba[..., 3:4].astype(np.float32) / 255.0
    bgr = rgba[..., [2, 1, 0]].astype(np.float32) / 255.0 * a
    return np.concatenate([bgr, a], axis=2)


def text_sprite(text, tier, size=None, shadow=True):
    fname, fsize, color = TIERS[tier]
    f = font(fname, size or fsize)
    asc, desc = f.getmetrics()
    l, t, r, b = f.getbbox(text)
    pad = 24
    w, h = r - l + 2 * pad, asc + desc + 2 * pad
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((pad - l, pad), text, font=f, fill=255)
    if color == "brown":
        grad = np.linspace(0, 1, h)[:, None, None]
        top, bot = np.array(BROWN_TOP), np.array(BROWN_BOT)
        rgb = (top * (1 - grad) + bot * grad).repeat(w, axis=1).astype(np.uint8)
        fill = Image.fromarray(rgb, "RGB")
    else:
        fill = Image.new("RGB", (w, h), color)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    if shadow and color != "brown":
        sh = mask.filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v * 0.55))
        img.paste((0, 0, 0, 255), (0, 3), sh)
    img.paste(fill, (0, 0), mask)
    return dict(px=premult(np.array(img)), pad=pad, asc=asc, w=r - l, h=asc + desc)


def blit(frame, spr, x, y, alpha=1.0):
    """frame: float32 BGR 0..1, spr: premult BGRA."""
    if alpha <= 0.003:
        return
    sh, sw = spr.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + sw, W), min(y + sh, H)
    if x1 <= x0 or y1 <= y0:
        return
    s = spr[y0 - y:y1 - y, x0 - x:x1 - x]
    a = s[..., 3:4] * alpha
    roi = frame[y0:y1, x0:x1]
    roi *= 1 - a
    roi += s[..., :3] * alpha


def hblur(spr, k, vertical=False):
    k = int(k)
    if k < 2:
        return spr, 0
    pad = k
    p = cv2.copyMakeBorder(spr, pad * vertical, pad * vertical, pad * (not vertical), pad * (not vertical),
                           cv2.BORDER_CONSTANT, value=0)
    return cv2.blur(p, (1, k) if vertical else (k, 1)), pad


def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    return np.array(m).astype(np.float32) / 255.0


def project_card(spr, cx, cy, ry_deg, rx_deg=0.0, scale=1.0):
    """3D aylantirilgan kartani kadr koordinatalariga perspektiva bilan proyeksiya qiladi."""
    h, w = spr.shape[:2]
    fdist = 1800.0
    ry, rx = math.radians(ry_deg), math.radians(rx_deg)
    pts = []
    for X, Y in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]:
        X, Y = X * scale, Y * scale
        x1, z1 = X * math.cos(ry), X * math.sin(ry)
        y2, z2 = Y * math.cos(rx) - z1 * math.sin(rx), Y * math.sin(rx) + z1 * math.cos(rx)
        k = fdist / (fdist + z2)
        pts.append((cx + x1 * k, cy + y2 * k))
    dst = np.float32(pts)
    bx0, by0 = np.floor(dst.min(0)).astype(int) - 2
    bx1, by1 = np.ceil(dst.max(0)).astype(int) + 2
    M = cv2.getPerspectiveTransform(np.float32([(0, 0), (w, 0), (w, h), (0, h)]), (dst - [bx0, by0]).astype(np.float32))
    out = cv2.warpPerspective(spr, M, (int(bx1 - bx0), int(by1 - by0)), flags=cv2.INTER_LINEAR,
                              borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    return out, bx0, by0


# ---------------------------------------------------------------- captions
class Caption:
    def __init__(self, c, tl):
        self.tl = tl
        self.y = c.get("y", 0.56) * H
        self.x = c.get("x", 0.07) * W
        self.align = c.get("align", "left")
        self.dir = c.get("dir", "right")
        self.end = tl.frame(c["end"])
        maxw = c.get("maxw", 0.86) * W
        self.words = []
        y = self.y
        for line in c["lines"]:
            sprites = []
            for wd in line:
                sprites.append((wd, text_sprite(wd["w"], wd["s"])))
            space = 0.28 * max(TIERS[wd["s"]][1] for wd, _ in sprites)
            width = sum(s["w"] for _, s in sprites) + space * (len(sprites) - 1)
            k = min(1.0, maxw / width)
            if k < 1.0:
                sprites = [(wd, text_sprite(wd["w"], wd["s"], size=int(TIERS[wd["s"]][1] * k)))
                           for wd, _ in sprites]
                space *= k
                width = sum(s["w"] for _, s in sprites) + space * (len(sprites) - 1)
            asc = max(s["asc"] for _, s in sprites)
            lh = max(s["h"] for _, s in sprites)
            x = self.x if self.align == "left" else (W - width) / 2
            for wd, s in sprites:
                f0 = tl.frame(wd["t"])
                self.words.append(dict(spr=s, x=x, y=y + asc - s["asc"], f0=f0, hl=wd.get("hl")))
                x += s["w"] + space
            y += lh * 0.92
        self.start = min(w["f0"] for w in self.words)

    def draw(self, frame, fi):
        if fi < self.start or fi >= self.end:
            return
        q = (fi - (self.end - 4)) / 4.0  # chiqish
        q = min(max(q, 0.0), 1.0)
        for wd in self.words:
            dt = fi - wd["f0"]
            if dt < 0:
                continue
            p = dt / 5.0
            off = 42 * (1 - ease_out(p))
            alpha = min(1.0, dt / 3.0 + 0.15) * (1 - q)
            blur = 34 * (1 - min(p, 1)) ** 2 + 30 * q
            s = wd["spr"]
            spr, pad = s["px"], 0
            vertical = self.dir == "up"
            if blur >= 2:
                spr, pad = hblur(spr, blur, vertical)
            x, y = wd["x"] - s["pad"], wd["y"] - s["pad"]
            if vertical:
                y += off * 1.6 - pad
            else:
                x += off - pad - 18 * q
            if wd["hl"]:
                hp = ease_out((dt - 4) / 6.0)
                if hp > 0:
                    col = np.array((RED if wd["hl"] == "red" else OLIVE)[::-1], np.float32) / 255
                    bx0 = int(wd["x"] - 14)
                    bx1 = int(bx0 + (s["w"] + 28) * hp)
                    by0, by1 = int(wd["y"] + s["h"] * 0.08), int(wd["y"] + s["h"] * 1.02)
                    a = 0.95 * (1 - q)
                    frame[by0:by1, bx0:bx1] = frame[by0:by1, bx0:bx1] * (1 - a) + col * a
            blit(frame, spr, x, y, alpha)


class Typewriter:
    """Qoraytirilgan sahnadagi harfma-harf yoziladigan iqtibos."""

    def __init__(self, c, tl):
        self.f0, self.f1 = tl.frame(c["from"]), tl.frame(c["to"])
        self.fend = tl.frame(c["until"])
        self.lines = c["lines"]  # [[matn, shrift, highlight]]
        self.y = c.get("y", 0.40) * H
        self.total = sum(len(l[0]) for l in self.lines)
        self.size = c.get("size", 64)
        self.fonts = {l[1]: font(l[1], self.size) for l in self.lines}

    def draw(self, frame, fi):
        if not (self.f0 <= fi < self.fend):
            return
        p = min(1.0, (fi - self.f0) / max(1, (self.f1 - self.f0)))
        n = int(self.total * p)
        layer = Image.new("RGBA", (W, 520), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        y, x = 20, 0.08 * W
        cx = cy = None
        for text, fname, hl in self.lines:
            f = self.fonts[fname]
            shown = text[:max(0, n)]
            n -= len(text)
            if hl and shown:
                full = d.textlength(text, font=f)
                part = d.textlength(shown, font=f)
                d.rectangle((x - 10, y + 0.1 * self.size, x + 10 + min(part, full), y + 1.3 * self.size), fill=OLIVE + (255,))
            d.text((x, y), shown, font=f, fill=(255, 255, 255, 255))
            if shown:
                cx, cy = x + d.textlength(shown, font=f) + 6, y
            y += int(self.size * 1.42)
        if cx is not None and (fi // 8) % 2 == 0:
            d.rectangle((cx, cy + 0.1 * self.size, cx + 4, cy + 1.3 * self.size), fill=(255, 255, 255, 255))
        blit(frame, premult(np.array(layer)), 0, self.y)


# ---------------------------------------------------------------- 3D card
class Card:
    def __init__(self, c, tl, base_dir="."):
        self.f0, self.f1 = tl.frame(c["in"]), tl.frame(c["out"])
        self.cx, self.cy = c.get("cx", 0.2) * W, c.get("cy", 0.25) * H
        self.ry0, self.enter = c.get("ry", 17), c.get("enter", "left")
        if "image" in c:  # skrinshot / rasm karta
            im = Image.open(os.path.join(base_dir, c["image"])).convert("RGBA")
            cw = c.get("w", 900)
            ch = int(im.height * cw / im.width)
            px = np.array(im.resize((cw, ch), Image.LANCZOS)).astype(np.float32)
            px[..., 3] *= rounded_mask(cw, ch, c.get("radius", 28))
            self.spr = premult(px.astype(np.uint8))
            return
        cw, ch = c.get("w", 330), c.get("h", 440)
        img = np.zeros((ch, cw, 4), np.float32)
        g = np.linspace(0, 1, ch)[:, None]
        top, bot = np.array([0x52, 0x2a, 0x3b]) / 255, np.array([0x1a, 0x0d, 0x12]) / 255  # BGR
        img[..., :3] = (top * (1 - g) + bot * g)[:, None, :].repeat(cw, 1)
        sheen = np.clip(1 - np.abs(np.add.outer(np.arange(ch), np.arange(cw)) - ch * 0.35) / 90, 0, 1) * 0.10
        img[..., :3] += sheen[..., None]
        img[..., 3] = 0.94
        rgba = Image.fromarray((np.clip(img[..., [2, 1, 0, 3]], 0, 1) * 255).astype(np.uint8), "RGBA")
        d = ImageDraw.Draw(rgba)
        fb = font("Anton-Regular", c.get("big_size", 150))
        d.text((26, ch - 360), c["big"], font=fb, fill=(255, 255, 255, 255))
        d.text((28, ch - 128), c["sub"], font=font("Montserrat-ExtraBold", 50), fill=YELLOW + (255,))
        d.text((30, ch - 62), c["small"], font=font("Montserrat-Medium", 32), fill=(225, 225, 225, 255))
        d.rounded_rectangle((1, 1, cw - 2, ch - 2), 30, outline=(255, 255, 255, 110), width=3)
        px = np.array(rgba).astype(np.float32)
        px[..., 3] *= rounded_mask(cw, ch, 30)
        self.spr = premult(px.astype(np.uint8))

    def draw(self, frame, fi):
        if not (self.f0 <= fi < self.f1):
            return
        dt, rem = fi - self.f0, self.f1 - fi
        ry, x, y, a, blur = self.ry0 + 2 * math.sin(fi / 20), self.cx, self.cy + 6 * math.sin(fi / 14), 1.0, 0
        vertical = False
        if dt < 10 and self.enter == "up":  # pastdan blur bilan ko'tarilish
            p = ease_out(dt / 10)
            y = self.cy + 0.45 * H * (1 - p)
            blur = 90 * (1 - p)
            a = min(1, dt / 3 + 0.2)
            vertical = True
        elif dt < 9:  # chapdan blur bilan kirish
            p = ease_out(dt / 9)
            x = -250 + (self.cx + 250) * p
            ry = 45 - 32 * p
            blur = 70 * (1 - p)
            a = min(1, dt / 3 + 0.2)
        if rem < 8:  # Y o'qida burilib o'ngga chiqish
            p = ease_in(1 - rem / 8)
            ry += 70 * p
            x += 260 * p
            a *= 1 - p
            blur = max(blur, 50 * p)
            vertical = False
        out, bx, by = project_card(self.spr, x, y, ry, -4)
        pad = 0
        if blur >= 2:
            out, pad = hblur(out, blur, vertical)
        if vertical:
            blit(frame, out, bx, by - pad, a)
        else:
            blit(frame, out, bx - pad, by, a)


# ---------------------------------------------------------------- base processing
def make_grade(g):
    lut = np.arange(256, dtype=np.float32) / 255
    lut = np.clip((lut - 0.5) * g["contrast"] + 0.5, 0, 1)
    warm = g["warmth"]
    luts = [np.clip(lut * (1 - warm), 0, 1), lut, np.clip(lut * (1 + warm * 0.5), 0, 1)]  # B,G,R
    lut3 = np.stack([(l * 255).astype(np.uint8) for l in luts], axis=1)[:, None, :]
    yy = np.linspace(0, 1, H)[:, None]
    vig = 1 - g["bottom_vignette"] * np.clip((yy - 0.62) / 0.38, 0, 1) ** 1.5
    xx = np.linspace(-1, 1, W)[None, :]
    vig = vig * (1 - 0.18 * xx ** 2)
    return lut3, g["saturation"], vig.astype(np.float32)[..., None]


def apply_grade(img, grade):
    lut3, sat, vig = grade
    img = cv2.LUT(img, lut3)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv[..., 1] = cv2.convertScaleAbs(hsv[..., 1], alpha=sat)
    img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    return img.astype(np.float32) / 255 * vig


def frame_view(src, scale, cx, cy):
    M = np.float32([[scale, 0, W / 2 - cx * W * scale], [0, scale, H / 2 - cy * H * scale]])
    return cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def decode(path, t0, n):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-i", path, "-frames:v", str(n),
           "-vf", f"fps={FPS},scale={W}:{H}", "-pix_fmt", "bgr24", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, stdout=subprocess.PIPE, check=True).stdout
    arr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    if len(arr) < n:
        arr = np.concatenate([arr, np.repeat(arr[-1:], n - len(arr), 0)])
    return arr


def plate_bg():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * 0.42) / H) ** 2)
    v = np.clip(1.0 - r * 0.55, 0.72, 1.0)
    return np.repeat(v[..., None], 3, 2).astype(np.float32)


def photo_card(img_bgr, w, h, border=(74, 74, 201)):
    """Kadrdan qizil hoshiyali «polaroid» karta (premult BGRA)."""
    ih, iw = img_bgr.shape[:2]
    k = max(w / iw, h / ih)
    rs = cv2.resize(img_bgr, (int(iw * k) + 1, int(ih * k) + 1), interpolation=cv2.INTER_AREA)
    oy, ox = (rs.shape[0] - h) // 2, (rs.shape[1] - w) // 2
    crop = rs[oy:oy + h, ox:ox + w].astype(np.float32)
    if crop.max() > 1.5:
        crop /= 255
    b = 7
    out = np.zeros((h + 2 * b, w + 2 * b, 4), np.float32)
    out[..., :3] = np.array(border, np.float32) / 255
    out[b:-b, b:-b, :3] = crop
    out[..., 3] = rounded_mask(w + 2 * b, h + 2 * b, 10)
    out[..., :3] *= out[..., 3:4]
    return out


# ---------------------------------------------------------------- main
def render(cfg_path, out_path):
    cfg = json.load(open(cfg_path))
    base_dir = os.path.dirname(os.path.abspath(cfg_path))
    clips = {k: os.path.join(base_dir, v) if not os.path.isabs(v) else v for k, v in cfg["clips"].items()}
    style = json.load(open(os.path.join(ROOT, "presets", "storis-progrev", "style.json")))
    grade = make_grade(style["grade"])
    tl = Timeline(cfg["segments"])
    framing = cfg["framing"]
    caps = [Caption(c, tl) for c in cfg["captions"]]
    cards = [Card(c, tl, base_dir) for c in cfg.get("cards", [])]
    tws = [Typewriter(c, tl) for c in cfg.get("typewriter", [])]
    plate_bg_img = plate_bg()
    stills = {}
    for name, ref in cfg.get("stills", {}).items():
        if isinstance(ref, str):  # tayyor rasm fayli
            stills[name] = cv2.imread(os.path.join(base_dir, ref))
        else:
            stills[name] = decode(clips[ref[0]], ref[1], 1)[0]

    tmp = tempfile.mkdtemp()
    vid = os.path.join(tmp, "v.mp4")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                            "-crf", "18", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
    prev = None
    sfx = [(c.f0 / FPS, "card") for c in cards]
    for si, s in enumerate(tl.segs):
        frames = decode(clips[s["clip"]], s["in"], s["n"])
        fr = framing[s["frame"]]
        mode = s.get("mode", "normal")
        trans = s.get("transition")
        if trans:
            sfx.append((s["f0"] / FPS, trans))
        prev_static = prev
        vids = {k: decode(clips[st["video"][0]], st["video"][1], s["n"])
                for k, st in enumerate(s.get("plate_stills", [])) if "video" in st}
        for i in range(s["n"]):
            fi = s["f0"] + i
            p = i / max(1, s["n"] - 1)
            sc = fr["scale"][0] + (fr["scale"][1] - fr["scale"][0]) * p
            img = apply_grade(frame_view(frames[i], sc, *fr["center"]), grade)

            if mode == "dark":
                small = cv2.resize(img, (W // 4, H // 4))
                img = cv2.resize(cv2.GaussianBlur(small, (0, 0), 6), (W, H)) * 0.42
            elif mode == "plate":
                img = plate_bg_img.copy()
                drift = 1.0 + 0.05 * p
                ri = i - s.get("plate_delay", 0)
                rise = 1 - ease_out(ri / 12) if ri >= 0 else 1.0
                vb = 60 * rise
                items = []
                for k, st in enumerate(s.get("plate_stills", [])):
                    if "video" in st:  # jonli b-roll karta
                        src = vids[k][min(i, len(vids[k]) - 1)]
                        x0, y0, x1, y1 = st.get("crop", (0, 0, 1, 1))
                        src = src[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]
                    else:
                        src = stills[st["still"]]
                    items.append((photo_card(src, st["w"], st["h"]), st))
                if s.get("plate_live", True):
                    live = photo_card(frames[i], 520, 700)
                    items.append((live, dict(cx=0.56, cy=0.63, ry=-15)))
                for spr, st in items:
                    cx = W / 2 + (st["cx"] * W - W / 2) * drift
                    cy = H / 2 + (st["cy"] * H - H / 2) * drift + rise * 0.35 * H
                    out, bx, by = project_card(spr, cx, cy - 8 * math.sin(fi / 15), st["ry"], 5, drift)
                    pad = 0
                    if vb >= 2:
                        out, pad = hblur(out, vb, vertical=True)
                    blit(img, out, bx, by - pad)

            for c in cards:
                c.draw(img, fi)
            for c in caps:
                c.draw(img, fi)
            for t in tws:
                t.draw(img, fi)

            # --- o'tishlar
            if trans == "whip_in" and i < 10:
                q = 1 - ease_out(i / 10)
                shift = int(W * 0.55 * q)
                big = cv2.copyMakeBorder(img, 0, 0, W, W, cv2.BORDER_REFLECT)
                img = big[:, W - shift:2 * W - shift].copy()
                if q > 0.03:
                    img = cv2.blur(img, (int(90 * q) + 1, 1))
            elif trans == "mirror_slide" and i < 8 and prev_static is not None:
                q = ease_out((i + 1) / 8)
                strip = np.concatenate([prev_static, cv2.copyMakeBorder(img, 0, 0, 0, 0, cv2.BORDER_REFLECT)], 1)
                ox = int(W * q)
                img = strip[:, ox:ox + W].copy()
                k = int(110 * (1 - q)) + 1
                if k > 2:
                    img = cv2.blur(img, (k, 1))
            elif trans == "white_through" and prev_static is not None:
                if i < 6:
                    q = ease_in((i + 1) / 6)
                    sh = int(H * 0.4 * q)
                    img = np.vstack([prev_static[sh:], np.ones((sh, W, 3), np.float32)])
                    img = cv2.blur(img, (1, int(120 * q) + 1)) * (1 - q) + q
                elif i < 10:
                    img = np.ones_like(img) * 0.97
            elif trans == "punch" and i < 4:
                k = 1.0 + 0.06 * (1 - i / 4)
                img = frame_view((np.clip(img, 0, 1) * 255).astype(np.uint8), k, 0.5, 0.5).astype(np.float32) / 255

            out8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
            enc.stdin.write(out8.tobytes())
            prev = img
            if fi % 60 == 0:
                print(f"kadr {fi}/{tl.total}", flush=True)
    enc.stdin.close()
    enc.wait()
    build_audio(cfg, clips, tl, sfx, vid, out_path, tmp)


def build_audio(cfg, clips, tl, sfx, vid, out_path, tmp):
    inputs, parts = [], []
    for k, s in enumerate(tl.segs):
        inputs += ["-i", clips[s["clip"]]]
        d = s["n"] / FPS
        parts.append(f"[{k}:a]atrim={s['in']:.3f}:{s['in'] + d:.3f},asetpts=PTS-STARTPTS,"
                     f"aformat=sample_rates=48000:channel_layouts=stereo,"
                     f"afade=t=in:d=0.012,afade=t=out:st={d - 0.015:.3f}:d=0.015[a{k}]")
    n = len(tl.segs)
    voice = "".join(f"[a{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1[voice]"
    fx = [f"[voice]highpass=f=80,acompressor=threshold=-20dB:ratio=4:attack=5:release=80:makeup=3,"
          f"loudnorm=I=-14:LRA=5:TP=-1.5,apad[vn]"]
    mix = ["[vn]"]
    for j, (t, kind) in enumerate(sfx):
        if kind in ("white_through",):
            fx.append(f"anoisesrc=d=0.7:c=pink:a=0.5:r=48000,highpass=f=1500,lowpass=f=9000,"
                      f"afade=t=in:d=0.6:curve=exp,afade=t=out:st=0.6:d=0.1,volume=0.35,"
                      f"aformat=channel_layouts=stereo,adelay={max(0, int((t - 0.6) * 1000))}:all=1[s{j}]")
        else:
            fx.append(f"anoisesrc=d=0.45:c=pink:a=0.5:r=48000,highpass=f=700,lowpass=f=6000,"
                      f"afade=t=in:d=0.18:curve=qsin,afade=t=out:st=0.18:d=0.27:curve=exp,volume=0.4,"
                      f"aformat=channel_layouts=stereo,adelay={max(0, int((t - 0.12) * 1000))}:all=1[s{j}]")
        mix.append(f"[s{j}]")
    graph = ";".join(parts + [voice] + fx +
                     ["".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,"
                      f"alimiter=limit=0.9[aout]"])
    wav = os.path.join(tmp, "a.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", graph, "-map", "[aout]",
                                                               "-t", f"{tl.total / FPS:.3f}", wav], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-i", wav, "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-shortest", "-movflags", "+faststart", out_path], check=True)
    print("tayyor:", out_path)


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
