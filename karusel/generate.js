// Karusel slaydlarini 1080x1350 PNG qilib chiqaradi: node generate.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { handle, carousels } = require("./content");

const W = 1080, H = 1350;

const icons = {
  like: '<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/>',
  comment: '<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.3A8.5 8.5 0 1 1 21 11.5z"/>',
  share: '<path d="M22 3 11 14M22 3l-7 19-4-8-8-4 19-7z"/>',
  save: '<path d="M19 21l-7-5-7 5V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${icons[name]}</svg>`;

function slideHtml(c, s, i) {
  const t = c.theme, n = c.slides.length, last = i === n - 1;
  let inner = "";
  if (s.type === "cover") {
    inner = `
      <div class="cover">
        <div class="kicker">${s.kicker}</div>
        <h1>${s.title}</h1>
        <p class="sub">${s.sub}</p>
      </div>`;
  } else if (s.type === "step") {
    inner = `
      <div class="content">
        <div class="num"><span>${s.label || "Qadam"}</span>${s.num}</div>
        <h2>${s.title}</h2>
        <p class="body">${s.body}</p>
      </div>`;
  } else if (s.type === "text") {
    inner = `
      <div class="content">
        <div class="bar"></div>
        <h2>${s.title}</h2>
        <p class="body">${s.body}</p>
      </div>`;
  } else if (s.type === "cta") {
    inner = `
      <div class="content cta">
        <h2>${s.title}</h2>
        <p class="body">${s.body}</p>
        <div class="actions">
          ${[["like", "Yoqtiring"], ["comment", "Izoh"], ["save", "Saqlang"], ["share", "Ulashing"]]
            .map(([k, l]) => `<div class="act">${icon(k)}<span>${l}</span></div>`).join("")}
        </div>
        <div class="follow">Foydali kontent uchun obuna boʻling <b>${handle}</b></div>
      </div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  body { background: ${t.bg}; color: ${t.ink}; font-family: "Inter Display", Inter, sans-serif;
         position: relative; overflow: hidden; -webkit-font-smoothing: antialiased; }
  .deco { position: absolute; right: -180px; top: -180px; width: 560px; height: 560px;
          border-radius: 50%; background: ${t.soft}; }
  .deco2 { position: absolute; left: -260px; bottom: -300px; width: 420px; height: 420px;
           border-radius: 50%; border: 3px solid ${t.soft}; }
  header { position: absolute; top: 72px; left: 88px; right: 88px; display: flex;
           justify-content: space-between; font-size: 30px; font-weight: 600; color: ${t.muted}; z-index: 2; }
  footer { position: absolute; bottom: 72px; left: 88px; right: 88px; display: flex;
           align-items: center; justify-content: space-between; z-index: 2; }
  .progress { display: flex; gap: 10px; }
  .progress i { width: 34px; height: 8px; border-radius: 4px; background: ${t.soft}; }
  .progress i.on { background: ${t.accent}; }
  .swipe { font-size: 30px; font-weight: 700; color: ${t.ink}; display: flex; align-items: center; gap: 14px; }
  .swipe b { display: inline-flex; width: 64px; height: 64px; border-radius: 50%; background: ${t.accent};
             color: ${t.bg}; align-items: center; justify-content: center; font-size: 34px; }
  .cover, .content { position: absolute; left: 88px; right: 88px; top: 0; bottom: 0;
                     display: flex; flex-direction: column; justify-content: center; z-index: 1; }
  .kicker { align-self: flex-start; font-size: 30px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px;
            background: ${t.ink}; color: ${t.bg}; padding: 14px 26px; border-radius: 40px; margin-bottom: 52px; }
  h1 { font-size: 124px; overflow-wrap: normal; line-height: 1.02; font-weight: 800; letter-spacing: -3px; }
  mark { background: none; color: ${t.accent}; }
  .sub { font-size: 44px; line-height: 1.3; margin-top: 48px; color: ${t.muted}; font-weight: 500; max-width: 860px; }
  .num { font-size: 190px; font-weight: 800; line-height: 1; color: ${t.accent}; letter-spacing: -6px;
         display: flex; flex-direction: column; margin-bottom: 36px; }
  .num span { font-size: 30px; letter-spacing: 3px; text-transform: uppercase; color: ${t.muted};
              font-weight: 700; margin-bottom: 8px; }
  .bar { width: 120px; height: 14px; border-radius: 7px; background: ${t.accent}; margin-bottom: 52px; }
  h2 { font-size: 76px; line-height: 1.08; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 44px; }
  .body { font-size: 42px; line-height: 1.42; font-weight: 400; }
  .body b { font-weight: 700; color: ${t.ink}; box-shadow: inset 0 -16px 0 ${t.accent}55; }
  .cta { text-align: center; align-items: center; }
  .cta h2 { font-size: 84px; }
  .actions { display: flex; gap: 28px; margin-top: 72px; }
  .act { width: 190px; padding: 30px 0 26px; border-radius: 28px; background: ${t.soft};
         display: flex; flex-direction: column; align-items: center; gap: 16px; font-size: 28px; font-weight: 600; }
  .act svg { width: 64px; height: 64px; color: ${t.accent}; }
  .follow { margin-top: 64px; font-size: 34px; color: ${t.muted}; }
  .follow b { color: ${t.ink}; }
</style></head><body>
  <div class="deco"></div><div class="deco2"></div>
  <header><span>${handle}</span><span>${i + 1}/${n}</span></header>
  ${inner}
  <footer>
    <div class="progress">${c.slides.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
    ${last ? "" : `<div class="swipe">${i === 0 ? "Varaqlang" : "Keyingisi"} <b>→</b></div>`}
  </footer>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const c of carousels) {
    const dir = path.join(__dirname, "output", c.id);
    fs.mkdirSync(dir, { recursive: true });
    for (const [i, s] of c.slides.entries()) {
      await page.setContent(slideHtml(c, s, i));
      await page.evaluate(async () => {
        await document.fonts.ready;
        // Uzun so'zli sarlavhalarni chetdan chiqmaydigan qilib kichraytiradi
        for (const el of document.querySelectorAll("h1, h2")) {
          let size = parseFloat(getComputedStyle(el).fontSize);
          while (el.scrollWidth > el.clientWidth && size > 40) el.style.fontSize = `${(size -= 4)}px`;
        }
      });
      const file = path.join(dir, `${String(i + 1).padStart(2, "0")}.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
  }
  await browser.close();
})();
