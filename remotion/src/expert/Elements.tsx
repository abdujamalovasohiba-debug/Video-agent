import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Line, Palette} from './types';
import {RevealLine, RevealWord, lineFont} from './Reveal';

type P<T> = {item: T; u: number; pal: Palette; w: number; h: number; top?: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useTime = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps, frame};
};

// 1) Hook: krem plashka, ikki qator siqiq qalin harflar, "sakrab" chiqadi.
export const Hook: React.FC<P<Extract<Item, {type: 'hook'}>>> = ({item, u, pal, w, h}) => {
  const {now, fps} = useTime();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 13, mass: 0.6}});
  const out = interpolate(now, [item.end - 0.2, item.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: h * (item.top ?? 0.515)}}>
      <div
        style={{
          background: pal.hookBg,
          borderRadius: 14 * u,
          padding: `${10 * u}px ${22 * u}px ${12 * u}px`,
          maxWidth: w * 0.9,
          textAlign: 'center',
          fontFamily: 'Anton, Oswald, sans-serif',
          textTransform: 'uppercase',
          lineHeight: 1.05,
          transform: `scale(${0.6 + 0.4 * s})`,
          opacity: Math.min(1, s * 1.4) * out,
          boxShadow: `0 ${6 * u}px ${24 * u}px rgba(0,0,0,0.25)`,
        }}
      >
        <div style={{fontSize: 52 * u, color: '#111'}}>{item.small}</div>
        <div style={{fontSize: 86 * u, color: pal.brown}}>{item.big}</div>
      </div>
    </AbsoluteFill>
  );
};

