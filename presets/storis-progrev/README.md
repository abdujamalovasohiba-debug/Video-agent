# Preset: «Storis progrev» montaj uslubi

Referens: 47.7 s, 9:16 (720×1280), 30 fps, Reels/Storis uchun ekspert-progrev video.
Mashina o'qiy oladigan parametrlar: [`style.json`](style.json).

## 1. Struktura va ritm

| Blok | Davomiylik | Vazifa | Grafika |
|---|---|---|---|
| Hook | 0–3 s | E'tibor | Siqiq qalin sarlavha, neon sariq, so'zma-so'z |
| Ijtimoiy isbot | ~13 s | Ishonch | 3D suzuvchi kartochkalar (raqam + izoh), har ~4 s almashadi |
| Kimligi | ~4.5 s | Ekspertlik | Qizil highlight fonli subtitr |
| Vizual tanaffus 1 | ~9 s | Mavzu / ta'rif | Oq-kulrang 3D sahna, jigarrang-oltin matn |
| Asosiy fikr | ~4.5 s | Sabab | 3 pog'onali subtitr (kichik / KATTA / kichik) |
| Vizual tanaffus 2 | ~3.8 s | Iqtibos | Qoraytirilgan + blur b-roll, typewriter matn |
| Natija | ~4.5 s | Foyda | Sariq italik kalit so'zlar |
| CTA | ~5 s | Harakat | "Direktdan murojaat qiling" |

Qoida: **kadr 3–5 s turadi, lekin ekranda har 0.5–1.5 s nimadir o'zgaradi** (so'z, kartochka, zoom).
2 ta kamera burchagi (umumiy + yaqin/OTS) navbatma-navbat; har ~15 s da rangi neytral «tanaffus» sahna.

## 2. Perexodlar
1. **Pan-reveal ochilish** — tez gorizontal siljish + motion blur, ease-out ~0.5 s.
2. **Mirror slide** — yangi kadr o'ngdan suriladi, chetlarida ko'zgu aksi, 6–8 kadr; oldidan ~0.1 s jimlik, keyin whoosh.
3. **3D kartochka almashinuvi** — eski karta Y o'qida burilib o'ngga chiqadi, yangisi chapdan blur bilan kiradi; fon kesilmaydi.
4. **Hard cut + push-in** — gap boshida kesish, har yangi kadr sekin zoom bilan boshlanadi.
5. **Riser → kesish** — kesishdan ~0.6 s oldin riser SFX.
6. **Oq orqali o'tish** — kamera tez yuqoriga ketadi (blur) → ~0.4 s oq bo'shliq → yangi sahna pastdan chiqadi.
7. **Qoraytirilgan b-roll** — 50–60 % qora overlay + blur, ostida kesishlar, matn uzilmaydi.

## 3. Motion
- Har kadrda doimiy push-in: 100 → 115–120 % (umumiy), 100 → 110 % (yaqin).
- So'z animatsiyasi: o'ngdan 30–50 px, gorizontal motion blur, opacity 0→1, 4–6 kadr, kuchli ease-out.
- Highlight to'rtburchak so'z tushgach chapdan o'ngga wipe (5–6 kadr).
- Typewriter: harfma-harf, oxirida kursor chizig'i.
- 3D karta: yumaloq burchak, shishasimon chegara, 10–15° perspektiva, sekin «suzish».

## 4. Shrift va rang
| Rol | Shrift | Rang |
|---|---|---|
| Hook | Anton / Bebas Neue (CAPS) | `#F2E600` |
| Subtitr kichik | Montserrat Regular/Light | oq |
| Subtitr kalit | Montserrat ExtraBold yoki BoldItalic | oq / `#F2E600` / `#C8E64A` |
| Highlight fon | — | `#A3141E` (qizil) yoki `#B8A21E` (zaytun-sariq) |
| Iqtibos | Montserrat SemiBold + katta “ | jigarrang-oltin `#5B3A1E → #A8792E` |

3 pog'onali formula: `kichik kirish so'zi` / **KATTA KALIT SO'Z** / `kichik davomi`.
Bir ekranda 2–3 qatordan ko'p emas, matn yuz ustiga tushmaydi, pastki 20 % bo'sh.

## 5. Rang va ovoz
- Grade: iliq, to'yingan sariq/to'q sariq, chuqur qora, pastki vinyetka.
- Ovoz: -14 LUFS, kuchli kompressiya (LRA ≈ 3 LU), pauzalar kesilgan, musiqa juda past,
  o'tishlarda whoosh/riser.
