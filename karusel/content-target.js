// Targetolog uchun 10 ta karusel. Yaratish: node generate2.js content-target.js output-target
// Muqovaga rasm qo'yish: photos/ ga rasm qo'shib, cover.photo ga nomini yozing.
module.exports = {
  handle: "@sohiba_abdujamolova",

  cards: [
    {
      id: "01-reklama-natija-bermayapti",
      cover: { photo: "t01-zina.jpg", big: "01", line1: "Reklamaga pul ketyapti,", line2: "natija yoʻq?", sub: "Pulingiz qayerga «oqib» ketayotganini<br>koʻrsatadigan 7 ta sabab." },
      slides: [
        { label: "Taklif", title: "<mark>Taklifingiz</mark> kuchsiz.", body: "Reklama yomon taklifni yaxshi qilmaydi — faqat uni koʻproq odamga koʻrsatadi.", note: "Avval «nega aynan sizdan olish kerak?» savoliga javob toping." },
        { label: "Profil", title: "Profil <mark>tayyor emas.</mark>", body: "Odam reklamadan kirdi: bio tushunarsiz, narx yoʻq, otzivlar yoʻq.", note: "Natija — u chiqib ketadi, pul esa sarflangan boʻladi." },
        { label: "Kreativ", title: "Kreativ <mark>toʻxtatmaydi.</mark>", body: "Lentada odam postga 1–2 soniya qaraydi. Rasm yoki birinchi kadr ushlamasa — tamom.", note: "Natijaning katta qismi auditoriyadan emas, kreativdan keladi." },
        { label: "Tugma", title: "«Продвигать» <mark>tugmasi.</mark>", body: "Postni shunchaki «reklama qilish» — eng qimmat va eng nazoratsiz yoʻl.", note: "Professional reklama Ads Managerʼda sozlanadi." },
        { label: "Sabr", title: "Reklamani <mark>2 kunda</mark> oʻchirish.", body: "Algoritm avval oʻrganadi, keyin optimallashtiradi.", note: "Har kuni oʻzgartirish — har kuni noldan boshlash degani." },
        { label: "Sotuv", title: "Lidlarga <mark>kech javob</mark> berish.", body: "Yozgan odamga 3 soatdan keyin javob bersangiz, u allaqachon raqobatchidan sotib olgan.", note: "Reklama mijozni olib keladi, sotish esa — sizning vazifangiz." },
        { label: "Tahlil", title: "Raqamlarni <mark>kuzatmaslik.</mark>", body: "Bitta lid qanchaga tushyapti? Bitta sotuv-chi?", note: "Oʻlchanmagan narsani yaxshilab boʻlmaydi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Reklama odam olib keladi.<br>Uni mijozga aylantirish esa — sotuv menejerining ishi.", note: "<b>Qaysi xato sizda bor? Raqamini izohda yozing.</b>" },
      ],
    },
    {
      id: "02-targetolog-tanlash",
      cover: { kicker: "Saqlab qoʻying", photo: "t02-tabassum.jpg", big: "02", line1: "Targetologni yollashdan", line2: "oldin tekshiring", sub: "Pulingizni toʻgʻri mutaxassisga<br>ishonish uchun 6 ta savol." },
      slides: [
        { label: "Keyslar", title: "<mark>Haqiqiy keyslarini</mark> soʻrang.", body: "Qaysi nisha, qancha byudjet, qanday natija — raqamlar bilan.", note: "«Koʻp loyihalarda ishlaganman» — bu keys emas." },
        { label: "Savollar", title: "U sizga <mark>savol beradimi?</mark>", body: "Yaxshi targetolog avval biznesingiz, mijozingiz va taklifingizni oʻrganadi.", note: "Darhol «qilib beraman» degan odamdan ehtiyot boʻling." },
        { label: "Va'da", title: "<mark>Kafolat</mark> beryaptimi?", body: "«100 ta mijoz kafolat» — bu marketing emas, yolgʻon.", note: "Natija taklif, narx va sotuv boʻlimiga ham bogʻliq." },
        { label: "Hisobot", title: "Hisobot <mark>qanday boʻladi?</mark>", body: "Qancha sarflandi, nechta lid keldi, bittasi qanchaga tushdi — har hafta.", note: "Shaffoflik — ishonchning asosi." },
        { label: "Kabinet", title: "Reklama kabineti <mark>kimniki?</mark>", body: "Biznes menejer va reklama akkaunti sizning nomingizda boʻlishi kerak.", note: "Aks holda hamkorlik tugasa, butun tarix ham ketadi." },
        { label: "Narx", title: "Eng arzon — <mark>eng qimmat.</mark>", body: "Arzon xizmat koʻpincha behuda sarflangan reklama byudjeti bilan tugaydi.", note: "Xizmat narxini emas, natijani solishtiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Targetolog — bu tugma bosuvchi emas.", note: "U sizning marketing boʻyicha hamkoringiz. <b>Postni saqlab qoʻying — kerak boʻladi.</b>" },
      ],
    },
    {
      id: "03-reklama-byudjeti",
      cover: { kicker: "Eng koʻp beriladigan savol", photo: "t03-mojito.jpg", pos: "50% 75%", big: "03", line1: "Reklamaga qancha", line2: "pul kerak?", sub: "Byudjetni «taxminan» emas,<br>hisob-kitob bilan rejalashtiring." },
      slides: [
        { label: "Teskari hisob", title: "Byudjet <mark>maqsaddan</mark> boshlanadi.", body: "Avval savol: oyiga nechta mijoz kerak?", note: "Keyin orqaga qarab hisoblaymiz." },
        { label: "Konversiya", title: "Necha liddan <mark>bitta sotuv?</mark>", body: "Masalan, 10 ta murojaatdan 2 tasi sotib oladi — konversiya 20%.", note: "Bu raqamni sotuv boʻlimingizdan oling." },
        { label: "Lid narxi", title: "Bitta lid <mark>qanchaga</mark> tushadi?", body: "Bu nisha, shahar va taklifga bogʻliq. Aniq raqam test reklamadan keyin chiqadi.", note: "Shuning uchun birinchi oy — test oyi." },
        { label: "Formula", title: "<mark>Byudjet</mark> = mijozlar × lidlar × narx", body: "20 ta mijoz kerak, 5 ta liddan 1 ta sotuv, lid narxi 2$ boʻlsa:", note: "<b>20 × 5 × 2$ = 200$</b> oyiga." },
        { label: "Test", title: "Test uchun <mark>minimal</mark> byudjet.", body: "Juda kichik byudjetda algoritm oʻrganishga ulgurmaydi, xulosa ham chiqmaydi.", note: "Test byudjetini «oʻrganish uchun toʻlov» deb qabul qiling." },
        { label: "Foyda", title: "Asosiysi — <mark>sarf emas, qaytim.</mark>", body: "100$ sarflab 500$ foyda koʻrsangiz, bu xarajat emas — investitsiya.", note: "Mijozning umrbod qiymatini ham hisobga oling." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Toʻgʻri savol «qancha?» emas.", note: "Toʻgʻri savol: <b>«Har 1$ menga qancha olib keladi?»</b> Hisoblashda yordam kerakmi? Direktga yozing." },
      ],
    },
    {
      id: "04-sotadigan-kreativ",
      cover: { kicker: "Kreativ sirlari", photo: "t04-telefon.jpg", big: "04", line1: "Sotadigan reklama", line2: "qanday boʻladi?", sub: "Lentada toʻxtatadigan va bosishga<br>undaydigan kreativning 6 qoidasi." },
      slides: [
        { label: "Ilgak", title: "Birinchi <mark>2 soniya</mark> hal qiladi.", body: "Video boshida — eng kuchli kadr yoki savol. Rasmda — katta, oʻqiladigan sarlavha.", note: "Toʻxtatmagan reklama koʻrilmagan reklamadir." },
        { label: "Og'riq", title: "Mahsulotdan emas, <mark>muammodan</mark> boshlang.", body: "Odam mahsulotingizni emas, oʻz muammosining yechimini qidiradi.", note: "«Bizda 20% chegirma» emas — «Ertalab vaqtingiz yetmayaptimi?»" },
        { label: "Aniqlik", title: "Bitta reklama — <mark>bitta fikr.</mark>", body: "Hamma afzalliklarni bitta kreativga tiqishtirmang.", note: "Bitta muammo, bitta yechim, bitta harakat." },
        { label: "Isbot", title: "<mark>Isbot</mark> koʻrsating.", body: "Mijoz otzivlari, «oldin/keyin», raqamlar, jarayon videosi.", note: "Ishonch boʻlmasa, bosish ham boʻlmaydi." },
        { label: "Format", title: "Reklamaga <mark>oʻxshamasin.</mark>", body: "Telefonda oddiy olingan, «jonli» video koʻpincha studiya rolikidan yaxshi ishlaydi.", note: "Lentadagi oddiy postdek koʻrinsin." },
        { label: "Harakat", title: "Nima qilishni <mark>aniq ayting.</mark>", body: "Direktga «narx» deb yozing, «Havolani bosing» — aniq va oson.", note: "Odam oʻylab oʻtirmasligi kerak." },
        { label: "Test", title: "Bitta emas — <mark>3–5 ta kreativ.</mark>", body: "Qaysi biri ishlashini oldindan hech kim bilmaydi.", note: "Test qiling, gʻolibini kuchaytiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Auditoriyani algoritm topadi.", note: "Uni toʻxtatish va ishontirish esa — <b>kreativning vazifasi.</b>" },
      ],
    },
    {
      id: "05-lid-bor-sotuv-yoq",
      cover: { photo: "t05-ish.jpg", big: "05", line1: "Lidlar bor,", line2: "sotuv yoʻq?", sub: "Muammo har doim ham reklamada emas.<br>Mana 6 ta asosiy sabab." },
      slides: [
        { label: "Tezlik", title: "<mark>Kech javob</mark> berish.", body: "Birinchi 5–15 daqiqa — eng «issiq» payt. Keyin qiziqish soʻnadi.", note: "Javob vaqtini oʻlchang va qisqartiring." },
        { label: "Skript", title: "Narxni aytib, <mark>jim qolish.</mark>", body: "«Narxi 500 ming» — va suhbat tugadi.", note: "Avval ehtiyojni bilib oling, keyin qiymatni tushuntiring, soʻng narxni ayting." },
        { label: "Qayta aloqa", title: "<mark>Bir marta</mark> yozib, unutish.", body: "Koʻp mijozlar birinchi aloqada emas, keyingi eslatmalarda sotib oladi.", note: "Javob bermaganlarga 1–2 kundan keyin qayta yozing." },
        { label: "Sifat", title: "Lid <mark>sifati</mark> past.", body: "Juda arzon lidlar koʻpincha «shunchaki qiziqqan» odamlar.", note: "Formaga 1–2 ta saralovchi savol qoʻshing." },
        { label: "Moslik", title: "Reklama va'dasi ≠ <mark>haqiqat.</mark>", body: "Reklamada bir narsa, suhbatda boshqa narsa — ishonch yoʻqoladi.", note: "Kreativ va sotuv bitta tilda gapirsin." },
        { label: "CRM", title: "Lidlar <mark>hisobga olinmaydi.</mark>", body: "Direkt, Telegram, telefon — hammasi aralash. Kim nima dedi, hech kim bilmaydi.", note: "Oddiy jadval ham — boshlash uchun yetarli." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Reklama eshikni ochadi.", note: "Mijozni ichkariga taklif qilish — <b>sotuv boʻlimining ishi.</b> Sizda qaysi bosqich «oqyapti»?" },
      ],
    },
    {
      id: "06-prodvigat-tugmasi",
      cover: { kicker: "Koʻpchilik shu xatoni qiladi", photo: "t06-latte.jpg", pos: "50% 30%", big: "06", line1: "«Продвигать» tugmasini", line2: "bosmang", sub: "Ads Manager orqali sozlangan reklama<br>nega yaxshiroq ishlaydi?" },
      slides: [
        { label: "Maqsad", title: "Tugma <mark>maqsadni</mark> cheklaydi.", body: "Koʻpincha natija — layk va koʻrishlar. Sizga esa mijoz kerak.", note: "Ads Managerʼda maqsadni aniq tanlaysiz: lid, xabar, sotuv." },
        { label: "Auditoriya", title: "Sozlamalar <mark>juda oddiy.</mark>", body: "Retargeting, oʻxshash auditoriya, istisnolar — bularning koʻpi yoʻq.", note: "Natijada reklama keraksiz odamlarga ham ketadi." },
        { label: "Test", title: "<mark>Test qilib</mark> boʻlmaydi.", body: "Bir nechta kreativ va auditoriyani solishtirish deyarli imkonsiz.", note: "Test yoʻq — oʻsish yoʻq." },
        { label: "Tahlil", title: "Statistika <mark>yuzaki.</mark>", body: "Qaysi kreativ, qaysi joylashuv, qaysi yosh guruhi ishladi — bilish qiyin.", note: "Bilmasangiz, yaxshilay olmaysiz." },
        { label: "Qachon mumkin", title: "Qachon <mark>ishlatsa boʻladi?</mark>", body: "Juda kichik byudjetda postni koʻproq odamga koʻrsatish kerak boʻlsa.", note: "Lekin mijoz olib kelish uchun — Ads Manager." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Oson yoʻl — har doim ham arzon emas.", note: "Siz qaysi usulda reklama qilasiz? <b>Izohda yozing.</b>" },
      ],
    },
    {
      id: "07-metrikalar",
      cover: { kicker: "Oddiy tilda", photo: "t07-noutbuk.jpg", big: "07", line1: "CPM, CTR, CPC, CPL", line2: "nima degani?", sub: "Reklama hisobotini tushunish uchun<br>5 ta asosiy koʻrsatkich." },
      slides: [
        { label: "CPM", title: "<mark>1000 ta koʻrish</mark> narxi.", body: "Reklamangiz 1000 marta koʻrsatilishi uchun qancha toʻlaysiz.", note: "Auditoriya va mavsumga qarab oʻzgaradi." },
        { label: "CTR", title: "Necha foiz <mark>bosdi?</mark>", body: "Koʻrganlardan qanchasi reklamani bosgani.", note: "CTR past boʻlsa — avval kreativni tekshiring." },
        { label: "CPC", title: "Bitta <mark>bosish</mark> narxi.", body: "Bir odam reklamani bosishi sizga qanchaga tushgani.", note: "Arzon bosish hali yaxshi natija degani emas." },
        { label: "CPL", title: "Bitta <mark>lid</mark> narxi.", body: "Raqam, ariza yoki xabar qoldirgan bitta odam qanchaga tushgani.", note: "Koʻpchilik biznes uchun eng muhim raqamlardan biri." },
        { label: "ROAS", title: "<mark>Har 1$</mark> qancha qaytardi?", body: "Reklamadan tushgan daromad ÷ reklama xarajati.", note: "ROAS 4 — har 1$ ga 4$ daromad degani." },
        { label: "Zanjir", title: "Raqamlarni <mark>birga</mark> oʻqing.", body: "CTR yaxshi, lid kam — muammo profil yoki saytda. CTR past — muammo kreativda.", note: "Bitta raqam emas, zanjir xulosa beradi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Layk va koʻrishlar — bu natija emas.", note: "Natija — <b>lid, sotuv va foyda.</b> Saqlab qoʻying, hisobot oʻqiganda kerak boʻladi." },
      ],
    },
    {
      id: "08-auditoriya-xatolari",
      cover: { kicker: "Targeting", photo: "t08-zina.jpg", big: "08", line1: "Auditoriyani tanlashda", line2: "5 ta xato", sub: "Reklama «kerakmas» odamlarga ketayotgan<br>boʻlsa — sabab shu yerda." },
      slides: [
        { label: "Tor auditoriya", title: "Auditoriyani <mark>haddan tashqari</mark> toraytirish.", body: "Juda koʻp qiziqish va filtrlar — algoritmga ishlash uchun joy qolmaydi.", note: "Koʻp hollarda kengroq auditoriya arzonroq natija beradi." },
        { label: "Geografiya", title: "<mark>Geografiyani</mark> unutish.", body: "Faqat Toshkentda xizmat koʻrsatasiz, reklama esa butun Oʻzbekistonga ketyapti.", note: "Yetkazib bera olmaydigan joyga reklama — behuda xarajat." },
        { label: "Mijoz", title: "Xaridorni <mark>bilmaslik.</mark>", body: "Mahsulotdan kim foydalanadi va kim pul toʻlaydi — bular har doim ham bitta odam emas.", note: "Bolalar mahsuloti — ota-onalarga." },
        { label: "Istisno", title: "Mijozlarni <mark>istisno qilmaslik.</mark>", body: "Allaqachon sotib olganlarga «birinchi xarid» reklamasini koʻrsatish.", note: "Ularga boshqa taklif kerak." },
        { label: "Retargeting", title: "<mark>Issiq</mark> auditoriyani unutish.", body: "Profilingizga kirgan, yozgan, saytga kirganlar — eng tayyor xaridorlar.", note: "Ularga alohida reklama qiling." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Auditoriya — bu taxmin emas.", note: "Bu — <b>test va raqamlar.</b> Qaysi xato sizga tanish? Izohda yozing." },
      ],
    },
    {
      id: "09-reklamadan-oldin-checklist",
      cover: { kicker: "Checklist", photo: "t09-chiroq.jpg", big: "09", line1: "Reklamani yoqishdan", line2: "oldin tekshiring", sub: "Bu 6 ta narsa tayyor boʻlmasa,<br>byudjetingiz behuda ketadi." },
      slides: [
        { label: "Bio", title: "Bio <mark>3 soniyada</mark> tushunarlimi?", body: "Kimsiz, nima taklif qilasiz va qanday bogʻlanish mumkin.", note: "Murakkab bio — yoʻqotilgan mijoz." },
        { label: "Lenta", title: "Lentada <mark>ishonch</mark> bormi?", body: "Ish namunalari, mijoz otzivlari, jarayon, jamoa.", note: "Yangi odam birinchi 9 ta postga qaraydi." },
        { label: "Highlights", title: "<mark>Aktual</mark> storislar tayyormi?", body: "Narxlar, otzivlar, yetkazib berish, manzil, savol-javob.", note: "Odam savol bermasdan javob topsin." },
        { label: "Narx", title: "<mark>Narx</mark> tushunarlimi?", body: "«Narxi direktda» — koʻp odamni yozmasdan chiqib ketishga majbur qiladi.", note: "Hech boʻlmasa «...dan boshlab» deb yozing." },
        { label: "Aloqa", title: "Javob berishga <mark>kim</mark> masʼul?", body: "Reklama yoqilgan kuni kelgan xabarlarga kim, qancha vaqtda javob beradi?", note: "Buni oldindan hal qiling." },
        { label: "Taklif", title: "Reklama uchun <mark>aniq taklif</mark> bormi?", body: "Bonus, bepul konsultatsiya, sinov darsi — harakatga undaydigan sabab.", note: "«Bizga obuna boʻling» — taklif emas." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Reklama odamlarni profilingizga olib keladi.", note: "Ularni mijozga aylantirish esa — <b>profilning ishi.</b> Saqlab qoʻying va bandlarni belgilang ✅" },
      ],
    },
    {
      id: "10-retargeting",
      cover: { kicker: "Yashirin daromad", photo: "t10-tanlash.jpg", pos: "50% 20%", big: "10", line1: "Sizni koʻrdi, lekin", line2: "sotib olmadi", sub: "Retargeting orqali «yoʻqotilgan»<br>mijozlarni qaytarish." },
      slides: [
        { label: "Muammo", title: "Koʻpchilik <mark>birinchi marta</mark> sotib olmaydi.", body: "Oʻylaydi, solishtiradi, keyinga qoldiradi — va unutadi.", note: "Retargeting — ularga eslatish usuli." },
        { label: "Kimlar", title: "Kimlarga <mark>qayta</mark> koʻrsatamiz?", body: "Profilga kirganlar, videoni koʻrganlar, direktga yozganlar, saytga kirganlar.", note: "Bu — sizni allaqachon taniydigan «issiq» auditoriya." },
        { label: "Nega", title: "Nega bu <mark>samarali?</mark>", body: "Issiq auditoriya sovuq auditoriyaga qaraganda odatda yaxshiroq sotib oladi.", note: "Ular sizni biladi — ishonch qisman bor." },
        { label: "Kreativ", title: "Ularga <mark>boshqa</mark> narsa ayting.", body: "Bir xil reklamani qayta koʻrsatmang. Otzivlar, natijalar, savollarga javob koʻrsating.", note: "Ikkilanish sababini yoʻq qiling." },
        { label: "Taklif", title: "<mark>Shoshilish</mark> sababini bering.", body: "Cheklangan muddatli bonus yoki joylar soni cheklangan taklif.", note: "Faqat haqiqiy boʻlsin — soxta «oxirgi kun» ishonchni yoʻqotadi." },
        { label: "Texnika", title: "Saytingiz boʻlsa — <mark>Pixel</mark> oʻrnating.", body: "Pixel saytga kim kirgani va nima qilganini eslab qoladi.", note: "Usiz retargeting imkoniyatlari cheklanadi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Eng arzon mijoz — sizni allaqachon biladigan mijoz.", note: "Retargetingdan foydalanasizmi? <b>Izohda «ha» yoki «yoʻq» deb yozing.</b>" },
      ],
    },
  ],

  splits: [
    {
      id: "11-qaytadan-boshlang",
      slides: [
        { photo: "s1-oqish.jpg", pos: "50% 35%", top: "Reklama ishlamadimi?", bottom: "Kreativni almashtiring.", x: 6, y: 12 },
        { photo: "s2-kruassan.jpg", pos: "50% 40%", top: "Yomon tongmi?", bottom: "Tushlikda qaytadan boshlang.", x: 6, y: 10 },
        { photo: "s3-kitob.jpg", pos: "50% 30%", top: "Lid qimmatlashdimi?", bottom: "Testni qaytadan boshlang.", x: 6, y: 74 },
        { photo: "s5-mojito.jpg", pos: "50% 45%", top: "Yomon kunmi?", bottom: "Ertaga qaytadan boshlang.", x: 6, y: 10 },
        { photo: "s4-qahva.jpg", pos: "50% 45%", top: "Yomon haftami?", bottom: "Dushanbadan qaytadan boshlang.", x: 6, y: 10 },
      ],
    },
  ],
};
