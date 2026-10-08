import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Word} from './types';

// "AI explainer oltin" uslubi: oltin gradient KATTA so'z + kichik oq kursiv qatorlar, klaviatura tugmalari,
// pochta markasi kartalari, oq tushuntirish ekranlari (suyuq parda bilan), oltin nur, kursor-teg.
type P<T> = {item: T; u: number; w: number; h: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const fadeOut = (now: number, end: number) => interpolate(now, [end - 0.12, end], [1, 0], clamp);
const pop = (now: number, t: number, fps: number) => spring({frame: (now - t) * fps, fps, config: {damping: 10, mass: 0.45, stiffness: 180}});

const GOLD_GRAD = 'linear-gradient(180deg, #FFE27A 0%, #FFC21A 45%, #F59E0B 100%)';
const shadow = (u: number) => `0 0 ${4 * u}px rgba(0,0,0,0.85), 0 0 ${14 * u}px rgba(0,0,0,0.6), 0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.5)`;

// Bitta so'z: kichikdan sakrab chiqadi (0.6 -> 1.05 -> 1).
const PopWord: React.FC<{wd: Word; style: React.CSSProperties; gold?: boolean; u: number}> = ({wd, style, gold, u}) => {
  const {now, fps} = useNow();
  const s = pop(now, wd.t, fps);
  if (now < wd.t - 0.02) return <span style={{...style, opacity: 0}}>{wd.w} </span>;
  const g: React.CSSProperties = gold
    ? {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
       filter: `drop-shadow(0 0 ${3 * u}px rgba(40,20,0,0.9)) drop-shadow(0 ${4 * u}px ${10 * u}px rgba(0,0,0,0.6))`}
    : {textShadow: shadow(u)};
  return (
    <span style={{display: 'inline-block', transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 2), ...style, ...g}}>
      {wd.w}&nbsp;
    </span>
  );
};

const Small: React.FC<{words?: Word[]; u: number; size?: number}> = ({words, u, size = 50}) =>
  words?.length ? (
    <div style={{fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 600, fontSize: size * u, color: '#FFFFFF', lineHeight: 1.1}}>
      {words.map((wd, i) => <PopWord key={i} wd={wd} u={u} style={{}} />)}
    </div>
  ) : null;

// Sichqoncha kursori + brend yorlig'i, sekin suzib yuradi.
const CursorTag: React.FC<{label: string; u: number; x: number; y: number; t0: number}> = ({label, u, x, y, t0}) => {
  const {now} = useNow();
  const k = now - t0;
  const dx = Math.sin(k * 1.7) * 26 * u, dy = Math.cos(k * 1.3) * 16 * u;
  return (
    <div style={{position: 'absolute', left: x + dx, top: y + dy, display: 'flex', alignItems: 'flex-start'}}>
      <svg width={34 * u} height={40 * u} viewBox="0 0 17 20">
        <path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" fill="#FFC21A" stroke="#1A1A1A" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <div style={{marginTop: 26 * u, marginLeft: -4 * u, background: '#FFFFFF', color: '#1A1A1A', fontFamily: 'Montserrat',
                   fontWeight: 700, fontSize: 22 * u, padding: `${4 * u}px ${12 * u}px`, borderRadius: 999,
                   boxShadow: `0 ${3 * u}px ${10 * u}px rgba(0,0,0,0.25)`}}>{label}</div>
    </div>
  );
};

