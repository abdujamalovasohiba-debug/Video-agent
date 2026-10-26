// Referens uslublaridagi karusellarni 1080x1350 PNG qilib chiqaradi: node generate2.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
// Boshqa matn fayli bilan: node generate2.js content-target.js output-target
const { handle, cards = [], splits = [] } = require(path.resolve(__dirname, process.argv[2] || "content2.js"));
const OUT = process.argv[3] || "output-v2";

const W = 1080, H = 1350;
const YELLOW = "#F9B417", HL = "#FCEFB0";
// Karusel bo'yicha ranglar: content faylida c.theme bilan almashtirsa bo'ladi
const DEFAULT_THEME = { accent: YELLOW, bg: "#E6E3DD", card: "rgba(250,250,249,.86)", ink: "#0E0E0E",
  muted: "#222", hl: HL, bar: "#F7D54A", btn: "#fff", paper: .55, bgPhoto: null, minimal: false };

const has = (name) => !!name && fs.existsSync(path.join(__dirname, "photos", name));
const photo = (name) => {
  const file = path.join(__dirname, "photos", name);
  return `data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}`;
};

const svg = (d, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  reply: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  save: '<path d="M18 21l-6-4.5L6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"/>',
};
const longArrow = `<svg width="84" height="24" viewBox="0 0 84 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 12h78M70 3l10 9-10 9"/></svg>`;

