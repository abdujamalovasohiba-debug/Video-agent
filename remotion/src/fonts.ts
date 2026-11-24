import {continueRender, delayRender, staticFile} from 'remotion';

// Loyihaga qo'shilgan shriftlar (Google Fonts, OFL litsenziya) - tizimga bog'liq emas.
const FONTS = [
  {family: 'Oswald', file: 'fonts/Oswald.ttf'},
  {family: 'Montserrat', file: 'fonts/Montserrat.ttf'},
  {family: 'Courgette', file: 'fonts/Courgette.ttf'},
  {family: 'Anton', file: 'fonts/Anton.ttf'},
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Shriftlar yuklanmoqda');
  Promise.all(
    FONTS.map(async ({family, file}) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, family === 'Courgette' || family === 'Anton' ? {} : {weight: '100 900'});
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
