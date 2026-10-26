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
      cover: { photo: "t06-qahva.jpg", pos: "50% 35%", line1: "«Target yoqilsa profil oʻrganib qoladi»", line2: "Rostdanmi?", sub: "Organik qamrov haqidagi<br>eng mashhur afsona." },
      slides: [
        { label: "Afsona", title: "«Profil reklamaga <mark>oʻrganib qoladi.</mark>»", body: "Target yoqsangiz, Instagram profilingizni «pullik» deb belgilab, keyin organikni uchirmaydi — degan gap koʻp yuradi.", note: "Lekin Instagram'ning oʻzi buni rad etadi." },
        { label: "Haqiqat", title: "Reklama organikni <mark>na oshiradi, na kamaytiradi.</mark>", body: "Instagram jamoasi ochiq aytdi: reklama sotib olish organik qamrovingizga taʼsir qilmaydi.", note: "Qamrovni kesish Instagram'ning oʻziga zarar — unga odamlarni ushlab turadigan yaxshi kontent kerak." },
        { label: "Nega", title: "Bu — ikkita <mark>alohida tizim.</mark>", body: "Organik lenta sizga eng qiziq kontentni koʻrsatadi. Reklama tizimi — eng mos reklamani.", note: "Ular bir-biriga bogʻlanmagan." },
        { label: "Qanday ishlaydi", title: "Har bir post <mark>alohida baholanadi.</mark>", body: "Organik qamrov profilga emas, postga qarab beriladi: uni qancha odam koʻrdi, saqladi, ulashdi, izoh yozdi.", note: "Algoritmda «reklamaga oʻrgangan profil» degan belgi yoʻq." },
        { label: "Unda nega shunday tuyuladi?", title: "Sabab — <mark>notoʻgʻri obunachilar.</mark>", body: "Arzon «obunachi yigʻish» reklamasi postlaringizga qiziqmaydigan odamlarni olib keladi. Ular layk bosmaydi, saqlamaydi.", note: "Natijada postlar sustroq tarqalishi mumkin. Bunga reklama emas, notoʻgʻri sozlangan reklama sabab." },
        { label: "Boshqa sabablar", title: "Haqiqiy sababni <mark>tekshiring.</mark>", body: "Postlar kamaydimi? Format eskirdimi? Kontent auditoriyaga qiziq emasmi? Mavsum oʻzgardimi?", note: "Qamrov tushishi reklama bilan bir vaqtga toʻgʻri kelishi mumkin — lekin sababi boshqa." },
        { label: "Maslahat", title: "Toʻgʻri odamlarga <mark>reklama qiling.</mark>", body: "Obunachi emas — mijoz va qiziqqan odam olib keladigan maqsadni tanlang: xabarlar yoki lidlar.", note: "Shunda reklamadan kelganlar organik postlaringizni ham faol koʻradi." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Qisqa qilib aytganda:<br>Profil reklamaga oʻrganib qolmaydi. Organikni zaif kontent va notoʻgʻri auditoriya oʻldiradi.", note: "<b>Siz ham shu afsonaga ishonganmisiz? Izohda yozing.</b>" },
      ],
    },
  ],
};
