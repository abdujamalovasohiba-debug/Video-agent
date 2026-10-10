import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Word} from './types';
import {RevealWord} from './Reveal';

// Referens: "podkast" uslubi - siqiq oq KATTA sarlavha, oq kursiv izoh, krem plashkada "n/jami" punktlar.
type P<T> = {item: T; u: number; w: number; h: number; top?: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const fadeOut = (now: number, end: number) => interpolate(now, [end - 0.15, end], [1, 0], clamp);
const shadow = (u: number, glow: boolean) =>
  glow
    ? `0 0 ${10 * u}px rgba(255,255,255,0.75), 0 0 ${26 * u}px rgba(255,255,255,0.45), 0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.35)`
    : `0 ${2 * u}px ${4 * u}px rgba(0,0,0,0.55), 0 0 ${16 * u}px rgba(0,0,0,0.35)`;

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

// Hook: oq siqiq qatorlar qora hoshiya bilan, ostida juda katta qator (masalan "5 XIL USUL").
export const Headline: React.FC<P<Extract<Item, {type: 'headline'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 12, mass: 0.6}});
  const s2 = spring({frame: (now - (item.bigAt ?? item.start + 0.25)) * fps, fps, config: {damping: 10, mass: 0.6}});
  const stroke = {WebkitTextStroke: `${3 * u}px #151515`, paintOrder: 'stroke fill', textShadow: `0 ${4 * u}px ${10 * u}px rgba(0,0,0,0.5)`} as const;
  if (item.framed) {
    // Referensdagidek: to'q shaffof ramka ichida krem harflar, ostida katta raqam + krem plashkadagi so'z, chetlarda emoji.
    const [num, ...rest] = item.big.split(' ');
    const cream = '#F4F0CF';
    const emo = item.emojis ?? [];
    const wob = (k: number) => Math.sin((now - item.start) * 3 + k) * 6;
    const pop0 = spring({frame: (now - item.start - 0.25) * fps, fps, config: {damping: 9, mass: 0.5}});
    const pop1 = spring({frame: (now - item.start - 0.45) * fps, fps, config: {damping: 9, mass: 0.5}});
    return (
      <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.5), opacity: fadeOut(now, item.end)}}>
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                     transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.5)}}>
          <div style={{background: item.bg ?? 'rgba(38,38,38,0.86)', borderRadius: 18 * u, padding: `${16 * u}px ${30 * u}px`,
                       maxWidth: w * 0.86, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, color: cream,
                       textTransform: 'uppercase', lineHeight: 1.12, fontSize: (item.size ?? 64) * u, letterSpacing: 1 * u,
                       boxShadow: `0 ${8 * u}px ${26 * u}px rgba(0,0,0,0.35)`}}>
            {item.lines.map((ln, i) => <div key={i}>{ln}</div>)}
          </div>
          {item.big ? (
            <div style={{display: 'flex', alignItems: 'center', marginTop: -14 * u, transform: `scale(${0.4 + 0.6 * s2})`,
                       opacity: Math.min(1, s2 * 1.5), fontFamily: 'Oswald', fontWeight: 700, textTransform: 'uppercase'}}>
            <span style={{fontSize: 170 * u, lineHeight: 1, color: cream, WebkitTextStroke: `${4 * u}px #262626`,
                          paintOrder: 'stroke fill', marginRight: -6 * u, zIndex: 1}}>{num}</span>
            <span style={{fontSize: 84 * u, lineHeight: 1.05, color: '#262626', background: cream, borderRadius: 14 * u,
                          padding: `${2 * u}px ${22 * u}px`}}>{rest.join(' ')}</span>
          </div>
          ) : null}
          {emo[0] ? <Sticker e={emo[0]} size={150 * u} style={{left: -70 * u, top: -90 * u}} rot={-12 + wob(0)} pop={pop0} u={u} /> : null}
          {emo[1] ? <Sticker e={emo[1]} size={135 * u} style={{right: -66 * u, top: '40%'}} rot={10 + wob(2)} pop={pop1} u={u} /> : null}
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.5), opacity: fadeOut(now, item.end)}}>
      <div style={{maxWidth: w * 0.9, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700, color: '#FFF',
                   textTransform: 'uppercase', lineHeight: 1.08}}>
        {item.lines.map((ln, i) => (
          <div key={i} style={{fontSize: 82 * u, transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.5), ...stroke}}>
            {ln}
          </div>
        ))}
        <div style={{fontSize: 140 * u, whiteSpace: 'nowrap', lineHeight: 1, marginTop: 6 * u, transform: `scale(${0.4 + 0.6 * s2})`,
                     opacity: Math.min(1, s2 * 1.5), ...stroke}}>
          {item.big}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Oq siqiq KATTA so'z + ostida oq kursiv izoh; B-roll ustida "glow" bilan.