// Ekranni kesib o'tuvchi to'lqinli oltin chiziq.
const Wave: React.FC<{u: number; w: number; y: number; t0: number}> = ({u, w, y, t0}) => {
  const {now} = useNow();
  const p = interpolate(now, [t0, t0 + 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ph = (now - t0) * 4;
  let d = '';
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * w;
    const yy = y + Math.sin(i / 40 * Math.PI * 3 + ph) * 22 * u;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)} `;
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={w} height={y + 60 * u}>
      <path d={d} fill="none" stroke="#FFB800" strokeWidth={9 * u} strokeLinecap="round" strokeDasharray={w * 1.6}
            strokeDashoffset={w * 1.6 * (1 - p)} />
    </svg>
  );
};

// 1) Uch qavatli matn: kichik oq kursiv / oltin KATTA / kichik oq kursiv (+ ixtiyoriy pill, to'lqin, kursor).
export const Tri: React.FC<P<Extract<Item, {type: 'tri'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const top = h * (item.top ?? 0.54);
  const pillT = item.big[0]?.t ?? item.start;
  const ps = pop(now, pillT - 0.15, fps);
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      {item.wave ? <Wave u={u} w={w} y={top + 230 * u} t0={item.big[0]?.t ?? item.start} /> : null}
      <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                   padding: `0 ${50 * u}px`}}>
        <Small words={item.pre} u={u} />
        {item.pill ? (
          <div style={{transform: `scale(${ps})`, background: '#FFC21A', color: '#1A1A1A', fontFamily: 'Montserrat', fontWeight: 800,
                       fontSize: 26 * u, padding: `${3 * u}px ${14 * u}px`, borderRadius: 999, margin: `${4 * u}px 0`}}>{item.pill}</div>
        ) : null}
        <div style={{fontFamily: 'Montserrat', fontWeight: 900, fontStyle: 'italic', fontSize: (item.size ?? 104) * u, lineHeight: 1.0,
                     letterSpacing: -1 * u, textTransform: 'uppercase'}}>
          {item.big.map((wd, i) => <PopWord key={i} wd={wd} u={u} gold style={{}} />)}
        </div>
        <Small words={item.post} u={u} />
      </div>
      {item.tag ? <CursorTag label={item.tag} u={u} x={w * 0.62} y={top + 150 * u} t0={item.start} /> : null}
    </AbsoluteFill>
  );
};

// 2) Klaviatura tugmalari: belgilar avtomatdagidek aylanib, kerakli harfda to'xtaydi; atrofida tanlov ramkasi.
const ROLL = '0123456789$%#@AIX+';
export const Keys: React.FC<P<Extract<Item, {type: 'keys'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const top = h * (item.top ?? 0.55);
  const size = 128 * u, gap = 18 * u;
  const total = item.keys.length * size + (item.keys.length - 1) * gap;
  const frame = interpolate(now, [item.start, item.start + 0.35], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', top: top - 64 * u, left: 0, right: 0, textAlign: 'center'}}><Small words={item.pre} u={u} /></div>
      <div style={{position: 'absolute', top, left: (w - total) / 2, display: 'flex', gap}}>
        {item.keys.map((k, i) => {
          const s = pop(now, item.start + i * 0.07, fps);
          const settled = now >= k.t;
          const ch = settled ? k.c : ROLL[Math.floor(now * 22 + i * 5) % ROLL.length];
          const bump = settled ? spring({frame: (now - k.t) * fps, fps, config: {damping: 9, mass: 0.4}}) : 0;
          return (
            <div key={i} style={{width: size, height: size, transform: `scale(${s}) translateY(${(1 - bump) * 0}px)`, position: 'relative'}}>
              <div style={{position: 'absolute', inset: 0, top: 10 * u, borderRadius: 22 * u, background: '#C77700'}} />
              <div style={{position: 'absolute', inset: 0, bottom: 10 * u, borderRadius: 22 * u, background: GOLD_GRAD,
                           boxShadow: `inset 0 ${4 * u}px ${6 * u}px rgba(255,255,255,0.55), 0 ${10 * u}px ${24 * u}px rgba(0,0,0,0.35)`,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                <span style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 70 * u, color: '#FFFFFF',
                              textShadow: `0 ${2 * u}px ${4 * u}px rgba(150,80,0,0.6)`,
                              transform: `translateY(${settled ? (1 - bump) * -30 * u : 0}px)`, opacity: settled ? 1 : 0.75}}>{ch}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Figma'dagidek tanlov ramkasi */}
      <div style={{position: 'absolute', top: top - 16 * u, left: (w - total) / 2 - 16 * u, width: (total + 32 * u) * frame, height: size + 32 * u,
                   border: `${2 * u}px solid #FFC21A`, opacity: frame}}>
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
          <div key={i} style={{position: 'absolute', left: x ? undefined : -7 * u, right: x ? -7 * u : undefined, top: y ? undefined : -7 * u,
                               bottom: y ? -7 * u : undefined, width: 12 * u, height: 12 * u, background: '#FFFFFF', border: `${2 * u}px solid #FFC21A`}} />
        ))}
      </div>
      <div style={{position: 'absolute', top: top + size + 34 * u, left: 0, right: 0, textAlign: 'center'}}><Small words={item.post} u={u} /></div>
      {item.tag ? <CursorTag label={item.tag} u={u} x={w * 0.66} y={top + size + 10 * u} t0={item.start} /> : null}
    </AbsoluteFill>
  );
};

