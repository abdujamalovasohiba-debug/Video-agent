# Video-agent

Reels/Storis videolarini referens uslub bo'yicha avtomatik montaj qilish.

- `presets/storis-progrev/` — referens videodan olingan montaj uslubi (tahlil + `style.json`).
- `montaj/render.py` — uslub bo'yicha render: kesishlar, push-in zoom, so'zma-so'z subtitr,
  3D kartochkalar, typewriter, oq «plate» sahna, whip/mirror o'tishlar, -14 LUFS ovoz + whoosh.
- `projects/<nom>/edit.json` — loyiha montaj qarori (vaqtlar manba klip vaqtida: `["klip", soniya]`).
- `assets/fonts/` — Montserrat va Anton (SIL OFL).

```bash
pip install opencv-python-headless pillow numpy   # + ffmpeg
# manba videolarni projects/<nom>/media/ ga qo'ying (git'ga kirmaydi)
python3 montaj/render.py projects/dildora-100k/edit.json projects/dildora-100k/out/montaj.mp4
```

Renderdan oldin kesish nuqtalarini tekshiring (gap boshi/oxiri kesilmasin):

```bash
python3 montaj/cutcheck.py projects/dildora-100k/edit.json
```
Belgilangan nuqta faqat gap ikki bo'lakka uzluksiz bo'lingan bo'lsa (birining `out` i = keyingisining `in` i) yoki ataylab takror so'z tashlanganda qolishi mumkin.