// 2) To'liq ekranli jigarrang karta: matn so'zma-so'z paydo bo'ladi.
export const Card: React.FC<P<Extract<Item, {type: 'card'}>>> = ({item, u, pal}) => {
  return (
    <AbsoluteFill style={{background: pal.brown, justifyContent: 'center', alignItems: 'center', padding: `0 ${90 * u}px`}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6 * u, width: '100%'}}>
        {item.lines.map((ln, i) => (
          <RevealLine
            key={i}
            line={ln}
            u={u}
            color={ln.style === 'caps' ? pal.cream : pal.cream}
            font={ln.style === 'caps' ? {fontFamily: 'Oswald', fontWeight: 700, fontSize: 118 * u, letterSpacing: 0} : {fontWeight: 500, fontSize: 76 * u}}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 3) Matn (subtitr o'rniga): birinchi qator - KATTA sarg'ish kalit so'z, qolganlari oq.
export const Caption: React.FC<P<Extract<Item, {type: 'caption'}>>> = ({item, u, pal, h, top}) => {
  const {now} = useTime();
  const out = interpolate(now, [item.end - 0.15, item.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', padding: `${h * (item.top ?? top ?? 0.355)}px ${70 * u}px 0`, opacity: out,
                          textShadow: `0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.65), 0 0 ${14 * u}px rgba(0,0,0,0.35)`}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2 * u}}>
        {item.lines.map((ln, i) => (
          <RevealLine key={i} line={ln} u={u} color={ln.style === 'caps' ? pal.keyword : pal.text} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 4) Raqamli plashka: kichik kvadrat "sakrab" chiqadi, so'ng o'ngga cho'ziladi; matn so'zma-so'z.
export const NumberBox: React.FC<P<Extract<Item, {type: 'number'}>>> = ({item, u, pal, w, h}) => {
  const {now, fps} = useTime();
  const pop = spring({frame: (now - item.start) * fps, fps, config: {damping: 11, mass: 0.5}});
  const firstWord = item.lines[0]?.words[0]?.t ?? item.start + 0.6;
  const grow = interpolate(now, [Math.max(item.start + 0.35, firstWord - 0.35), Math.max(item.start + 0.75, firstWord)], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });
  const out = interpolate(now, [item.end - 0.2, item.end], [1, 0], clamp);
  const small = 165 * u;
  const full = w * 0.82;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: h * (item.top ?? 0.555), paddingLeft: w * 0.09}}>
      <div
        style={{
          width: small + (full - small) * grow,
          minHeight: 175 * u,
          background: pal.brown,
          borderRadius: 10 * u,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          transform: `scale(${pop})`,
          transformOrigin: `${small / 2}px 50%`,
          opacity: out,
          boxShadow: `0 ${6 * u}px ${20 * u}px rgba(0,0,0,0.25)`,
        }}
      >
        <div style={{width: small, flexShrink: 0, textAlign: 'center', color: pal.cream, fontFamily: 'Montserrat', fontWeight: 700}}>
          <span style={{fontSize: 112 * u}}>{item.n}</span>
          <span style={{fontSize: 44 * u}}>/{item.total}</span>
        </div>
        <div style={{flex: 1, paddingRight: 24 * u, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {item.lines.map((ln, i) => (
            <RevealLine
              key={i}
              line={ln}
              u={u}
              color={i === 0 ? pal.cream : pal.text}
              font={i === 0 ? {fontSize: 64 * u, fontWeight: 600, textTransform: 'none'} : {fontSize: 42 * u, fontWeight: 500}}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 5) Light leak: issiq to'q sariq-pushti nur kadr bo'ylab o'tadi.
export const Leak: React.FC<P<Extract<Item, {type: 'leak'}>>> = ({item}) => {
  const {now} = useTime();
  const p = interpolate(now, [item.start, item.start + item.dur], [0, 1], clamp);
  const a = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: a,
        background: `radial-gradient(ellipse at ${20 + 60 * p}% ${85 - 30 * p}%, rgba(255,190,90,0.95) 0%, rgba(255,120,60,0.55) 28%, rgba(230,90,160,0.35) 50%, rgba(0,0,0,0) 72%)`,
      }}
    />
  );
};

// 6) Oq flash -> qisqa to'q sariq kadr (referensdagi "vspyshka" o'tishi).
export const Flash: React.FC<P<Extract<Item, {type: 'flash'}>>> = ({item}) => {
  const {now} = useTime();
  const p = (now - item.start) / item.dur;
  const white = interpolate(p, [0, 0.2, 0.45], [0, 1, 1], clamp);
  const orange = interpolate(p, [0.45, 0.55, 0.8, 1], [0, 1, 1, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{background: '#FFFDF8', opacity: p < 0.5 ? white : 1 - orange}} />
      <AbsoluteFill style={{background: '#D9620B', opacity: orange}} />
    </>
  );
};

// 7) Obuna kartasi: profil rasmi sakrab chiqadi, "Obuna bo'ling" tugmasi bosiladi -> "Obunadasiz".
export const Follow: React.FC<P<Extract<Item, {type: 'follow'}>>> = ({item, u, pal, h}) => {
  const {now, fps} = useTime();
  const t = now - item.start;
  const dur = item.end - item.start;
  const pop = spring({frame: t * fps, fps, config: {damping: 12, mass: 0.6}});
  const btn = spring({frame: (t - 0.35) * fps, fps, config: {damping: 14}});
  const tapAt = Math.min(1.6, dur * 0.45);
  const press = interpolate(t, [tapAt - 0.12, tapAt, tapAt + 0.15], [1, 0.9, 1], clamp);
  const done = t >= tapAt;
  const out = interpolate(now, [item.end - 0.25, item.end], [1, 0], clamp);
  const ring = 340 * u;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: h * 0.56, opacity: out}}>
      <div
        style={{
          width: ring,
          height: ring,
          borderRadius: '50%',
          padding: 8 * u,
          background: `conic-gradient(${pal.cream}, ${pal.brown}, ${pal.cream})`,
          transform: `scale(${pop})`,
          boxShadow: `0 ${10 * u}px ${40 * u}px rgba(0,0,0,0.45)`,
        }}
      >
        <Img
          src={staticFile(item.image)}
          style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `${6 * u}px solid ${pal.brown}`}}
        />
      </div>
      <div
        style={{
          marginTop: 34 * u,
          transform: `scale(${btn * press})`,
          opacity: btn,
          background: done ? pal.cream : pal.brown,
          color: done ? pal.brown : pal.cream,
          fontFamily: 'Montserrat',
          fontWeight: 700,
          fontSize: 46 * u,
          padding: `${18 * u}px ${54 * u}px`,
          borderRadius: 999,
          boxShadow: `0 ${8 * u}px ${28 * u}px rgba(0,0,0,0.4)`,
          border: `${3 * u}px solid ${pal.cream}`,
        }}
      >
        {done ? item.done ?? '✓ Obunadasiz' : item.label ?? "Obuna bo'ling"}
      </div>
    </AbsoluteFill>
  );
};

export type {Line};
export {RevealWord, lineFont};
