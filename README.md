# 🎬 Video Agent — professional video montaj agenti

Bitta buyruq bilan xom videodan tayyor **YouTube (16:9)** va **Reels/Shorts (9:16)** versiyalarini yasaydi.

```bash
python agent.py video.mp4 --style reels
```

Texnologiyalar: **Python**, **ffmpeg**, **Whisper** (faster-whisper / openai-whisper), **Remotion** (motion grafika).

## Nima qiladi

| # | Bo'lim | Imkoniyatlar |
|---|--------|--------------|
| 1 | **Montaj** | jim joylar va uzun pauzalarni avtomatik kesadi (`silencedetect`), "eee", "mmm" kabi to'ldiruvchi so'zlarni olib tashlaydi, bo'laklar orasiga silliq o'tish (`xfade` + `acrossfade`) qo'shadi |
| 2 | **Subtitr** | Whisper bilan o'zbekcha nutqni so'zma-so'z vaqt bilan matnga aylantiradi (kirill bo'lsa lotinga o'giradi), TikTok/Reels uslubidagi animatsiyali subtitr: aktiv so'z rang va "pop" effekt bilan ajraladi. Qo'shimcha `.srt` ham chiqaradi |
| 3 | **Motion grafika** | Remotion'da animatsiyali intro, outro (CTA), sarlavha, pastki yozuv (lower third). Muhim so'zlarda silliq **zoom** + subtitrda alohida rang |
| 4 | **Format** | bitta videodan 1920×1080 va 1080×1920. 16:9 → 9:16 uchun `crop` (markazdan) yoki `blur` (xira fon) |
| 5 | **Ovoz** | shovqin tozalash (`afftdn`), EQ, de-esser, kompressor, fon musiqasi, nutq paytida musiqani avtomatik pasaytirish (sidechain ducking), ikki bosqichli EBU R128 normallashtirish (-14 LUFS) |

## O'rnatish

```bash
# 1) ffmpeg (libass bilan)
sudo apt install ffmpeg          # macOS: brew install ffmpeg

# 2) Python kutubxonalari
pip install -r requirements.txt

# 3) Remotion (ixtiyoriy, lekin tavsiya etiladi; Node.js 18+)
cd remotion && npm install && cd ..
```

