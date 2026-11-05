import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Word} from './types';
import {RevealWord} from './Reveal';

// "Kuzgi storismaker" referensi: chapga tekislangan 3 qatlam (kichik oq -> KATTA sariq/oq/qizil plashkada -> kichik oq),
// qizil plashkali yorliqlar, oq fonda jigarrang iqtibos ekrani va Instagram "savol" stikeri.
type P<T> = {item: T; u: number; w: number; h: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const fadeOut = (now: number, end: number) => interpolate(now, [end - 0.18, end], [1, 0], clamp);
const halo = (u: number) => `0 0 ${18 * u}px rgba(0,0,0,0.6), 0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.55)`;
const YELLOW = '#F2E600';
const RED = '#D8262C';

const Words: React.FC<{words: Word[]; color: string}> = ({words, color}) => (
  <>
    {words.map((wd, i) => (
      <span key={i}>
        <RevealWord text={wd.w} t={wd.t} color={color} />
        {i < words.length - 1 ? ' ' : ''}
      </span>
    ))}
  </>
);

// KATTA so'z alohida sakrab chiqadi (scale 0.6 -> 1.05 -> 1).
const Pop: React.FC<{wd: Word; children: React.ReactNode}> = ({wd, children}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - wd.t) * fps, fps, config: {damping: 11, mass: 0.5}});
  return (
    <span style={{display: 'inline-block', transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: 'left bottom', opacity: Math.min(1, s * 2)}}>
      {children}
    </span>
  );
};

export const Story: React.FC<P<Extract<Item, {type: 'story'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const tone = item.tone ?? 'yellow';
  const hook = !!item.hook;
  const size = (item.size ?? (hook ? 120 : 108)) * u;
  const big = (
    <div style={{fontFamily: hook ? 'Oswald' : 'Montserrat', fontWeight: hook ? 700 : 800, fontSize: size, lineHeight: 1.02,
                 textTransform: 'uppercase', letterSpacing: hook ? 0 : -1 * u, marginTop: 4 * u}}>
      {item.big.map((wd, i) => (
        <Pop key={i} wd={wd}>
          <span style={tone === 'red'
            ? {background: RED, color: '#FFF', padding: `${2 * u}px ${16 * u}px`, borderRadius: 4 * u, display: 'inline-block',
               boxShadow: `0 ${6 * u}px ${18 * u}px rgba(0,0,0,0.35)`}
            : {color: tone === 'white' ? '#FFF' : YELLOW, textShadow: halo(u)}}>
            {wd.w}
          </span>
        </Pop>
      )).flatMap((el, i) => (i ? [' ', el] : [el]))}
    </div>
  );
  const small = (words: Word[], italic: boolean) => (
    <div style={{fontFamily: 'Montserrat', fontWeight: 500, fontStyle: italic ? 'italic' : 'normal', fontSize: (hook ? 50 : 48) * u,
                 lineHeight: 1.15, textShadow: halo(u), marginTop: 6 * u}}>
      <Words words={words} color="#FFF" />
    </div>
  );
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.74), left: w * (item.left ?? 0.07), right: w * 0.07,
                   textAlign: item.align ?? 'left'}}>
        {item.pre?.length ? small(item.pre, false) : null}
        {big}
        {item.post?.length ? small(item.post, hook) : null}
      </div>
    </AbsoluteFill>
  );
};

// Qizil plashkali yorliqlar ("Produsyer / Sotuv bo'limi bilan") - chapdan surilib chiqadi.
export const Labels: React.FC<P<Extract<Item, {type: 'labels'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.3), left: w * (item.left ?? 0.06), display: 'flex', flexDirection: 'column',
                   alignItems: 'flex-start', gap: 6 * u}}>
        {item.lines.map((ln, i) => {
          const p = interpolate(now, [ln.t, ln.t + 0.3], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
          return (
            <div key={i} style={{overflow: 'hidden', borderRadius: 3 * u}}>
              <div style={{background: i === 0 ? RED : 'rgba(20,20,20,0.72)', color: '#FFF', fontFamily: 'Montserrat',
                           fontWeight: i === 0 ? 700 : 500, fontSize: (i === 0 ? 40 : 34) * u, padding: `${3 * u}px ${14 * u}px`,
                           transform: `translateX(${(p - 1) * 105}%)`}}>
                {ln.w}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Oq/kulrang radial fon, jigarrang "❝" iqtibos + 2 qator izoh. Doira shaklida ochilib-yopiladi.
export const Quote: React.FC<P<Extract<Item, {type: 'quote'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const open = interpolate(now, [item.start, item.start + 0.45, item.end - 0.4, item.end], [0, 1, 1, 0],
                           {...clamp, easing: Easing.bezier(0.6, 0, 0.3, 1)});
  const r = Math.hypot(w, h) * 0.6 * open;
  const s = spring({frame: (now - item.start - 0.25) * fps, fps, config: {damping: 13, mass: 0.6}});
  const brown = '#6B4A1E';
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #FFFFFF 0%, #EDEDED 45%, #CFCFCF 100%)'}} />
      <div style={{position: 'absolute', top: h * (item.top ?? 0.36), left: w * 0.1, right: w * 0.08,
                   transform: `translateY(${(1 - s) * 40 * u}px)`, opacity: Math.min(1, s * 1.5)}}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 10 * u}}>
          <span style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 120 * u, lineHeight: 0.8, color: brown}}>❝</span>
          <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: (item.size ?? 86) * u, lineHeight: 1.0, color: brown,
                       letterSpacing: -1 * u}}>
            <Words words={item.big} color={brown} />
          </div>
        </div>
        {item.post?.length ? (
          <div style={{fontFamily: 'Montserrat', fontWeight: 600, fontSize: 44 * u, lineHeight: 1.2, color: '#4A3A26',
                       marginTop: 14 * u, marginLeft: 100 * u}}>
            <Words words={item.post} color="#4A3A26" />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Instagram "Ask me anything" savol stikeri (o'zbekcha): to'q sarlavha + oq savol qismi.
export const Ask: React.FC<P<Extract<Item, {type: 'ask'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const [x0, y0, x1, y1] = item.rect ?? [0.083, 0.086, 0.917, 0.254];
  const head = 0.4;
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', left: w * x0, top: h * y0, width: w * (x1 - x0), height: h * (y1 - y0), borderRadius: 26 * u,
                   overflow: 'hidden', boxShadow: `0 ${6 * u}px ${20 * u}px rgba(0,0,0,0.25)`, fontFamily: 'Montserrat'}}>
        <div style={{height: `${head * 100}%`, background: '#262A30', color: '#FFF', display: 'flex', alignItems: 'center',
                     justifyContent: 'center', fontWeight: 500, fontSize: 40 * u}}>
          {item.title}
        </div>
        <div style={{height: `${(1 - head) * 100}%`, background: '#FFF', color: '#111', display: 'flex', alignItems: 'center',
                     justifyContent: 'center', textAlign: 'center', fontWeight: 500, fontSize: (item.size ?? 46) * u, lineHeight: 1.15,
                     padding: `0 ${30 * u}px`}}>
          {item.question}
        </div>
      </div>
    </AbsoluteFill>
  );
};
