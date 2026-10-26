// Auditoriya og'riqlari asosidagi 6 ta karusel (B uslub: orqada xira muqova rasmi).
// Yaratish: node generate2.js content-target2.js output-target2
const bg = (photo) => ({ bgPhoto: photo, paper: 0, muted: "#fff" });

module.exports = {
  handle: "@sohiba_abdujamolova",

  cards: [
    // ---------- Tadbirkorlar ----------
    {
      id: "B1-target-ishlamaydi",
      theme: bg("n-haykal.jpg"),
      cover: { photo: "n-haykal.jpg", line1: "«Target bizga ishlamaydi»", line2: "Rostdanmi?", sub: "Tadbirkorlar koʻp ishonadigan<br>5 ta afsona va haqiqat." },
      slides: [
        { label: "1-afsona", title: "«Bizning sohada target <mark>ishlamaydi.</mark>»", body: "Odatda target emas, avvalgi sozlash ishlamagan boʻladi: notoʻgʻri auditoriya, kuchsiz kreativ yoki taklif.", note: "<b>Haqiqat:</b> mijozingiz Instagramda boʻlsa — target ishlaydi." },
        { label: "2-afsona", title: "«Hamma targetologlar <mark>aldaydi.</mark>»", body: "Yomon tajriba boʻlgani rost. Lekin koʻpincha sabab — shartlar oldindan kelishilmagani.", note: "<b>Haqiqat:</b> aniq maqsad, haftalik hisobot va oʻz nomingizdagi kabinet sizni himoya qiladi." },
        { label: "3-afsona", title: "«Avval katta <mark>byudjet</mark> kerak.»", body: "Kichik byudjet bilan ham boshlash mumkin. Muhimi — uni toʻgʻri taqsimlash.", note: "<b>Haqiqat:</b> avval kichik test, keyin ishlagan reklamani kuchaytirish." },
        { label: "4-afsona", title: "«Natija <mark>ertaga</mark> boʻlishi kerak.»", body: "Birinchi 1–2 hafta — test davri. Shu vaqtda qaysi reklama ishlashi aniqlanadi.", note: "<b>Haqiqat:</b> testni toʻxtatsangiz, natijani ham toʻxtatasiz." },
        { label: "5-afsona", title: "«Mijoz yoʻq — demak <mark>target yomon.</mark>»", body: "Lidlar kelyapti-yu, sotuv yoʻqmi? Unda muammo reklamada emas, sotuvda.", note: "<b>Haqiqat:</b> lidlarga qanday va qachon javob berilayotganini tekshiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Target ishlaydi — agar u tizim bilan ishlasa.", note: "<b>Siz qaysi afsonaga ishongansiz? Raqamini izohda yozing.</b>" },
      ],
    },
    {
      id: "B2-reklamani-nazorat",
      theme: bg("n-oqish.jpg"),
      cover: { photo: "n-oqish.jpg", pos: "50% 40%", line1: "Kabinetni tushunmasangiz ham", line2: "nazorat qiling", sub: "Targetolog ishini tekshirish uchun<br>5 ta oddiy raqam yetarli." },
      slides: [
        { label: "Muammo", title: "Hisobot bor, lekin <mark>tushunarsiz?</mark>", body: "Grafiklar, foizlar, inglizcha soʻzlar — asosiy savolga esa javob yoʻq: pul nimaga ketdi?", note: "Sizga atigi 5 ta raqam kerak." },
        { label: "1-raqam", title: "Qancha pul <mark>sarflandi?</mark>", body: "Hafta yoki oy davomidagi umumiy reklama xarajati.", note: "Bu raqam kartangizdan yechilgan summa bilan mos kelishi kerak." },
        { label: "2-raqam", title: "Nechta <mark>lid</mark> keldi?", body: "Lid — raqam yoki ariza qoldirgan, direktga yozgan odam.", note: "Layk va koʻrishlar — lid emas." },
        { label: "3-raqam", title: "Bitta lid <mark>qanchaga</mark> tushdi?", body: "Sarflangan pul ÷ lidlar soni.", note: "Har hafta solishtiring: arzonlashyaptimi yoki qimmatlashyaptimi?" },
        { label: "4-raqam", title: "Nechtasi <mark>sotib oldi?</mark>", body: "Bu raqamni targetolog emas, siz yoki sotuv menejeringiz biladi.", note: "Lidlar va sotuvlarni oddiy jadvalga yozib boring." },
        { label: "5-raqam", title: "Bitta mijoz <mark>qanchaga</mark> tushdi?", body: "Sarflangan pul ÷ sotuvlar soni.", note: "Bu raqam bitta mijozdan topadigan foydangizdan kam boʻlsa — reklama oʻzini oqlayapti." },
        { label: "Muhim", title: "Kabinet — <mark>sizning nomingizda.</mark>", body: "Biznes menejer, reklama akkaunti va karta sizniki boʻlsin.", note: "Targetolog almashsa ham, butun tarix va sozlamalar sizda qoladi — boshidan boshlash shart emas." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Kabinetni emas — raqamlarni nazorat qiling.", note: "<b>Saqlab qoʻying va keyingi hisobotda shu 5 ta raqamni soʻrang.</b>" },
      ],
    },
    {
      id: "B3-barqaror-sotuv",
      theme: bg("t01-oylash.jpg"),
      cover: { photo: "t01-oylash.jpg", line1: "Sotuv bir oy bor,", line2: "bir oy yoʻq?", sub: "Barqaror mijoz oqimi uchun<br>5 ta qadam." },
      slides: [
        { label: "Sabab", title: "Muammo — <mark>tizim yoʻqligida.</mark>", body: "Reklama goh yoqiladi, goh oʻchadi. Kontent kayfiyatga qarab chiqadi. Sotuv bilan kim boʻsh boʻlsa, oʻsha shugʻullanadi.", note: "Natija ham shunday: goh bor, goh yoʻq." },
        { label: "1-qadam", title: "Reklamani <mark>toʻxtatmang.</mark>", body: "Har safar oʻchirib-yoqish — algoritmni har safar noldan oʻrgatish degani.", note: "Kichik, lekin doimiy byudjet katta, lekin uzuq-yuluq byudjetdan yaxshiroq." },
        { label: "2-qadam", title: "Har oy <mark>yangi kreativ.</mark>", body: "Bir xil reklamani koʻraverib odamlar charchaydi — lid narxi oshadi.", note: "Raqobatchilar reklamasi ishlayotgani ham shundan: ular kreativni yangilab turadi." },
        { label: "3-qadam", title: "<mark>Issiq auditoriyani</mark> unutmang.", body: "Sizni koʻrgan, yozgan, lekin sotib olmaganlarga qayta reklama koʻrsating.", note: "Bular — eng arzon mijozlar." },
        { label: "4-qadam", title: "Sotuvni <mark>tartibga soling.</mark>", body: "Javob berish vaqti, savol-javob skripti, qayta aloqa — hammasi yozib qoʻyilgan boʻlsin.", note: "Shunda natija bitta odamning kayfiyatiga bogʻliq boʻlmaydi." },
        { label: "5-qadam", title: "Hammasini <mark>oʻzingiz qilmang.</mark>", body: "Reklama, kontent, sotuv, hisob-kitob — bir odamga koʻplik qiladi.", note: "Vaqtingizni biznesni oʻstirishga sarflang, qolganini mutaxassisga topshiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Barqaror sotuv — omad emas, tizim.", note: "<b>Qaysi qadam sizda yoʻq? Raqamini izohda yozing.</b>" },
      ],
    },

    // ---------- Yangi targetologlar ----------
    {
      id: "N1-birinchi-mijoz",
      theme: bg("t04-profil.jpg"),
      cover: { photo: "t04-profil.jpg", pos: "50% 30%", line1: "Kurs tugadi,", line2: "mijoz yoʻq?", sub: "Birinchi mijozni topish uchun<br>6 ta amaliy qadam." },
      slides: [
        { label: "Haqiqat", title: "Hech kim <mark>tayyor</mark> boʻlib tugʻilmaydi.", body: "«Men hali tayyor emasman» — har bir yangi targetolog shu fikrdan oʻtadi.", note: "Tajriba oʻqish bilan emas, ishlash bilan keladi." },
        { label: "1-qadam", title: "Bitta <mark>yoʻnalish</mark> tanlang.", body: "Masalan: goʻzallik salonlari, oʻquv markazlari yoki onlayn doʻkonlar.", note: "Hammaga ishlaydigan targetolog hech kimning esida qolmaydi." },
        { label: "2-qadam", title: "Keysni <mark>oʻzingiz yarating.</mark>", body: "Tanishingiz biznesiga kichik byudjet bilan reklama qilib bering.", note: "Raqamlar va skrinshotlar — sizning birinchi portfoliongiz." },
        { label: "3-qadam", title: "Profilingiz — <mark>rezyumengiz.</mark>", body: "Kimga yordam berasiz va qanday natija — bio va birinchi postlarda aniq koʻrinsin.", note: "Mijoz sizni sertifikatingizga emas, profilingizga qarab tanlaydi." },
        { label: "4-qadam", title: "Mijozni kutmang — <mark>oʻzingiz yozing.</mark>", body: "Tanlagan yoʻnalishingizdagi 10 ta biznes profilini koʻrib chiqing va reklamasi haqida aniq fikr yozing.", note: "Shablon emas — foydali kuzatuv yuboring." },
        { label: "5-qadam", title: "Narx aytishdan <mark>qoʻrqmang.</mark>", body: "Narxni aytishdan oldin mijozning muammosi va maqsadini soʻrang.", note: "Muammoni tushungan mutaxassisning narxi qimmat koʻrinmaydi." },
        { label: "6-qadam", title: "<mark>Bitta</mark> mijozdan boshlang.", body: "Birinchi loyihadagi asosiy maqsad — katta pul emas, natija va otziv.", note: "Bitta yaxshi keys keyingi mijozlarni olib keladi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Birinchi mijoz kursdan emas, harakatdan keladi.", note: "<b>Siz hozir qaysi qadamdasiz? Izohda yozing.</b>" },
      ],
    },
    {
      id: "N2-knopka-emas",
      theme: bg("t05-javon.jpg"),
      cover: { photo: "t05-javon.jpg", line1: "Targetolog —", line2: "knopka bosuvchi emas", sub: "Mijoz natija uchun pul toʻlaydi.<br>Uni chiqaradigan 6 ta koʻnikma." },
      slides: [
        { label: "Muammo", title: "Sozlash — ishning <mark>kichik qismi.</mark>", body: "Kurslarda koʻpincha kabinetni sozlash oʻrgatiladi. Natija esa undan oldin va keyin hal boʻladi.", note: "Shuning uchun lid qimmat chiqadi — sababi esa tushunarsiz qoladi." },
        { label: "Strategiya", title: "Avval <mark>biznesni</mark> oʻrganing.", body: "Mahsulot, mijoz, raqobatchi, narx — reklama shular asosida quriladi.", note: "Strategiyasiz reklama — tavakkal." },
        { label: "Voronka", title: "Odam qayerda <mark>yoʻqolyapti?</mark>", body: "Reklama → profil yoki sayt → direkt → sotuv. Har bir bosqichda odam chiqib ketishi mumkin.", note: "Lid qimmat boʻlsa, voronkaning qaysi joyi «teshik» ekanini toping." },
        { label: "Kreativ", title: "Natijaning katta qismi — <mark>kreativda.</mark>", body: "Auditoriya bir xil boʻlsa ham, kreativni almashtirish lid narxini keskin oʻzgartirishi mumkin.", note: "Har doim 3–5 ta kreativni test qiling." },
        { label: "Analitika", title: "Raqamlarni <mark>oʻqiy oling.</mark>", body: "CTR past — kreativda muammo. CTR yaxshi, lid kam — profil yoki taklifda. Lid koʻp, sotuv yoʻq — sotuvda.", note: "Shunda mijozga sababni aniq tushuntira olasiz." },
        { label: "Kelishuv", title: "Natijani <mark>oldindan</mark> kelishing.", body: "Nimani oʻlchaymiz, test qancha davom etadi, mijoz nimaga javob beradi — boshida yozib oling.", note: "Shunda natija boʻlmasa, aybdor emas, sabab qidiriladi." },
        { label: "Bloklanish", title: "Akkaunt bloklandimi? <mark>Vahima qilmang.</mark>", body: "Koʻpincha sabab — qoidaga zid kreativ, matn yoki sahifa.", note: "Reklama qoidalarini oʻqing va zaxira akkauntni oldindan tayyorlab qoʻying." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Mijoz sozlash uchun emas — natija uchun pul toʻlaydi.", note: "<b>Qaysi koʻnikmangizni kuchaytirish kerak? Izohda yozing.</b>" },
      ],
    },
    {
      id: "N3-arzon-ishlamang",
      theme: bg("n-latte.jpg"),
      cover: { photo: "n-latte.jpg", pos: "50% 25%", line1: "Kam pulga ishlashni", line2: "toʻxtating", sub: "Yangi targetologni joyida ushlab turgan<br>5 ta toʻsiq." },
      slides: [
        { label: "1-toʻsiq", title: "«Men hali <mark>tayyor emasman.</mark>»", body: "Bu fikr bilan oylar oʻtadi, tayyorlik esa kelmaydi.", note: "<b>Yechim:</b> kichik loyihadan boshlang — ishonch natijadan keladi." },
        { label: "2-toʻsiq", title: "Maʼlumot <mark>juda koʻp.</mark>", body: "Har kuni yangi video, yangi kurs, yangi «sir» — natijada hech narsa qilinmaydi.", note: "<b>Yechim:</b> bitta yoʻnalish, bitta reja, har kuni bitta amaliy qadam." },
        { label: "3-toʻsiq", title: "Narx aytishdan <mark>qoʻrqish.</mark>", body: "Arzon narx mijozni koʻpaytirmaydi — faqat sizni charchatadi.", note: "<b>Yechim:</b> narxni sarflagan vaqtingizga emas, natija va masʼuliyatga qarab belgilang." },
        { label: "4-toʻsiq", title: "Xatoni koʻrsatadigan <mark>odam yoʻq.</mark>", body: "Yolgʻiz ishlaganda bitta xatoni oylab takrorlash mumkin.", note: "<b>Yechim:</b> tajribali mutaxassisdan maslahat oling yoki hamjamiyatga qoʻshiling." },
        { label: "5-toʻsiq", title: "<mark>Vaqt</mark> yetmaydi.", body: "Ish yoki oʻqish bilan birga olib borish qiyin — bu tabiiy.", note: "<b>Yechim:</b> kuniga 1 soat, lekin har kuni. Muntazamlik tezlikdan muhimroq." },
        { label: "Taqqoslash", title: "Boshqalar bilan <mark>solishtirmang.</mark>", body: "Siz koʻrayotgan «katta daromad» ortida yillar va oʻnlab mijozlar turibdi.", note: "Oʻzingizni faqat oʻtgan oydagi oʻzingiz bilan solishtiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Siz arzon emassiz — tajribangiz hali kam. Bu vaqtinchalik.", note: "<b>Sizni qaysi toʻsiq ushlab turibdi? Izohda yozing.</b>" },
      ],
    },
  ],
};
