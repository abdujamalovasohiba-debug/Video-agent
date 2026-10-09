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
| **Ekspert montaj yashil** | `ekspert-yashil` | aynan shu, faqat jigarrang o'rniga to'q yashil (#1F4A38) |
| **AI explainer oltin** | `ai-explainer-oltin` | oltin gradient KATTA so'z + kichik kursiv, klaviatura tugmalari, markalar, oq ekranlar (suyuq parda), oltin nur |
| **Doktor oltin** | `doktor-oltin` | shifokor referensi: chat-pufak hook, oq KATTA + oltin qo'lyozma, B-roll, telefon raqami |

## Rang va tovush (barcha uslublar)
- Rangni referensga `signalstats` (YAVG, SATAVG, UAVG, VAVG) bilan moslang; foydalanuvchi "rang berilmagan"
  deb e'tiroz bildirgan. Telefon videolari uchun boshlang'ich: `eq=saturation=1.32:contrast=1.07:brightness=-0.02,
  colorbalance=bm=0.07:bh=0.05:rh=-0.02,unsharp=5:5:0.5` (faqat odam kadrlariga, stok B-rollga emas) va `--grade none`.
- **O'tishlar silliq bo'lsin** — foydalanuvchi keskin kesishni yoqtirmaydi. Jump-cut'larda 0.3 s dissolve
  (`xfade=fade`, kesimning ikki tomonidan 0.15 s "handle" olib, ovoz vaqti o'zgarmasin), B-roll esa
  0.35 s alfa fade bilan kirib-chiqsin (overlay boshlanishi 0.175 s oldin).
- **O'tishlar ko'p bo'lmasin** (30 s videoga ~7 ta). Jump-cut'larni iloji boricha B-roll ostiga yashiring
  (B-roll kesimdan ≥0.35 s oldin boshlansin, ostida oddiy kesim); ketma-ket B-roll'larni bittaga birlashtiring.
- **Tovush effektlari** qo'shing (`assets/sfx/README.md`): whoosh FAQAT B-roll kirishida (30 s ga ~3 ta, ko'p bo'lmasin), pop - hook/oltin yozuv, ding - kuchli so'z.

## "Doktor oltin": `--style doktor-oltin` (Remotion: bubble, duo, gold, stat)
Chat-pufak hook (`bubble`), oq KATTA + oltin qo'lyozma (`duo`), oltin kalit ibora (`gold`), tepada katta qo'lyozma (`stat`),
mavzuga mos B-roll, oxirida telefon raqami (`duo` caps, raqam aytila boshlaganda chiqsin) + "Muolajaga yozilishingiz mumkin".
Klinika raqami: +998 99 845 50 70 (foydalanuvchi tasdiqlagan). Reja qo'lda yoziladi (`--plan`, `--no-cut`, `--text-y 0.52`),
baza oldindan yig'iladi: rang tuzatish, silliq o'tishlar, B-roll alfa fade bilan. Musiqa: Runaway 5%.

## Podkast-referens uslubi (nomi hali berilmagan; doktor videosida tasdiqlangan)
Remotion: `headline` (framed, `bg` yashil `rgba(31,74,56,0.9)`, ko'krak balandligida `top≈0.56`, emoji 🩺/🤔, katta qator YO'Q),
`point` (krem plashka, tepasida "N-BOSQICH" yorlig'i, burchakda N/jami), `plain` (Oswald KATTA + kursiv izoh).
- Matn rangi **sariq** (`color: "#FFD43B"`) — oq xalat ustida oq matn o'qilmaydi.
- Hook — foydalanuvchining savoli (masalan "SHAXNOZAPA, ENUREZNI QANDAY USULDA DAVOLAYSIZ?"), "5 ta bosqich" kabi qo'shimcha qator kerak emas.
- Hook kirish ovozi: `2354` (xabar). `2356` pop hook uchun YOQMADI.
- "mm/eee" va uzun pauzalarni kesing, lekin yuzdagi kesim ko'rinadigan joyda (B-roll yo'q) qisqa pauzani qoldiring — dissolve ham sezilmasin.
- B-roll har bosqich mazmuniga mos, birinchi kadrdanoq to'liq (oq/bo'sh boshlanmasin).

## "AI explainer oltin": `--style ai-explainer-oltin` (Remotion: tri, keys, stamps, white, glow — `Explainer.tsx`)
Reja qo'lda (`--plan`, `--no-cut`, `--grade none`); namunasi: Sohiba haqidagi mijoz fikri. Oq kiyim ustida matnga qorong'i halo shart.
Brend teg: "Sohiba • target". Oltin nur (glow) o'tishi YOQMADI — ishlatmang. Referens tahlili:
Referens: 25 s, 720x1280, yigit ko'chada (shisha binolar), qo'lda kamera, tez gap. Uslub — "motion-heavy explainer":
- **Matn tizimi:** har 1–2 s da yangi blok, yuzdan pastda (ko'krak, y≈0.52–0.62). 3 qatlam:
  kichik oq kursiv yuqori qator ("Qanaqa qilib", "o'zingizning") → KATTA qalin to'q-sariq/oltin gradient so'z
  (Montserrat/Inter ExtraBold italic, #FFB800→#F59E0B, oq ichki yorug'lik) → kichik oq/kursiv pastki qator ("qo'yaman").
  Ba'zan kichik sariq "Hozir" yorlig'i (pill) KATTA so'z tepasida. So'zlar alohida sakrab chiqadi (scale 0.6→1.05→1, ~0.2 s).
- **Animatsion ob'ektlar** (gapdagi narsaga mos, ~1.5 s):
  - klaviatura tugmalari (keycaps): oltin 3D kvadratlar, ichidagi belgi slot-mashinadek aylanadi (7·1·$ → A·I·⚡), atrofida tanlov ramkasi (Figma selection);
  - "pochta markasi" kartalari (tishli qirrali oltin kvadrat + ikonka + yozuv: Sotadi, CRM), aylanib/qiyshayib kirib, ketma-ket ustma-ust;
  - ikonli pill (Instagram/Telegram logotipi so'z yonida), to'lqinli oltin chiziq (ekranni kesib o'tadi), sichqoncha kursori + "isroil.ai" yorlig'i (brend teg, doim harakatda).
- **Oq "motion" ekranlar** (2–3 s, fon #F5F5F5): markazda katta qora "24/7" qo'shtirnoqda + kichik izoh; Instagram post kartasi
  (spikerning o'z kadri bilan) 3D aylanib chiqadi; qora rounded ilova-ikonka (14 kun → BEPUL yashil pill → havola ikonkasi) va ostida
  1-2-3-4 progress chiziq (oltin nuqtalar to'ladi). Oq ekranga **suyuq (liquid/blob) wipe** bilan kiriladi va chiqiladi (~0.5 s).
- **O'tishlar:** liquid wipe (oq), yorug' nur/light-leak (oltin, ~0.5 s, CTA oldidan), qolgani oddiy kesim; kesimlarda kadr 5–10% yaqinlashadi.
- **Rang:** tabiiy, past to'yinganlik (SATAVG≈14, YAVG≈118, biroz sovuq U≈132), urg'u faqat oltin-sariq. Oq+qora+oltin palitra.
- **Tovush:** ovoz −14 LUFS, fon musiqasi deyarli eshitilmaydi; har matn/ob'ekt chiqishiga mayda "tick/pop", wipe'larda yumshoq whoosh.
- **Tuzilma:** hook (0–2 s: "Qanaqa qilib 5 MINUT") → muammo/yechim punktlari ob'ektlar bilan → oq ekranli tushuntirish →
  qiymat (14 kun BEPUL) → CTA: "izohga AGENT deb yozing" (oltin, "deb yozing" sariq pill) → "Direct'ga yuboraman".

## "Split" referensi (nomi hali berilmagan) — Remotion: `panel`, `karaoke` (`Explainer.tsx`)
Referens: tepada kontent (oq karta / skrinshot), pastda gapiruvchi, chegarada 2 qatorli subtitr (aytilgan so'z oq, keyingisi kulrang).
Pastda gapiruvchining o'z videosi (sinxron, `crop=1080:1060:0:430`, kesimlarda navbatma-navbat 6% zoom; foydalanuvchi shuni tanladi): tepada oq panel (qora ikonka + KATTA so'z + qizil ✗ / yashil ✓ pill), pastki qism y=860..1920, subtitr `top≈0.40`. "Muammo → Demak, ..." formatida har savol-javobga bitta panel; namunasi: v14.

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
- Yuborilgan video **30 MB dan kichik** bo'lsin (ilova chegarasi). Sifat pasaymasin: SFX qo'shganda videoni qayta kodlamang
  (`-c:v copy`, render crf 20 ≈ 18 MB / 37 s); faqat 30 MB dan oshsa `-crf 23 -preset slow`.
- "Syomka" deb yozing (S'yomka emas). Oq kiyimli kadrlarda subtitr sariq (`plan.json` da `"palette"`).
- Alohida rangli fon kartasi (card) shart emas bo'lsa ishlatmang — foydalanuvchiga yoqmadi.

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

## Foydalanuvchining o'zi (Sohiba) kadrda bo'lsa
- Odatda **uning yuzi ko'rinmasin** (selfi bo'laklarida ham), LEKIN o'zi so'rasa (masalan split uslubida "pastga o'zimni gapirgan videoyimni qo'y") ko'rsating: ovozini qoldirib, tasvirni natija skrinshotlari / oq ekran / B-roll
  bilan TO'LIQ yoping (fade paytida ham yuz ko'rinmasin - rasmlar orasida bo'shliq qoldirmang). Mijozlar (doktor va b.) yuzi ko'rinishi mumkin.

## Shovqin
- Fon shovqini (konditsioner g'uvillashi) qolsa foydalanuvchi e'tiroz bildiradi. `afftdn` yetmaydi: pauzadan shovqin namunasini olib
  `noisereduce` (stationary, prop_decrease=0.95) bilan tozalang (≈ −20 dB), so'ng bazani shu ovoz bilan yig'ing.

## Foydali buyruqlar
- Testlar: `python -m pytest -q tests`
- Referensdan musiqa ajratish: `--music-from referens.mp4` (`pip install 'audio-separator[cpu]'`)
- Yuzni yashirish: `--hide-face flowers|blur|emoji`
