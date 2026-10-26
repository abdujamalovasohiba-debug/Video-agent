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
      theme: bg("t03-latte.jpg"),
      cover: { photo: "t03-latte.jpg", pos: "50% 60%", line1: "«Target yoqsang, profil oʻrganib qoladi»", line2: "Rostdanmi?", sub: "Oxvat haqida eng koʻp<br>eshitiladigan gap." },
      slides: [
        { label: "Afsona", title: "«Profil reklamaga <mark>oʻrganib qoladi.</mark>»", body: "Target yoqsangiz, keyin reklamasiz postlar uchmay qoladi — deb koʻp eshitamiz.", note: "Lekin Instagram'ning oʻzi bunday emas deydi." },
        { label: "Haqiqat", title: "Reklama oxvatni <mark>tushirmaydi ham, oshirmaydi ham.</mark>", body: "Instagram jamoasi ochiq aytgan: reklama berish oxvatingizga taʼsir qilmaydi.", note: "Oxvatni kesish Instagram'ning oʻziga foyda emas — unga odamlar koʻradigan zoʻr kontent kerak." },
        { label: "Nega", title: "Bular <mark>ikki xil tizim.</mark>", body: "Biri lentaga qiziq postlarni chiqaradi, ikkinchisi — reklamani.", note: "Ular bir-biriga ulanmagan." },
        { label: "Qanday ishlaydi", title: "Har bir post <mark>alohida tarqaladi.</mark>", body: "Oxvat profilga qarab emas, postga qarab beriladi: odamlar koʻrdimi, saqladimi, ulashdimi, izoh yozdimi.", note: "«Reklamaga oʻrganib qolgan profil» degan narsa yoʻq." },
        { label: "Unda nega shunday boʻlyapti?", title: "Sabab — <mark>notoʻgʻri obunachilar.</mark>", body: "Arzon «obunachi yigʻish» reklamasi postlaringizga qiziqmaydigan odamlarni olib keladi. Ular layk ham bosmaydi.", note: "Shunda postlar kam tarqaladi. Aybdor reklama emas — notoʻgʻri qoʻyilgan reklama." },
        { label: "Boshqa sabablar", title: "Sababni <mark>boshqa joydan</mark> qidiring.", body: "Post kam joylandimi? Format eskirdimi? Kontent qiziq emasmi? Mavsum oʻzgardimi?", note: "Oxvat tushishi target bilan bir vaqtga toʻgʻri kelib qolgan boʻlishi mumkin, xolos." },
        { label: "Maslahat", title: "Reklamani <mark>toʻgʻri odamlarga</mark> bering.", body: "Obunachi yigʻish emas — xabar yoki zayavka olib keladigan reklama qoʻying.", note: "Shunda reklamadan kelganlar oddiy postlaringizni ham koʻradi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Profil reklamaga oʻrganib qolmaydi. Oxvatni zaif kontent va notoʻgʻri auditoriya tushiradi.", note: "<b>Siz ham shunga ishonganmisiz? Izohda yozing.</b>" },
      ],
    },
    {
      id: "M10-metrikalar",
      theme: bg("t05-ish.jpg"),
      cover: { photo: "t05-ish.jpg", pos: "50% 30%", line1: "Reklama hisobotidagi raqamlar", line2: "oddiy tilda", sub: "Oxvat, CPM, CTR, CPA, ROAS...<br>endi chalkashmaysiz." },
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
  ],
};