const base = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  body { font-family: "Inter Display", Inter, sans-serif; position: relative; overflow: hidden;
         -webkit-font-smoothing: antialiased; }`;

function coverHtml(c) {
  const { cover } = c, t = { ...DEFAULT_THEME, ...c.theme };
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
  body { color: #fff; background: ${has(cover.photo) ? `#111 url(${photo(cover.photo)}) ${cover.pos || "center"}/cover`
    : `radial-gradient(120% 80% at 85% 0%, #3a3a3a 0%, #161616 55%, #0d0d0d 100%)`}; }
  .kicker { display: inline-block; margin-bottom: 44px; padding: 14px 30px; border-radius: 40px;
            border: 2px solid ${t.accent}; color: ${t.accent}; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
  .big { position: absolute; right: -40px; top: 60px; font-size: 520px; font-weight: 800; line-height: 1;
         color: rgba(255,255,255,.05); letter-spacing: -20px; }
  .shade { position: absolute; inset: 0;
           background: linear-gradient(180deg, rgba(0,0,0,0) 42%, rgba(0,0,0,.62) 62%, rgba(0,0,0,.92) 100%); }
  body.ph .text { bottom: 150px; }
  body.ph h1 { font-size: 78px; }
  body.ph .kicker { margin-bottom: 30px; font-size: 24px; padding: 10px 24px; background: rgba(0,0,0,.35); }
  body.ph .sub { font-size: 34px; margin-top: 36px; }
  .text { position: absolute; left: 70px; right: 70px; bottom: 210px; text-align: center; }
  h1 { font-size: 92px; line-height: 1.04; font-weight: 800; text-transform: uppercase; letter-spacing: -1px; text-wrap: balance; }
  h1 .y { color: ${t.accent}; position: relative; display: inline-block; }
  h1 .y::after { content: ""; position: absolute; left: 0; width: 58%; bottom: -14px; height: 6px;
                 border-radius: 3px; background: ${t.accent}; }
  .sub { margin-top: 44px; font-size: 38px; line-height: 1.3; color: rgba(255,255,255,.82); }
  footer { position: absolute; left: 100px; right: 100px; bottom: 76px; display: flex;
           justify-content: space-between; align-items: center; font-size: 30px; font-weight: 500; }
  </style></head><body class="${has(cover.photo) ? "ph" : ""}">
  ${has(cover.photo) ? `<div class="shade"></div>` : cover.big ? `<div class="big">${cover.big}</div>` : ""}
  <div class="text">${cover.kicker ? `<div class="kicker">${cover.kicker}</div>` : ""}<h1>${cover.line1}<br><span class="y">${cover.line2}</span></h1><p class="sub">${cover.sub}</p></div>
  <footer><span>${handle}</span>${longArrow.replace('width="84"', 'width="60"')}</footer>
  </body></html>`;
}

function cardHtml(s, i, n, t) {
  const counter = `${String(i).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
  body { background: ${t.bg}; color: ${t.ink}; }
  .paper { position: absolute; inset: 0; filter: url(#paper); opacity: ${t.paper}; }
  .bgph { position: absolute; inset: -40px; background: center/cover; filter: blur(28px) brightness(.8); }
  .bgph::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,.18); }
  body.min .card { padding-top: 76px; }
  body.min .label { margin-bottom: 34px; }
  .card { position: absolute; left: 84px; right: 78px; top: 50%; transform: translateY(-50%); min-height: 845px;
          background: ${t.card}; border-radius: 50px; padding: 36px 46px 64px 72px;
          box-shadow: 0 30px 70px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.05), inset 0 0 0 2px rgba(255,255,255,.8); }
  .bar { display: flex; align-items: center; justify-content: space-between; margin: 0 0 30px -28px; }
  .btn { width: 88px; height: 88px; border-radius: 50%; background: ${t.btn}; display: flex; align-items: center;
         justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,.06); }
  .btn svg { width: 40px; height: 40px; }
  .right { display: flex; align-items: center; gap: 36px; }
  .pill { display: flex; gap: 40px; padding: 22px 46px; background: ${t.btn}; border-radius: 50px;
          box-shadow: 0 4px 14px rgba(0,0,0,.06); }
  .pill svg { width: 40px; height: 40px; }
  .dots { display: flex; gap: 8px; align-items: center; }
  .dots i { width: 9px; height: 9px; border-radius: 50%; background: ${t.ink}; }
  .count { font-size: 28px; letter-spacing: 1px; }
  .label { display: flex; align-items: center; gap: 26px; font-size: 32px; font-style: italic;
           text-transform: uppercase; margin-bottom: 26px; }
  .label::before { content: ""; width: 7px; height: 62px; border-radius: 4px; background: ${t.bar}; margin-left: -12px; }
  h2 { font-size: 80px; line-height: 1.12; font-weight: 800; letter-spacing: -2.5px; margin-bottom: 40px; }
  h2.final { font-size: 96px; text-transform: uppercase; letter-spacing: -2px; }
  mark { background: linear-gradient(transparent 14%, ${t.hl} 14%, ${t.hl} 94%, transparent 94%); color: inherit; padding: 0 10px; margin: 0 -6px; border-radius: 12px;
         -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  .body { font-size: 44px; line-height: 1.36; letter-spacing: -.5px; margin-bottom: 34px; }
  .note { font-size: 36px; line-height: 1.38; letter-spacing: -.3px; max-width: 760px; }
  .note b { font-weight: 800; }
  footer { position: absolute; left: 82px; right: 72px; bottom: 30px; display: flex; justify-content: space-between;
           align-items: center; font-size: 28px; color: ${t.muted}; }
  footer .save { display: flex; align-items: center; gap: 14px; }
  footer .save svg { width: 34px; height: 34px; }
  </style></head><body class="${t.minimal ? "min" : ""}">
  ${t.bgPhoto && has(t.bgPhoto) ? `<div class="bgph" style="background-image:url(${photo(t.bgPhoto)})"></div>` : ""}
  <svg width="0" height="0" style="position:absolute"><filter id="paper">
    <feTurbulence type="fractalNoise" baseFrequency=".008 .02" numOctaves="4" seed="7"/>
    <feDiffuseLighting lighting-color="#fff" surfaceScale="2.2"><feDistantLight azimuth="45" elevation="55"/></feDiffuseLighting>
  </filter></svg>
  <div class="paper"></div>
  <div class="card">
    ${t.minimal ? "" : `<div class="bar">
      <div class="btn">${svg(ICON.back)}</div>
      <div class="right">
        <div class="pill">${svg(ICON.reply)}${svg(ICON.share)}<div class="dots"><i></i><i></i><i></i></div></div>
        <span class="count">${counter}</span>
      </div>
    </div>`}
    <div class="label">${s.label}</div>
    <h2 class="${s.final ? "final" : ""}">${s.title}</h2>
    <p class="body">${s.body}</p>
    <p class="note">${s.note}</p>
  </div>
  <footer><span>${handle}${t.minimal ? ` · ${counter}` : ""}</span>${s.final ? `<span class="save">Saqlab qoʻying ${svg(ICON.save)}</span>` : longArrow}</footer>
  </body></html>`;
}

function splitHtml(s) {
  const img = photo(s.photo);
  const half = (bw, text) => `
    <div class="half"><div class="img${bw ? " bw" : ""}" style="background-image:url(${img});background-position:${s.pos || "center"}"></div>
      <div class="t" style="left:${s.x}%;top:${s.y}%">${text}</div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
  body { background: #000; }
  .half { position: relative; width: ${W}px; height: ${H / 2}px; overflow: hidden; }
  .img { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .bw { filter: grayscale(1) contrast(1.08) brightness(.95); }
  .img:not(.bw) { filter: saturate(1.15); }
  .t { position: absolute; color: #fff; font-size: 66px; font-weight: 700; letter-spacing: -.5px; white-space: nowrap;
       text-shadow: 0 2px 6px rgba(0,0,0,.45), 0 4px 30px rgba(0,0,0,.6); }
  .half::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,.16); }
  .t { z-index: 1; }
  </style></head><body>${half(true, s.top)}${half(false, s.bottom)}</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const shot = async (html, file) => {
    await page.setContent(html);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
      // Sig'magan sarlavhalarni kichraytiradi
      for (const el of document.querySelectorAll("h1, h2, .t")) {
        const box = el.closest(".text, .card, .half");
        let size = parseFloat(getComputedStyle(el).fontSize);
        const over = () => el.scrollWidth > el.clientWidth ||
          (el.matches(".t") && el.getBoundingClientRect().right > box.getBoundingClientRect().right - 40);
        while (over() && size > 36) el.style.fontSize = `${(size -= 3)}px`;
      }
    });
    await page.waitForTimeout(150);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot({ path: file });
    console.log(file);
  };
  const out = (id, k) => path.join(__dirname, OUT, id, `${String(k).padStart(2, "0")}.png`);

  for (const c of cards) {
    const n = c.slides.length + 1;
    await shot(coverHtml(c), out(c.id, 1));
    for (const [i, s] of c.slides.entries()) await shot(cardHtml(s, i + 2, n, { ...DEFAULT_THEME, ...c.theme }), out(c.id, i + 2));
  }
  for (const c of splits) {
    for (const [i, s] of c.slides.entries()) {
      if (has(s.photo)) await shot(splitHtml(s), out(c.id, i + 1));
      else console.log(`rasm yo'q, slayd o'tkazib yuborildi: photos/${s.photo}`);
    }
  }
  await browser.close();
})();
