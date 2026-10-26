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
      theme: bg("t06-qahva.jpg"),
      cover: { photo: "t06-qahva.jpg", pos: "50% 35%", line1: "Target yoqilsa organik", line2: "oʻlib qoladimi?", sub: "Bu savolga Instagram jamoasining<br>oʻzi javob berdi." },
      slides: [
        { label: "Afsona", title: "«Reklama yoqdim — <mark>qamrov tushib ketdi.</mark>»", body: "Koʻp tadbirkor va bloggerlar shunday deydi va reklamani oʻchirib qoʻyadi.", note: "Lekin Instagram'ning oʻzi buni rad etadi." },
        { label: "Haqiqat", title: "Reklama organikni <mark>na oshiradi, na kamaytiradi.</mark>", body: "Instagram jamoasi ochiq aytdi: reklama sotib olish organik qamrovingizga taʼsir qilmaydi.", note: "Ular odamlarni reklamaga majburlash uchun qamrovni ataylab kesmaydi." },
        { label: "Nega", title: "Bu — ikkita <mark>alohida tizim.</mark>", body: "Organik lenta sizga eng qiziq kontentni koʻrsatadi. Reklama tizimi — eng mos reklamani.", note: "Ular bir-biriga bogʻlanmagan." },
        { label: "Mantiq", title: "Instagram'ga <mark>yaxshi kontent kerak.</mark>", body: "Odamlar postlaringizni yoqtirsa, ilovada koʻproq vaqt oʻtkazadi — Instagram esa boshqa joyda reklama sotadi.", note: "Qamrovingizni kesish ularning oʻziga zarar." },
        { label: "Unda nega tushdi?", title: "Haqiqiy sababni <mark>tekshiring.</mark>", body: "Postlar kamaydimi? Format eskirdimi? Kontent auditoriyaga qiziq emasmi? Mavsum oʻzgardimi?", note: "Qamrov tushishi reklama bilan bir vaqtga toʻgʻri kelishi mumkin — lekin sababi boshqa." },
        { label: "Maslahat", title: "Reklama va organik <mark>birga ishlasin.</mark>", body: "Reklama profilingizga yangi odamlarni olib keladi. Kuchli kontent esa ularni ushlab qoladi va ishonch uygʻotadi.", note: "Biri ikkinchisining oʻrnini bosmaydi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Target organikni oʻldirmaydi. Organikni zaif kontent oʻldiradi.", note: "<b>Sizda ham qamrov tushgan paytlar boʻlganmi? Izohda yozing.</b>" },
      ],
    },
  ],
};