export const Plain: React.FC<P<Extract<Item, {type: 'plain'}>>> = ({item, u, w, h, top}) => {
  const {now, fps} = useNow();
  const glow = !!item.glow;
  const first = item.caps[0]?.t ?? item.script[0]?.t ?? item.start;
  const pop = spring({frame: (now - first + 0.05) * fps, fps, config: {damping: 11, mass: 0.5}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? top ?? 0.5), opacity: fadeOut(now, item.end)}}>
      <div style={{maxWidth: w * 0.88, textAlign: 'center', textShadow: shadow(u, glow), transform: `scale(${0.82 + 0.18 * pop}) translateY(${(1 - pop) * 30 * u}px)`}}>
        {item.caps.length ? (
          <div style={{fontFamily: glow ? 'Montserrat' : 'Oswald', fontWeight: glow ? 600 : 700, fontSize: (glow ? 62 : 84) * u,
                       textTransform: 'uppercase', lineHeight: 1.05, letterSpacing: glow ? 1 * u : 0}}>
            <Words words={item.caps} color={item.color ?? "#FFFFFF"} />
          </div>
        ) : null}
        {item.script.length ? (
          <div style={{fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 600, fontSize: 52 * u, lineHeight: 1.15, marginTop: 2 * u}}>
            <Words words={item.script} color={item.color ?? "#FFFFFF"} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Krem plashka: avval bo'sh plashka ochiladi, so'ng matn so'zma-so'z; o'ng pastda "n/jami".
export const Point: React.FC<P<Extract<Item, {type: 'point'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const lab = spring({frame: (now - item.start) * fps, fps, config: {damping: 12, mass: 0.5}});
  const open = interpolate(now, [item.start, item.start + 0.3], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.57), opacity: fadeOut(now, item.end)}}>
      {item.label ? (
        <div style={{position: 'absolute', top: h * (item.top ?? 0.57) - 104 * u, fontFamily: 'Oswald', fontWeight: 700, fontSize: 80 * u,
                     color: item.color ?? "#FFFFFF", textTransform: 'uppercase', letterSpacing: 2 * u, textShadow: shadow(u, false),
                     transform: `translateX(${(1 - lab) * -60 * u}px) scale(${0.7 + 0.3 * lab})`, opacity: Math.min(1, lab * 1.5)}}>
          {item.label}
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          width: w * 0.8,
          minHeight: 190 * u,
          background: '#F8F6D2',
          borderRadius: 10 * u,
          boxShadow: `0 ${6 * u}px ${22 * u}px rgba(0,0,0,0.22)`,
          transform: `scaleX(${0.2 + 0.8 * open}) scaleY(${0.6 + 0.4 * open})`,
          opacity: open,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: `${18 * u}px ${30 * u}px`,
          textAlign: 'center',
          fontFamily: 'Montserrat',
          color: '#2B2620',
        }}
      >
        <div style={{fontSize: 50 * u, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 * u, lineHeight: 1.15}}>
          <Words words={item.caps} color="#2B2620" />
        </div>
        {item.script.length ? (
          <div style={{fontSize: 38 * u, fontStyle: 'italic', fontWeight: 500, marginTop: 6 * u, lineHeight: 1.2}}>
            <Words words={item.script} color="#3A332B" />
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            right: -10 * u,
            bottom: -26 * u,
            fontFamily: 'Oswald',
            fontWeight: 700,
            fontSize: 44 * u,
            color: '#1E1A16',
            WebkitTextStroke: `${2 * u}px #F8F6D2`,
            paintOrder: 'stroke fill',
          }}
        >
          {item.n}/{item.total}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3D stiker (Apple/Fluent uslubi): PNG bo'lsa rasm, aks holda emoji; sakrab chiqadi, yumshoq soya bilan.
const Sticker: React.FC<{e: string; size: number; style: React.CSSProperties; rot: number; pop: number; u: number}> = ({e, size, style, rot, pop, u}) => {
  const isImg = /\.(png|webp)$/i.test(e);
  return (
    <div style={{position: 'absolute', ...style, width: size, height: size, transform: `rotate(${rot}deg) scale(${pop})`,
                 filter: `drop-shadow(0 ${10 * u}px ${14 * u}px rgba(0,0,0,0.35))`}}>
      {isImg ? <Img src={staticFile(e)} style={{width: '100%', height: '100%'}} /> : <div style={{fontSize: size * 0.8, lineHeight: 1}}>{e}</div>}
    </div>
  );
};
