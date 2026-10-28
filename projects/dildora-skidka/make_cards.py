"""Plate sahnasi uchun grafik kartochkalar (media/*.png)."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "..", "assets", "fonts")
YELLOW = (242, 230, 0)


def f(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name + ".ttf"), size)


def grad(w, h, top, bot):
    g = np.linspace(0, 1, h)[:, None, None]
    arr = np.array(top) * (1 - g) + np.array(bot) * g
    return Image.fromarray(arr.repeat(w, 1).astype(np.uint8), "RGB")


def center(d, y, text, font, fill, w):
    d.text(((w - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)


def check(d, x, y, s, fill):
    d.line([(x, y + s * 0.5), (x + s * 0.38, y + s * 0.85), (x + s, y + s * 0.1)], fill=fill, width=int(s * 0.18))


# katta karta: 30% + xizmatlar
w, h = 1040, 1400
im = grad(w, h, (82, 42, 120), (26, 13, 40))
d = ImageDraw.Draw(im)
center(d, 90, "MAXSUS CHEGIRMA", f("Montserrat-SemiBold", 64), (215, 200, 240), w)
center(d, 170, "30%", f("Anton-Regular", 460), YELLOW, w)
for i, t in enumerate(["Gijja terapiya", "Enurez muolajasi", "Barcha filiallarda"]):
    y = 830 + i * 150
    check(d, 170, y + 10, 80, YELLOW)
    d.text((290, y), t, font=f("Montserrat-Bold", 80), fill=(255, 255, 255))
im.save(os.path.join(HERE, "media", "card_main.png"))

# kichik karta: sana
w, h = 600, 800
im = grad(w, h, (236, 226, 250), (201, 182, 228))
d = ImageDraw.Draw(im)
center(d, 120, "1–10", f("Anton-Regular", 260), (60, 28, 92), w)
center(d, 470, "NOYABR", f("Montserrat-ExtraBold", 96), (60, 28, 92), w)
center(d, 600, "chegirma muddati", f("Montserrat-Medium", 46), (90, 60, 120), w)
im.save(os.path.join(HERE, "media", "card_date.png"))

# kichik karta: 100K
w, h = 560, 720
im = grad(w, h, (255, 247, 200), (242, 230, 0))
d = ImageDraw.Draw(im)
center(d, 130, "100K+", f("Anton-Regular", 230), (40, 20, 60), w)
center(d, 450, "obunachi", f("Montserrat-ExtraBold", 74), (40, 20, 60), w)
center(d, 560, "sharafiga", f("Montserrat-Medium", 52), (70, 50, 90), w)
im.save(os.path.join(HERE, "media", "card_100k.png"))
