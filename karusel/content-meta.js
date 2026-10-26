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
  ],
};