Remotion o'rnatilmagan bo'lsa, agent motion grafikani avtomatik ravishda **ffmpeg drawtext** bilan yasaydi (soddaroq ko'rinish).

## Ishlatish

```bash
# Eng oddiy: ikkala format, reels uslubi
python agent.py video.mp4 --style reels

# YouTube uslubi, musiqa, sarlavha va pastki yozuv bilan
python agent.py video.mp4 --style youtube --music fon.mp3 \
    --title "Biznesni qanday boshlash kerak" --name "Ali Valiyev" --role "Tadbirkor"

# Faqat vertikal, aniq so'zlarni zoom bilan ajratish
python agent.py video.mp4 --formats 9:16 --keywords pul,biznes,2025

# Estetik Instagram uslubi (matn + emoji + @username + yakuniy karta)
python agent.py video.mp4 --style aesthetic --title "javob bermaganim uchun uzr, band edim" \
    --subtitle "💻📈☕️" --handle username

# Tez qoralama (sinab ko'rish uchun)
python agent.py video.mp4 --draft
```

Natijalar `output/` papkasida:

```
output/
├── video_youtube_16x9.mp4
├── video_reels_9x16.mp4
├── video.srt                 # platformaga yuklash uchun subtitr
└── video.transcript.json     # so'zma-so'z transkript
```

### Subtitr xatolarini tuzatish

Whisper ba'zan so'zni noto'g'ri eshitadi. `output/video.transcript.json` faylidagi `text` maydonlarini tahrirlang va
qayta ishga tushiring — Whisper qayta ishlamaydi:

```bash
python agent.py video.mp4 --transcript output/video.transcript.json
```

### Uslublar (`--style`)

| Uslub | Kesish | Subtitr | Zoom | Intro/Outro |
|-------|--------|---------|------|-------------|
| `reels` | agressiv (0.35s+ pauzalar) | katta, KATTA HARF, 3 so'z | kuchli | ha |
| `youtube` | yumshoq (0.6s+) | o'rtacha, 6 so'z, pastda | yengil | ha |
| `minimal` | faqat uzun pauzalar | oddiy, oq | yo'q | yo'q |
| `aesthetic` | yumshoq | — | yo'q | Instagram estetik: kichik nafis matn + emoji, @username, moody rang, kamera sekin yaqinlashadi, oxirida Instagram logoli karta |
| `cinematic` | yumshoq, sekin (x0.85) | nafis serif | juda yengil | yo'q (iliq rang, vinyetka, plyonka donasi, fade) |

### Asosiy parametrlar

| Parametr | Tavsif |
|----------|--------|
| `--formats 16:9,9:16` / `both` | chiqish formatlari |
| `--music FILE`, `--music-volume dB` | fon musiqasi va uning nutqqa nisbatan darajasi |
| `--title`, `--subtitle`, `--name`, `--role`, `--cta` | motion grafika matnlari (sarlavha berilmasa nutqdan olinadi) |
| `--keywords a,b,c` | zoom bilan ajratiladigan so'zlar (qolganlari avtomatik tanlanadi) |
| `--accent #HEX`, `--font NAME` | rang va shrift |
| `--handle username`, `--text-y 0.15` | Instagram nomi (belgi va yakuniy karta) va estetik matn balandligi |
| `--hide-face flowers/blur/emoji`, `--face-emoji 🌸` | yuzni kuzatib yashirish: tebranib turuvchi gul buketi (masalan `🌼🍁`), xiralik yoki emoji |
| `--grade cinematic/warm/vivid/pastel/bw`, `--speed 0.85` | rang uslubi va tezlik |
| `--reframe crop/blur`, `--focus-x 0..1` | 9:16 ga o'tkazish usuli va qirqish markazi |
| `--silence-db`, `--min-silence`, `--transition` | montaj sozlamalari |
| `--model small/medium/large-v3`, `--language uz`, `--device cuda` | Whisper |
| `--no-cut`, `--no-subs`, `--no-zoom`, `--no-motion`, `--no-intro`, `--no-outro`, `--no-denoise` | bo'limlarni o'chirish |
| `--renderer remotion/ffmpeg` | motion grafika renderi |
| `--config my.json` | barcha sozlamalarni JSON orqali o'zgartirish (`example_config.json`ga qarang) |
| `--draft`, `--keep-temp`, `-v` | tez render, oraliq fayllarni saqlash, batafsil log |

## Loyiha tuzilmasi

```
agent.py                 CLI: python agent.py video.mp4 --style reels
video_agent/
  pipeline.py            7 bosqichli asosiy oqim
  config.py              uslub presetlari (reels / youtube / minimal), formatlar
  silence.py             ffmpeg silencedetect -> jim oraliqlar
  timeline.py            saqlanadigan bo'laklar, asl vaqt -> yangi vaqt (xfade hisobga olingan)
  editing.py             bo'laklarni kesish va xfade/acrossfade bilan ulash
  transcribe.py          Whisper (so'zma-so'z vaqt), transkriptni saqlash/yuklash
  transliterate.py       o'zbek kirill -> lotin
  subtitles.py           TikTok uslubidagi ASS subtitr + SRT
  highlights.py          muhim so'zlarni tanlash, zoom ifodasi, to'ldiruvchi so'zlar
  reframe.py             16:9 <-> 9:16 (crop / blur)
  motion.py              Remotion renderi + ffmpeg zaxira
  audio.py               tozalash, ducking, loudnorm
  compose.py             yakuniy filtr grafi: reframe + zoom + overlay + subtitr + intro/outro
remotion/
  render.mjs             barcha grafikani bitta jarayonda render qiladi
  src/compositions/      Intro, Outro, TitleOverlay, LowerThird
tests/                   unit va integratsion testlar, namuna video generatori
```

### Oqim

1. **Tahlil** — `ffprobe` (o'lcham, fps, telefon aylanishi)
2. **Whisper** — asl audiodan so'zma-so'z transkript
3. **Montaj** — jimliklar + to'ldiruvchi so'zlar kesiladi, bo'laklar `xfade` bilan ulanadi; so'z vaqtlari yangi timeline'ga o'tkaziladi
4. **Subtitr va urg'ular** — so'zlar guruhlanadi, muhim so'zlar tanlanadi
5. **Motion grafika** — Remotion har format uchun intro/outro (to'liq kadr) va overlay'larni (ProRes 4444, shaffof) render qiladi
6. **Ovoz** — nutq tozalanadi, musiqa intro/outro bo'ylab davom etadi va nutq paytida pasayadi
7. **Render** — har format uchun bitta ffmpeg grafi: reframe → zoom → overlay → subtitr → intro/outro o'tishlari

## Testlar

```bash
python -m pytest tests          # ~1 daqiqa, ffmpeg kerak
python tests/make_sample.py demo  # sinov videosi + transkript + musiqa
python agent.py demo/sample.mp4 --transcript demo/sample.transcript.json --music demo/music.mp3
```

## Maslahatlar

- O'zbek tili uchun eng yaxshi natija: `--model large-v3` (GPU bilan `--device cuda`). CPU'da `medium` yoki `small`.
- Shovqinli xonada yozilgan bo'lsa `--silence-db -30`; juda tinch bo'lsa `-40`.
- Kadrda odam chetroqda tursa 9:16 uchun `--focus-x 0.35` kabi qiymat bering.
- Remotion grafikasini brauzerda ko'rish/tahrirlash: `cd remotion && npm run studio`.
