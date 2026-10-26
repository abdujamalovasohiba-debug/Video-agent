// Karusel matnlari. Matnni shu yerda o'zgartiring, keyin: node generate.js
module.exports = {
  // Instagram nikingizni shu yerga yozing
  handle: "@sizning_blog",

  carousels: [
    {
      id: "01-shaxsiy-brend",
      theme: { bg: "#F4EFE6", ink: "#1F3B2D", accent: "#E2A13B", soft: "#E6DDCB", muted: "#5B6B60" },
      slides: [
        { type: "cover", kicker: "Saqlab qoʻying", title: "Shaxsiy brendni <mark>0 dan</mark> boshlash", sub: "7 qadamda — hech qanday byudjetsiz" },
        { type: "text", title: "Nega bu muhim?", body: "Odamlar kompaniyadan emas, <b>odamdan</b> sotib oladi.<br><br>Ishonch — bugungi kunning eng qimmat valyutasi. Shaxsiy brend esa shu ishonchni yigʻadigan joy." },
        { type: "step", num: "01", title: "Nishangizni aniqlang", body: "Bitta jumlada javob bering:<br><b>«Men kimga, qanday muammoda yordam beraman?»</b><br><br>Javob aniq boʻlmasa — kontent ham tarqoq boʻladi." },
        { type: "step", num: "02", title: "Bitta odamni tasavvur qiling", body: "Auditoriyangizni «hamma» emas, aniq bir inson sifatida koʻring: yoshi, kasbi, qiyinchiligi, orzusi.<br><br>Unga xat yozayotgandek yozing." },
        { type: "step", num: "03", title: "3 ta asosiy mavzu tanlang", body: "<b>Ekspertlik</b> — nimani bilasiz<br><b>Hayotingiz</b> — qanday yashaysiz<br><b>Qadriyatlar</b> — nimaga ishonasiz<br><br>Shu uchtasi atrofida aylaning." },
        { type: "step", num: "04", title: "Profilni tartibga soling", body: "Yuzingiz aniq koʻrinadigan rasm.<br>Bio: kimsiz + qanday foyda berasiz.<br>Bitta aniq havola.<br><br>Profil — sizning vitrinangiz." },
        { type: "step", num: "05", title: "Mukammallik emas — muntazamlik", body: "Haftada 3 ta oddiy post oyda 1 ta «ideal» postdan koʻra koʻproq natija beradi.<br><br>Algoritm ham, odamlar ham barqarorlikni sevadi." },
        { type: "step", num: "06", title: "Hikoya qiling", body: "Faktlar unutiladi, hikoyalar esda qoladi.<br><br>Xatolaringiz, saboqlaringiz, kichik gʻalabalaringiz — eng kuchli kontent." },
        { type: "step", num: "07", title: "Muloqot qiling", body: "Har bir izohga javob bering. Storisda savol bering. Soʻrovnomalar oʻtkazing.<br><br>Brend — bu monolog emas, <b>suhbat</b>." },
        { type: "cta", title: "Qaysi qadamdan boshlaysiz?", body: "Izohda raqamini yozing — har biriga javob beraman" },
      ],
    },
    {
      id: "02-vaqt-boshqaruvi",
      theme: { bg: "#13213C", ink: "#F5F1E8", accent: "#F5C542", soft: "#1E3155", muted: "#A9B4C8" },
      slides: [
        { type: "cover", kicker: "Vaqt boshqaruvi", title: "Kuniga <mark>+2 soat</mark> qanday topiladi?", sub: "Vaqtingizni oʻgʻirlayotgan 5 ta odat va ularning yechimi" },
        { type: "text", title: "«Vaqtim yetmayapti»", body: "Aslida vaqt yetmayotgani yoʻq — u <b>boshqa joyga ketyapti</b>.<br><br>Quyidagi odatlardan qaysi biri sizda borligini sanab boring 👇" },
        { type: "step", num: "01", label: "Odat", title: "Kunni telefondan boshlash", body: "Koʻz ochishingiz bilan xabarlar va lentaga shoʻngʻish — kun boshidanoq diqqatni boshqalarga berish.<br><br><b>Yechim:</b> uygʻongandan keyingi 30 daqiqa — telefonsiz." },
        { type: "step", num: "02", label: "Odat", title: "Hammasini birdaniga qilish", body: "Multitasking — bu tez ishlash emas, tez charchash.<br><br><b>Yechim:</b> bitta vazifa, 25 daqiqa toʻliq fokus, 5 daqiqa dam." },
        { type: "step", num: "03", label: "Odat", title: "Rejasiz kun", body: "Reja boʻlmasa, kunni boshqalarning vazifalari toʻldiradi.<br><br><b>Yechim:</b> kechqurun ertangi kunning 3 ta eng muhim ishini yozib qoʻying." },
        { type: "step", num: "04", label: "Odat", title: "«Yoʻq» deya olmaslik", body: "Har bir «ha» — boshqa narsaga aytilgan «yoʻq».<br><br><b>Yechim:</b> javob berishdan oldin oʻzingizdan soʻrang: «Bu mening maqsadimga yaqinlashtiradimi?»" },
        { type: "step", num: "05", label: "Odat", title: "Cheksiz bildirishnomalar", body: "Har bir «dzing» diqqatingizni boʻladi, unga qaytish uchun esa vaqt ketadi.<br><br><b>Yechim:</b> keraksiz bildirishnomalarni oʻchiring, xabarlarni kuniga 2–3 marta tekshiring." },
        { type: "text", title: "Hammasini birdan oʻzgartirmang", body: "Bugun <b>faqat bitta</b> odatni tanlang va bir hafta shuni bajaring.<br><br>Kichik, lekin har kungi qadam — katta oʻzgarishning siri." },
        { type: "cta", title: "Sizda nechta odat bor ekan?", body: "Izohda yozing: 0 dan 5 gacha. Halol boʻling 🙂" },
      ],
    },
    {
      id: "03-blog-xatolari",
      theme: { bg: "#FBEDE6", ink: "#3A1F1A", accent: "#E0573B", soft: "#F4D9CC", muted: "#7A5A50" },
      slides: [
        { type: "cover", kicker: "Bloggerlar uchun", title: "Nega sizni <mark>kuzatishmayapti?</mark>", sub: "Koʻpchilik bilmasdan qiladigan 6 ta xato" },
        { type: "text", title: "Kontent bor — natija yoʻq?", body: "Har kuni post joylaysiz, lekin obunachilar oʻsmayapti.<br><br>Koʻpincha muammo algoritmda emas. Muammo — <b>kichik, lekin muhim</b> xatolarda." },
        { type: "step", num: "01", label: "Xato", title: "Hamma uchun yozish", body: "«Hammaga» yozilgan post hech kimga tegmaydi.<br><br><b>Toʻgʻrisi:</b> aniq bir odamni va uning aniq muammosini tasavvur qilib yozing." },
        { type: "step", num: "02", label: "Xato", title: "Zerikarli birinchi jumla", body: "Odamlar 2–3 soniyada qaror qiladi: oʻqiydimi yoki oʻtib ketadimi.<br><br><b>Toʻgʻrisi:</b> birinchi jumla yoki slayd — savol, raqam yoki kutilmagan fikr boʻlsin." },
        { type: "step", num: "03", label: "Xato", title: "Faqat sotish", body: "Har bir post reklama boʻlsa, odamlar obunani bekor qiladi.<br><br><b>Toʻgʻrisi:</b> 80% foyda va qiziqarli kontent, 20% sotuv." },
        { type: "step", num: "04", label: "Xato", title: "Yuzingizni yashirish", body: "Logotip va matnning oʻzi bilan ishonch qurish qiyin.<br><br><b>Toʻgʻrisi:</b> storis va videolarda oʻzingizni koʻrsating — odamlar odamga ishonadi." },
        { type: "step", num: "05", label: "Xato", title: "Tartibsiz joylash", body: "Bir hafta har kuni, keyin bir oy jimlik — auditoriya sizni unutadi.<br><br><b>Toʻgʻrisi:</b> oddiy kontent-reja tuzing va unga amal qiling." },
        { type: "step", num: "06", label: "Xato", title: "Statistikaga qaramaslik", body: "Qaysi post saqlangan, ulashilgan, izoh olgan — bu auditoriyangiz ovozi.<br><br><b>Toʻgʻrisi:</b> eng yaxshi ishlagan formatni koʻpaytiring." },
        { type: "cta", title: "Oʻzingizdan qaysi xatoni topdingiz?", body: "Izohda raqamini yozing — keyingi postlarda batafsil yozaman" },
      ],
    },
  ],
};
