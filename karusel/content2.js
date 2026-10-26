// Yangi uslubdagi karusellar matni. O'zgartirgach: node generate2.js
// Rasmlar photos/ papkasida — o'zingiznikiga almashtirsangiz bo'ladi (nomini saqlang).
module.exports = {
  handle: "@sohiba_abdujamolova",

  // A uslub: rasmli muqova + oq kartochkali slaydlar
  cards: [
    {
      id: "A1-shaxsiy-brend",
      cover: { photo: "cover-brend.jpg", line1: "Shaxsiy brendni", line2: "0 dan boshlash", sub: "7 qadamda — hech qanday byudjetsiz.<br>Saqlab qoʻying." },
      slides: [
        { label: "Nisha", title: "Kimga va qanday <mark>muammoda</mark> yordam berasiz?", body: "Javobni bitta jumlada yozib chiqing.", note: "Javob aniq boʻlmasa — kontent ham tarqoq boʻladi." },
        { label: "Auditoriya", title: "«Hamma» uchun emas — <mark>bitta odam</mark> uchun yozing.", body: "Uning yoshi, kasbi, qiyinchiligi va orzusini tasavvur qiling.", note: "Unga xat yozayotgandek yozing." },
        { label: "Mavzular", title: "<mark>3 ta asosiy</mark> mavzu tanlang.", body: "Ekspertlik — nimani bilasiz.<br>Hayotingiz — qanday yashaysiz.<br>Qadriyatlar — nimaga ishonasiz.", note: "Shu uchtasi atrofida aylaning." },
        { label: "Profil", title: "Profilingiz — sizning <mark>vitrinangiz.</mark>", body: "Yuzingiz koʻrinadigan rasm, kimligingiz va foydangizni aytadigan bio, bitta aniq havola.", note: "Yangi odam 3 soniyada tushunishi kerak." },
        { label: "Muntazamlik", title: "Mukammallik emas — <mark>muntazamlik.</mark>", body: "Haftada 3 ta oddiy post oyda 1 ta «ideal» postdan koʻproq natija beradi.", note: "Algoritm ham, odamlar ham barqarorlikni sevadi." },
        { label: "Hikoya", title: "Faktlar unutiladi, <mark>hikoyalar</mark> esda qoladi.", body: "Xatolaringiz, saboqlaringiz va kichik gʻalabalaringiz haqida gapiring.", note: "Aynan shular sizni boshqalardan ajratadi." },
        { label: "Muloqot", title: "Brend — monolog emas, <mark>suhbat.</mark>", body: "Har bir izohga javob bering, storisda savol bering, soʻrovnomalar oʻtkazing.", note: "Odamlar oʻzini eshitgan joyga qaytadi." },
        { label: "Ishonch", final: true, title: "<mark>Eslab qoling!</mark>", body: "Shaxsiy brend bitta postda qurilmaydi.", note: "Uni har kungi kichik qadamlar va <b>auditoriya ishonchi</b> quradi." },
      ],
    },
    {
      id: "A2-vaqt-boshqaruvi",
      cover: { photo: "cover-vaqt.jpg", line1: "Vaqtingizni oʻgʻirlaydigan", line2: "5 ta odat", sub: "«Vaqtim yetmayapti» deysizmi?<br>Aslida u boshqa joyga ketyapti." },
      slides: [
        { label: "Tong", title: "Kunni <mark>telefondan</mark> boshlash.", body: "Koʻz ochishingiz bilan lenta va xabarlarga shoʻngʻiysiz.", note: "<b>Yechim:</b> uygʻongandan keyingi 30 daqiqa — telefonsiz." },
        { label: "Fokus", title: "Hammasini <mark>birdaniga</mark> qilish.", body: "Multitasking — bu tez ishlash emas, tez charchash.", note: "<b>Yechim:</b> bitta vazifa, 25 daqiqa toʻliq fokus, 5 daqiqa dam." },
        { label: "Reja", title: "<mark>Rejasiz</mark> boshlangan kun.", body: "Reja boʻlmasa, kunni boshqalarning vazifalari toʻldiradi.", note: "<b>Yechim:</b> kechqurun ertangi 3 ta eng muhim ishni yozing." },
        { label: "Chegaralar", title: "«Yoʻq» deya <mark>olmaslik.</mark>", body: "Har bir «ha» — boshqa narsaga aytilgan «yoʻq».", note: "<b>Yechim:</b> «Bu meni maqsadimga yaqinlashtiradimi?» deb soʻrang." },
        { label: "Diqqat", title: "Cheksiz <mark>bildirishnomalar.</mark>", body: "Har bir «dzing» diqqatni boʻladi, unga qaytish esa vaqt oladi.", note: "<b>Yechim:</b> keraksizlarini oʻchiring, xabarlarni kuniga 2–3 marta tekshiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Hammasini birdan oʻzgartirmang.", note: "Bugun <b>faqat bitta</b> odatni tanlang. Sizda nechta odat bor ekan? Izohda yozing." },
      ],
    },
    {
      id: "A3-blog-xatolari",
      cover: { photo: "cover-blog.jpg", line1: "Nega sizni", line2: "kuzatishmayapti?", sub: "Koʻpchilik bloggerlar bilmasdan<br>qiladigan 6 ta xato." },
      slides: [
        { label: "Auditoriya", title: "<mark>Hamma uchun</mark> yozish.", body: "«Hammaga» yozilgan post hech kimga tegmaydi.", note: "<b>Toʻgʻrisi:</b> aniq bir odam va uning aniq muammosi uchun yozing." },
        { label: "Ilgak", title: "Zerikarli <mark>birinchi jumla.</mark>", body: "Odamlar 2–3 soniyada qaror qiladi: oʻqiydimi yoki oʻtib ketadimi.", note: "<b>Toʻgʻrisi:</b> savol, raqam yoki kutilmagan fikr bilan boshlang." },
        { label: "Sotuv", title: "Har bir postda <mark>faqat sotish.</mark>", body: "Lenta reklama taxtasiga aylansa, odamlar obunani bekor qiladi.", note: "<b>Toʻgʻrisi:</b> 80% foyda va qiziqarli kontent, 20% sotuv." },
        { label: "Ishonch", title: "<mark>Yuzingizni</mark> yashirish.", body: "Logotip va matnning oʻzi bilan ishonch qurish qiyin.", note: "<b>Toʻgʻrisi:</b> storis va videolarda oʻzingizni koʻrsating." },
        { label: "Davomiylik", title: "<mark>Tartibsiz</mark> joylash.", body: "Bir hafta har kuni, keyin bir oy jimlik — auditoriya sizni unutadi.", note: "<b>Toʻgʻrisi:</b> oddiy kontent-reja tuzing va unga amal qiling." },
        { label: "Tahlil", title: "<mark>Statistikaga</mark> qaramaslik.", body: "Saqlangan, ulashilgan va izoh olgan postlar — auditoriyangiz ovozi.", note: "<b>Toʻgʻrisi:</b> eng yaxshi ishlagan formatni koʻpaytiring." },
        { label: "Xulosa", final: true, title: "<mark>Eslab qoling!</mark>", body: "Muammo koʻpincha algoritmda emas.", note: "Oʻzingizdan qaysi xatoni topdingiz? <b>Izohda raqamini yozing.</b>" },
      ],
    },
  ],

  // B uslub: bitta rasm — tepasi oq-qora, pasti rangli, ikki qisqa jumla.
  // x, y — matn joylashuvi har bir yarimda (foizda, chap-yuqori burchakdan).
  splits: [
    {
      id: "B1-qaytadan-boshlang",
      slides: [
        { photo: "split-tong.jpg", top: "Yomon tongmi?", bottom: "Tushlikda qaytadan boshlang.", x: 52, y: 62 },
        { photo: "split-sahna.jpg", top: "Yomon kunmi?", bottom: "Ertaga qaytadan boshlang.", x: 6, y: 52 },
        { photo: "cover-brend.jpg", top: "Yomon haftami?", bottom: "Dushanbadan qaytadan boshlang.", x: 6, y: 18 },
        { photo: "cover-vaqt.jpg", top: "Shijoatingiz soʻndimi?", bottom: "Har doim qaytadan boshlash mumkin.", x: 6, y: 16 },
      ],
    },
  ],
};