// 3) Pochta markasi kartalari: tishli qirrali oltin kvadrat + ikonka + yozuv; qiyshayib kirib ustma-ust tushadi.
export const Stamps: React.FC<P<Extract<Item, {type: 'stamps'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const top = h * (item.top ?? 0.55);
  const size = 220 * u;
  const n = item.cards.length;
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', top: top - 70 * u, left: 0, right: 0, textAlign: 'center'}}><Small words={item.pre} u={u} /></div>
      {item.cards.map((c, i) => {
        const s = pop(now, c.t, fps);
        if (now < c.t) return null;
        const x = w / 2 - size / 2 + (i - (n - 1) / 2) * size * 0.78;
        const rot = (i % 2 ? 7 : -8) + (1 - s) * (i % 2 ? 40 : -40);
        const hole = 7 * u;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: top + (i % 2 ? 26 : 0) * u, width: size, height: size,
                               transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * s})`, filter: `drop-shadow(0 ${10 * u}px ${18 * u}px rgba(0,0,0,0.35))`}}>
            <div style={{position: 'absolute', inset: 0, background: '#FFB800',
                         WebkitMaskImage: `radial-gradient(circle at ${hole}px ${hole}px, transparent ${hole * 0.62}px, #000 ${hole * 0.7}px)`,
                         WebkitMaskSize: `${hole * 2}px ${hole * 2}px`, WebkitMaskPosition: `-${hole}px -${hole}px`}} />
            <div style={{position: 'absolute', inset: hole * 1.4, background: GOLD_GRAD, borderRadius: 4 * u, display: 'flex', flexDirection: 'column',
                         alignItems: 'center', justifyContent: 'center', gap: 8 * u}}>
              <div style={{fontSize: 78 * u, lineHeight: 1}}>{c.icon}</div>
              <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34 * u, color: '#1A1A1A'}}>{c.label}</div>
            </div>
          </div>
        );
      })}
      {item.tag ? <CursorTag label={item.tag} u={u} x={w * 0.6} y={top + size + 40 * u} t0={item.start} /> : null}
    </AbsoluteFill>
  );
};

