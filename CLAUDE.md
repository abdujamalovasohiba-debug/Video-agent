# Video agent — ish tartibi

Foydalanuvchi (targetolog, o'zbek tilida yozadi) video yuklaydi va uni **o'zi tasdiqlagan uslubda**
montaj qilishni kutadi. Javoblar o'zbek tilida, qisqa va aniq bo'lsin.

## Tasdiqlangan uslub: `--style mening`

`expert` referensi asosida (talking-head): krem hook plashka, jigarrang matn kartalari,
"1/3" raqamli punktlar, so'zma-so'z chiqadigan matn (yuzdan pastda), keskin kesish,
kesimlarda navbatma-navbat 12% yaqinlashish, iliq rang.

Foydalanuvchi talablari (o'zgartirmang, agar o'zi so'ramasa):
- **Rangli o'tishlar yo'q** (light leak / to'q sariq flash olib tashlangan) — `mening` buni o'zi qiladi.
- **Fon musiqasi asl balandligining 5%** ida, ducking'siz — `mening` buni o'zi qiladi.
  Musiqa faylini foydalanuvchi yuboradi (oxirgisi: Kanye West — Runaway). Musiqa yuborilmasa, so'rang.
- Username / Instagram belgisi kerak emas.
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
   python agent.py video.mp4 --style mening --transcript tuzatilgan.transcript.json \
       --title "kichik qator|katta qator" --points "A|B|C" --music musiqa.mp3 -o output
   ```
   Reja `output/<video>.plan.json` ga yoziladi — kerak bo'lsa tahrirlab `--plan` bilan qayta render qiling.
6. Tekshiring: kontakt-varaq (matn yuzni yopmasin, plashka bo'sh turmasin), `ebur128` (≈ −14 LUFS).
7. 30 MB dan kichik qilib siqing va `SendUserFile` bilan yuboring. Nima qilinganini qisqa yozing.

## Foydali buyruqlar
- Testlar: `python -m pytest -q tests`
- Referensdan musiqa ajratish: `--music-from referens.mp4` (`pip install 'audio-separator[cpu]'`)
- Yuzni yashirish: `--hide-face flowers|blur|emoji`
