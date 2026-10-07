# Video agent — ish tartibi

Foydalanuvchi (targetolog, o'zbek tilida yozadi) video yuklaydi va uni **o'zi tasdiqlagan uslubda**
montaj qilishni kutadi. Javoblar o'zbek tilida, qisqa va aniq bo'lsin.

## Uslublar katalogi

Foydalanuvchi har safar uslub **nomini** yozadi. Nom yozilmasa — taxmin qilmang, qaysi uslub ekanini so'rang.
Yangi uslub referens bilan kelsa: tahlil qiling, foydalanuvchi bergan nom bilan preset qiling
(`video_agent/config.py` STYLES + ALIASES), shu katalogga qo'shing va sinov videosini ko'rsating.

| Foydalanuvchi aytadigan nom | `--style` | Qisqacha |
|---|---|---|
| **Ekspert montaj jigarrang** | `ekspert-jigarrang` | quyida batafsil |

## "Ekspert montaj jigarrang": `--style ekspert-jigarrang`

`expert` referensi asosida (talking-head): krem hook plashka, jigarrang matn kartalari,
"1/3" raqamli punktlar, so'zma-so'z chiqadigan matn (yuzdan pastda), keskin kesish,
kesimlarda navbatma-navbat 12% yaqinlashish, iliq rang.

Foydalanuvchi talablari (o'zgartirmang, agar o'zi so'ramasa):
- **Rangli o'tishlar yo'q** (light leak / to'q sariq flash olib tashlangan) — `ekspert-jigarrang` buni o'zi qiladi.
- **Fon musiqasi asl balandligining 5%** ida, ducking'siz — `ekspert-jigarrang` buni o'zi qiladi.
  Musiqa faylini foydalanuvchi yuboradi (oxirgisi: Kanye West — Runaway). Musiqa yuborilmasa, so'rang.
- Username / Instagram belgisi kerak emas. "Obuna bo'ling" joyida **profil rasmi kartasi** bo'lsin:
  `--avatar rasm.png` (oxirgisi: Instagram profil skrinshotidan qirqilgan doira rasm).
- **Xiralashgan (blur) yuz kadrlari ishlatilmasin** — ayniqsa hook'da. Manbada yuz xira bo'lsa,
  o'rniga realistik B-roll qo'ying (masalan Mixkit 206: kafeda noutbukda yozayotgan qo'llar).
- **Hook kadri har videoda yangi bo'lsin** (avvalgi videodagi B-roll takrorlanmasin). Ro'yxatli videolarda
  kuchli usul — "teaser": hook davomida ro'yxatdagi barcha ekranlar ~0.45 s dan tez almashadi.
- Hook matni bitta kuchli gap (`--title "|KATTA GAP"`); "Marketologlar, saqlab qo'ying" kabi qo'shimcha qator kerak emas.
- Musiqa vaqt bo'yicha tekislanadi (qo'shiq o'rtasida balandlashmasin) — `ekspert-jigarrang` buni o'zi qiladi.
- Yuborilgan video **30 MB dan kichik** bo'lsin (ilova chegarasi): `-crf 25 -preset slow` bilan siqing.

## Har bir video uchun qadamlar

1. Yuklangan faylni ishchi papkaga ko'chiring, `ffprobe` bilan ko'ring, kontakt-varaq bilan kadrlarni tekshiring.
   Bir nechta bo'lak yuborilsa — ketma-ket birlashtiring.
2. **Transkripsiya:** `faster-whisper large-v3`, `language="uz"` (huggingface.co muhit sozlamalarida ochiq).
   Ovoz past bo'lishi mumkin — agent jimlik chegarasini o'zi moslaydi.
3. **Matnni tuzating:** Whisper o'zbekchani ko'pincha fonetik yozadi va ba'zan takroriy "xayoliy"
   gaplar chiqaradi. Gaplarni adabiy o'zbek tilida qayta yozing, har biriga Whisper vaqtini qo'ying
   (`[[boshlanish, tugash, "Gap."], ...]`) va moslang:
   `python tools/fix_transcript.py video.mp4 gaplar.json tuzatilgan.transcript.json`
   Shubhali joylarni foydalanuvchiga ayting.
4. **Hook** (2 qator, `kichik|KATTA`) va **punktlar** (3–4 ta) ni mazmundan tanlang.
5. Render:
   ```bash
   python agent.py video.mp4 --style ekspert-jigarrang --transcript tuzatilgan.transcript.json \
       --title "kichik qator|katta qator" --points "A|B|C" --music musiqa.mp3 -o output
   ```
   Reja `output/<video>.plan.json` ga yoziladi — kerak bo'lsa tahrirlab `--plan` bilan qayta render qiling.
6. Tekshiring: kontakt-varaq (matn yuzni yopmasin, plashka bo'sh turmasin), `ebur128` (≈ −14 LUFS).
7. 30 MB dan kichik qilib siqing va `SendUserFile` bilan yuboring. Nima qilinganini qisqa yozing.

## Yuzsiz (B-roll) montaj
Foydalanuvchi yuzini ko'rsatmaslikni so'rasa: xiralik/emoji EMAS — ovoz + mavzuga mos B-roll + matnlar.
1. Kadrlar: foydalanuvchining o'z kadrlari yoki Mixkit (mixkit.co, assets.mixkit.co ruxsat etilgan;
   `https://mixkit.co/free-stock-video/<mavzu>/` sahifasidan id topiladi,
   `https://assets.mixkit.co/videos/<id>/<id>-1080.mp4` yoki `-720.mp4`).
2. Avval odatdagidek render qilib rejani oling (`output/<video>.plan.json`), har bir iboraga mos kadr tanlang:
   `[[boshlanish, "klip.mp4", focus_x], ...]` va yig'ing:
   `python tools/build_broll.py spec.json klipler/ <davomiylik> broll.mp4`
3. B-roll + kesilgan ovozni birlashtirib, `--no-cut --plan reja.json --text-y 0.40` bilan render qiling.
   Foydalanuvchi **realistik** kadrlarni afzal ko'radi: animatsion HUD/grafik va kod ekranlaridan qoching,
   haqiqiy qo'llar, noutbuk, telefon, kafe, haqiqiy analitika ekranlarini tanlang. Eng yaxshisi — uning o'z kadrlari.

## Foydali buyruqlar
- Testlar: `python -m pytest -q tests`
- Referensdan musiqa ajratish: `--music-from referens.mp4` (`pip install 'audio-separator[cpu]'`)
- Yuzni yashirish: `--hide-face flowers|blur|emoji`
