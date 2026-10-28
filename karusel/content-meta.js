// Meta Ads 2026 seriyasi karusellari (B uslub). Yaratish: node generate2.js content-meta.js output-meta
const bg = (photo) => ({ bgPhoto: photo, paper: 0, muted: "#fff" });

module.exports = {
  handle: "@sohiba_abdujamolova",

  cards: [
    {
      id: "M2-qiziqishlar-targeting",
      theme: bg("t07-noutbuk.jpg"),
      cover: { photo: "t07-noutbuk.jpg", line1: "Qiziqishlar boʻyicha targeting", line2: "oʻldimi?", sub: "2026-yilda auditoriya bilan<br>qanday ishlash kerak." },
      slides: [
        { label: "Nima boʻldi", title: "Qiziqishlar endi <mark>«tavsiya».</mark>", body: "Koʻp konversiya maqsadlarida algoritm siz tanlagan qiziqishlardan tashqariga chiqadi.", note: "«Ayollar, 25–35, goʻzallik» deb tanlasangiz ham, reklama boshqalarga ham koʻrsatilishi mumkin." },
        { label: "Nega", title: "Meta oʻz maʼlumotiga <mark>koʻproq ishonadi.</mark>", body: "U kim reklamani bosganini, kim yozganini, kim sotib olganini sizdan yaxshiroq koʻradi.", note: "Shuning uchun auditoriyani oʻzi kengaytiradi." },
        { label: "Hali ishlaydi", title: "Hududni <mark>aniq bering.</mark>", body: "Faqat Toshkentda ishlasangiz — faqat Toshkentni tanlang.", note: "Bu cheklov hali ham qatʼiy ishlaydi." },
        { label: "Hali ishlaydi", title: "Mavjud mijozlarni <mark>chiqarib tashlang.</mark>", body: "Yangi mijoz jalb qilish rejimida reklama faqat yangi odamlarga koʻrsatiladi.", note: "Sizdan allaqachon sotib olganlarga pul sarflanmaydi." },
        { label: "Endi nima qilish kerak", title: "Auditoriyani <mark>kreativ orqali</mark> chaqiring.", body: "Videoda kimga gapirayotganingizni birinchi soniyada ayting.", note: "Masalan: «Toshkentdagi salon egalari, bu siz uchun»." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Auditoriyani endi sozlamalar emas, kreativ va hudud belgilaydi.", note: "<b>Siz hali ham qiziqishlar bilan ishlaysizmi? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M9-target-organik",
      theme: bg("t05-ish.jpg"),
      cover: { photo: "t05-ish.jpg", pos: "50% 30%", line1: "«Target yoqsang, profil oʻrganib qoladi»", line2: "Aslida ham shundaymi?", sub: "Instagram rahbari Adam Mosseri<br>bu haqda oʻzi javob berdi." },
      slides: [
        { label: "Koʻp eshitaman", title: "«Reklama yoqsak, <mark>postlar uchmay qoladi.</mark>»", body: "Mijozlar koʻp shunday deydi: «Reklama yoqsak, keyin oddiy postlarimizni hech kim koʻrmay qoladi».", note: "Instagram rahbari Adam Mosseri esa «bunaqa emas» degan." },
        { label: "Aslida", title: "Reklama postlarga <mark>xalaqit bermaydi.</mark>", body: "Mosseri aytgan: reklama yoqasizmi, yoqmaysizmi — postlaringiz oxvati tushmaydi ham, oshmaydi ham.", note: "Reklama alohida, post alohida — biri ikkinchisiga xalaqit bermaydi." },
        { label: "Qanday ishlaydi", title: "Instagram har bir postga <mark>alohida qaraydi.</mark>", body: "Odamlar postni oxirigacha koʻrdimi, saqladimi, kimgadir yubordimi — shunga qaraydi.", note: "Reklama yoqqaningizni «eslab qolmaydi»." },
        { label: "Unda nega tushyapti?", title: "Sababini <mark>postlardan</mark> qidiring.", body: "Koʻpincha sabab oddiy: post kam yuklanyapti, doim bir xil narsa yuklanyapti yoki postlar odamlarga qiziq emas.", note: "Oxvat reklama yoqqan paytga toʻgʻri kelib qolgan, xolos. Aybdor reklama emas." },
        { label: "Men nima qilaman", title: "Men obunachi emas — <mark>xaridor</mark> olib kelaman.", body: "Mijozlarimga obunachi yigʻadigan reklama yoqmayman. Odam direktga yozadigan yoki raqam qoldiradigan reklama yoqaman.", note: "Shunda kelgan odamlar postlaringizni ham qiziqib koʻradi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Reklama postlarni «oʻldirmaydi». Oxvatni qiziq boʻlmagan postlar tushiradi.", note: "<b>Sizda ham shunday boʻlganmi? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M10-metrikalar",
      theme: bg("t05-ish.jpg"),
      cover: { photo: "t05-ish.jpg", pos: "50% 30%", line1: "Targetdagi raqamlar", line2: "nimani anglatadi?", sub: "CTR, CPM, ROAS... tushunmasangiz,<br>pulingiz qayerga ketyapti — bilmaysiz." },
      slides: [
        { label: "Misol", title: "Tasavvur qiling: <mark>doʻkon vitrinasi.</mark>", body: "Reklama — koʻchadagi vitrina. Odamlar oʻtadi, qaraydi, baʼzilari ichkariga kiradi, baʼzilari sotib oladi.", note: "Har bir raqam shu yoʻlning bir qismini oʻlchaydi." },
        { label: "Oxvat", title: "Oxvat — <mark>nechta odam koʻrdi.</mark>", body: "Vitrina oldidan oʻtib, unga qaragan odamlar soni.", note: "Bitta odam 3 marta koʻrsa ham — oxvat 1." },
        { label: "Pokaz", title: "Pokaz — <mark>necha marta koʻrsatildi.</mark>", body: "Oʻsha odamlar reklamani jami necha marta koʻrgani.", note: "Bitta odam 3 marta koʻrsa — 3 ta pokaz." },
        { label: "Chastota", title: "Chastota — <mark>bir odam necha marta koʻrdi.</mark>", body: "Pokaz ÷ oxvat.", note: "Haddan oshib ketsa, odamlar reklamadan zerikadi. Shunda kreativni almashtiring." },
        { label: "CPM", title: "CPM — <mark>1000 marta koʻrsatish narxi.</mark>", body: "Vitrina oldidan 1000 kishi oʻtishi uchun toʻlaydigan «ijara».", note: "Bayram va aksiyalarda oshadi — chunki hamma reklama beradi." },
        { label: "CTR", title: "CTR — <mark>necha foizi bosdi.</mark>", body: "Koʻrganlardan nechtasi qiziqib, ichkariga kirdi.", note: "100 kishi koʻrib, 2 tasi bossa — CTR 2%. Past boʻlsa, kreativ odamni toʻxtatmayapti." },
        { label: "CPC", title: "CPC — <mark>bitta bosish narxi.</mark>", body: "Bir odam reklamani bosishi sizga qanchaga tushdi.", note: "Arzon bosish — hali mijoz degani emas." },
        { label: "Lid narxi", title: "Lid narxi — <mark>bitta zayavka narxi.</mark>", body: "Raqam qoldirgan yoki direktga yozgan bitta odam qanchaga tushdi.", note: "Tadbirkor uchun eng muhim raqamlardan biri." },
        { label: "CPA", title: "CPA — <mark>bitta xarid narxi.</mark>", body: "Reklamaga ketgan pul ÷ sotib olganlar soni.", note: "300$ reklamadan 10 ta mijoz kelsa — CPA 30$." },
        { label: "CAC", title: "CAC — mijozning <mark>haqiqiy narxi.</mark>", body: "Reklama + targetolog + sotuv menejeri + boshqa xarajatlar ÷ yangi mijozlar soni.", note: "Yuqoridagi misolga yana 500$ xizmat haqi qoʻshilsa: 800$ ÷ 10 = <b>CAC 80$.</b> Tadbirkor uchun asosiy raqam shu." },
        { label: "ROAS", title: "ROAS — <mark>har 1$ qancha qaytardi.</mark>", body: "Reklamadan tushgan pul ÷ reklamaga ketgan pul.", note: "300$ reklamadan 1200$ savdo boʻlsa — ROAS 4. Har 1$ ga 4$ tushdi." },
        { label: "Eng asosiysi", title: "Reklama <mark>oʻzini oqlayaptimi?</mark>", body: "CAC bitta mijozdan topadigan foydangizdan kam boʻlsa — ha.", note: "ROAS katta, lekin foyda yoʻqmi? Demak, narx yoki xarajatlarni qayta hisoblash kerak." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Layk va oxvat — chiroyli raqam. Pul topyapsizmi-yoʻqmi — CAC va ROAS aytadi.", note: "<b>Qaysi raqam sizni koʻproq chalkashtiradi? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M11-ai-targetolog",
      theme: bg("t02-tabassum.jpg"),
      cover: { photo: "t07-noutbuk.jpg", pos: "50% 50%", line1: "Sunʼiy intellekt targetologlarning", line2: "oʻrnini egallaydimi?", sub: "Targetolog sifatida<br>ochiq javob beraman." },
      slides: [
        { label: "Hozir nima boʻlyapti", title: "Sunʼiy intellekt koʻp ishni <mark>oʻzi qilyapti.</mark>", body: "Meta reklamada rasmdan video yasaydi, matn yozadi, reklamani kimga koʻrsatishni oʻzi tanlaydi.", note: "Ha, bu rost. Va bu yana kuchayadi." },
        { label: "Lekin", title: "Sunʼiy intellekt biznesingizni <mark>bilmaydi.</mark>", body: "Narxingiz qimmatmi, taklifingiz zaifmi, menejer javobni kechiktiryaptimi — sunʼiy intellekt buni koʻrmaydi.", note: "U faqat siz bergan narsa bilan ishlaydi." },
        { label: "Misol", title: "Yomon reklamani sunʼiy intellekt <mark>tezroq tarqatadi.</mark>", body: "Reklamada notoʻgʻri gap yozilgan boʻlsa, sunʼiy intellekt uni shunchaki koʻproq odamga koʻrsatadi.", note: "Natija yoʻq, pul esa ketdi." },
        { label: "Kim kerak boʻlmay qoladi", title: "Faqat <mark>knopka bosadigan</mark> targetolog.", body: "Faqat reklamani sozlashni biladigan odamning ishini sunʼiy intellekt tezroq va arzonroq qiladi.", note: "Bunday targetologlar oʻrnini sunʼiy intellekt egallaydi." },
        { label: "Kim qoladi", title: "Biznesni tushunadigan <mark>targetolog qoladi.</mark>", body: "Nimani reklama qilish, qanday gapirish, kelgan odamni qanday mijozga aylantirish — buni odam hal qiladi.", note: "Sunʼiy intellekt — yordamchi. Rulda esa odam oʻtiradi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Sunʼiy intellekt targetologni almashtirmaydi. Sunʼiy intellekt bilan ishlaydigan targetolog — ishlamaydiganini almashtiradi.", note: "<b>Sizningcha-chi? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M12-prodvigat-vs-ads-manager",
      theme: bg("t10-tanlash.jpg"),
      cover: { photo: "t10-tanlash.jpg", pos: "50% 20%", line1: "«Продвигать» va Ads Manager", line2: "farqi nimada?", sub: "Oson tilda tushuntiraman." },
      slides: [
        { label: "«Продвигать» nima", title: "«Продвигать» — <mark>telefondagi reklama.</mark>", body: "Post tagidagi «Продвигать»ni bosasiz, pul toʻlaysiz — post koʻproq odamga chiqadi.", note: "Oson va tez. Lekin sozlamalari juda kam." },
        { label: "Ads Manager nima", title: "Reklamaning <mark>toʻliq kabineti.</mark>", body: "Kimga, qachon va qanday reklama chiqishini oʻzingiz sozlaysiz.", note: "Targetologlar shu yerda ishlaydi." },
        { label: "1-farq: natija", title: "«Продвигать» koʻpincha <mark>layk va koʻrish</mark> olib keladi.", body: "Ads Manager'da esa aniq natija tanlaysiz: direktga yozish, raqam qoldirish yoki xarid.", note: "Layk — chiroyli. Pul esa mijozdan keladi." },
        { label: "2-farq: kimga chiqadi", title: "Kimga chiqishini <mark>oʻzingiz boshqarasiz.</mark>", body: "Profilingizga kirganlarga qayta reklama yoqish, eski mijozlarni chiqarib tashlash, bir nechta reklamani solishtirish mumkin.", note: "«Продвигать»da bularning koʻpi yoʻq." },
        { label: "Qachon qaysi biri", title: "«Продвигать» ham <mark>kerak boʻladi.</mark>", body: "Postni shunchaki koʻproq odam koʻrsin desangiz — «Продвигать» yetadi.", note: "Mijoz, zayavka, sotuv kerak boʻlsa — Ads Manager." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>«Продвигать» — post koʻproq koʻrilsin deb. Ads Manager — mijoz kelsin deb.", note: "<b>Siz qaysi biri bilan reklama yoqasiz? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M13-arzon-lid",
      theme: bg("y5-kreslo.jpg"),
      cover: { photo: "y5-kreslo.jpg", pos: "50% 35%", line1: "Arzon lid har doim ham", line2: "yaxshi natija emas", sub: "Nima uchun?" },
      slides: [
        { label: "Koʻp eshitaman", title: "«Lid juda arzon, <mark>lekin sotuv yoʻq.</mark>»", body: "Mijozlar xursand boʻlib keladi: lid 0,5$ ga tushyapti. Bir oydan keyin esa: «Hech kim sotib olmadi».", note: "Gap shundaki, arzon lid va mijoz — bir narsa emas." },
        { label: "Nega arzon chiqadi", title: "Arzon lid — koʻpincha <mark>«shunchaki soʻradim».</mark>", body: "Forma juda oson boʻlsa, odam oʻylamasdan bosib yuboradi. Keyin telefonni ham olmaydi.", note: "Raqam bor — qiziqish yoʻq." },
        { label: "Misol", title: "Qaysi biri <mark>arzonroq?</mark>", body: "1-reklama: 100$ ga 200 ta lid, 2 tasi sotib oldi.<br>2-reklama: 100$ ga 40 ta lid, 8 tasi sotib oldi.", note: "Birinchisida bitta mijoz 50$ ga, ikkinchisida 12,5$ ga tushdi. <b>Arzon lid qimmat mijoz boʻlib chiqdi.</b>" },
        { label: "Nimaga qarash kerak", title: "Lid narxiga emas — <mark>mijoz narxiga</mark> qarang.", body: "Reklamaga ketgan pul ÷ sotib olganlar soni.", note: "Shu raqam bitta mijozdan topadigan foydangizdan kam boʻlsa — reklama ishlayapti." },
        { label: "Men nima qilaman", title: "Formaga <mark>1–2 ta savol</mark> qoʻshaman.", body: "Masalan: «Qachon boshlamoqchisiz?» yoki «Qaysi xizmat kerak?»", note: "Lid biroz qimmatlashadi, lekin «shunchaki soʻraganlar» kamayadi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Arzon lid — chiroyli raqam. Pul esa sotib olgan odamdan keladi.", note: "<b>Sizda lid qanchaga tushyapti? Izohda yozing.</b>" },
      ],
    },
  ],
};