// Suyuq (blob) parda: to'lqinli qirra ekranni yuqoridan pastga yopadi / ochadi.
const blobPath = (w: number, h: number, edge: number, ph: number, u: number, below: boolean) => {
  let d = below ? `M0,${h} L0,${edge} ` : `M0,0 L0,${edge} `;
  for (let i = 0; i <= 48; i++) {
    const x = (i / 48) * w;
    const y = edge + Math.sin(i / 48 * Math.PI * 2.2 + ph) * 70 * u + Math.sin(i / 48 * Math.PI * 5.3 + ph * 1.7) * 28 * u;
    d += `L${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d + (below ? `L${w},${h} Z` : `L${w},0 Z`);
};

// 4) Oq tushuntirish ekrani: katta qora iqtibos yoki ilova ikonkasi + progress.
export const White: React.FC<P<Extract<Item, {type: 'white'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const pin = interpolate(now, [item.start, item.start + 0.5], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const pout = interpolate(now, [item.end - 0.5, item.end], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ph = now * 3;
  const covering = pout <= 0;
  const edge = covering ? -0.25 * h + pin * 1.5 * h : -0.25 * h + pout * 1.5 * h;
  const content = interpolate(now, [item.start + 0.35, item.start + 0.6, item.end - 0.45, item.end - 0.3], [0, 1, 1, 0], clamp);
  const qs = pop(now, item.start + 0.45, fps);
  const app = item.app;
  return (
    <AbsoluteFill>
      <svg style={{position: 'absolute', inset: 0}} width={w} height={h}>
        <path d={blobPath(w, h, edge, ph, u, !covering)} fill="#F5F5F5" />
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: content, textAlign: 'center', padding: `0 ${70 * u}px`}}>
        {item.pre ? <div style={{fontFamily: 'Montserrat', fontWeight: 600, fontSize: 52 * u, color: '#444', marginBottom: 22 * u}}>{item.pre}</div> : null}
        {item.quote ? (
          <div style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: (item.size ?? 150) * u, color: '#111', lineHeight: 1,
                       letterSpacing: -3 * u, transform: `scale(${0.7 + 0.3 * qs})`}}>
            “{item.quote}”
          </div>
        ) : null}
        {app ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${(0.6 + 0.4 * qs) * 1.35})`, margin: `${60 * u}px 0`}}>
            <div style={{width: 300 * u, height: 300 * u, borderRadius: 64 * u, background: '#141414', display: 'flex', flexDirection: 'column',
                         alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${20 * u}px ${40 * u}px rgba(0,0,0,0.25)`}}>
              {app.image ? <Img src={staticFile(app.image)} style={{width: 150 * u, height: 150 * u, borderRadius: '50%', objectFit: 'cover'}} />
                         : <div style={{fontSize: 110 * u, lineHeight: 1}}>{app.icon}</div>}
              <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40 * u, color: '#FFF', marginTop: 10 * u}}>{app.label}</div>
              {app.pill ? <div style={{marginTop: 8 * u, background: '#22C55E', color: '#FFF', fontFamily: 'Montserrat', fontWeight: 800,
                                       fontSize: 22 * u, padding: `${2 * u}px ${14 * u}px`, borderRadius: 999}}>{app.pill}</div> : null}
            </div>
            {app.total ? (
              <div style={{display: 'flex', alignItems: 'center', marginTop: 70 * u}}>
                {Array.from({length: app.total}).map((_, i) => {
                  const on = interpolate(now, [item.start + 0.6 + i * 0.25, item.start + 0.8 + i * 0.25], [0, 1], clamp);
                  return (
                    <div key={i} style={{display: 'flex', alignItems: 'center'}}>
                      {i ? <div style={{width: 90 * u, height: 6 * u, background: `linear-gradient(90deg, #FFB800 ${on * 100}%, #DDD ${on * 100}%)`}} /> : null}
                      <div style={{width: 40 * u, height: 40 * u, borderRadius: '50%', background: on > 0.5 ? '#FFB800' : '#DDD', color: '#FFF',
                                   fontFamily: 'Montserrat', fontWeight: 800, fontSize: 22 * u, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
        {item.post ? <div style={{fontFamily: 'Montserrat', fontWeight: 600, fontStyle: 'italic', fontSize: 54 * u, color: '#222', marginTop: 30 * u}}>{item.post}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 5) Oltin nur (light leak) - CTA oldidan.
export const Glow: React.FC<P<Extract<Item, {type: 'glow'}>>> = ({item}) => {
  const {now} = useNow();
  const p = interpolate(now, [item.start, item.start + item.dur], [0, 1], clamp);
  const a = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: a,
      background: `linear-gradient(${100 + 30 * p}deg, rgba(0,0,0,0) ${10 + 40 * p}%, rgba(255,200,80,0.95) ${30 + 40 * p}%, rgba(255,250,220,0.9) ${38 + 40 * p}%, rgba(255,170,40,0.7) ${48 + 40 * p}%, rgba(0,0,0,0) ${70 + 30 * p}%)`}} />
  );
};
