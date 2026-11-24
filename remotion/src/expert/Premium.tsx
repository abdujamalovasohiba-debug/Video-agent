import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Word} from './types';

// "Premium tibbiy" uslub: to'q binafsha + krem palitra, Playfair serif sarlavhalar, Montserrat matn,
// shishasimon (frosted) kartalar, yumshoq harakatlar. Klinika/shifokor videolari uchun.
type P<T> = {item: T; u: number; w: number; h: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PLUM = '#3B1E54';
const LILAC = '#C9B6E4';
const CREAM = '#FBF6EE';
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const inOut = (now: number, s: number, e: number, d = 0.35) =>
  Math.min(interpolate(now, [s, s + d], [0, 1], {...clamp, easing: ease}), interpolate(now, [e - 0.25, e], [1, 0], clamp));
const glass = (u: number): React.CSSProperties => ({
  background: 'rgba(251,246,238,0.90)', borderRadius: 28 * u, border: `${2 * u}px solid rgba(255,255,255,0.7)`,
  boxShadow: `0 ${18 * u}px ${48 * u}px rgba(30,10,45,0.35)`, backdropFilter: 'blur(14px)',
});

// Hook sarlavha: kichik binafsha yorliq + serif KATTA qatorlar (so'zma-so'z ko'tariladi).
export const PTitle: React.FC<P<Extract<Item, {type: 'ptitle'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const o = inOut(now, item.start, item.end);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.07), left: w * 0.07, right: w * 0.07, textAlign: 'center'}}>
        {item.kicker ? (
          <div style={{display: 'inline-block', background: PLUM, color: CREAM, fontFamily: 'Montserrat', fontWeight: 700,
                       fontSize: 34 * u, letterSpacing: 4 * u, padding: `${8 * u}px ${24 * u}px`, borderRadius: 999,
                       textTransform: 'uppercase', marginBottom: 16 * u, transform: `translateY(${(1 - o) * 20 * u}px)`}}>
            {item.kicker}
          </div>
        ) : null}
        {item.lines.map((ln, i) => {
          const p = interpolate(now, [ln.t, ln.t + 0.45], [0, 1], {...clamp, easing: ease});
          return (
            <div key={i} style={{fontFamily: 'Playfair', fontWeight: 800, fontSize: (item.size ?? 96) * u, lineHeight: 1.02,
                                 color: i === item.accent ? LILAC : '#FFFFFF', opacity: p, transform: `translateY(${(1 - p) * 40 * u}px)`,
                                 textShadow: `0 ${4 * u}px ${24 * u}px rgba(20,5,30,0.65)`}}>
              {ln.w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Pastki yozuv (lower third): binafsha chiziq + ism + lavozim.
export const PLower: React.FC<P<Extract<Item, {type: 'plower'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const p = interpolate(now, [item.start, item.start + 0.6], [0, 1], {...clamp, easing: ease});
  const o = interpolate(now, [item.end - 0.3, item.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.66), left: w * 0.06, display: 'flex', alignItems: 'stretch', gap: 18 * u}}>
        <div style={{width: 8 * u, borderRadius: 4 * u, background: LILAC, transform: `scaleY(${p})`, transformOrigin: 'top'}} />
        <div style={{overflow: 'hidden'}}>
          <div style={{transform: `translateX(${(p - 1) * 110}%)`}}>
            <div style={{fontFamily: 'Playfair', fontWeight: 800, fontSize: 62 * u, color: '#FFF', lineHeight: 1.05,
                         textShadow: `0 ${3 * u}px ${14 * u}px rgba(0,0,0,0.55)`}}>{item.name}</div>
            <div style={{fontFamily: 'Montserrat', fontWeight: 600, fontSize: 32 * u, color: LILAC, letterSpacing: 3 * u,
                         textTransform: 'uppercase', marginTop: 4 * u, textShadow: `0 ${2 * u}px ${10 * u}px rgba(0,0,0,0.6)`}}>{item.role}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Qadam kartasi: shishasimon karta, chapda raqam doirasi, sarlavha + izoh, pastda n/jami nuqtalar.
export const PStep: React.FC<P<Extract<Item, {type: 'pstep'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 15, mass: 0.7}});
  const o = interpolate(now, [item.end - 0.25, item.end], [1, 0], clamp);
  const sub = interpolate(now, [item.subAt ?? item.start + 0.4, (item.subAt ?? item.start + 0.4) + 0.35], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.66), left: w * 0.06, right: w * 0.06, ...glass(u),
                   padding: `${26 * u}px ${30 * u}px`, display: 'flex', alignItems: 'center', gap: 26 * u,
                   transform: `translateY(${(1 - s) * 80 * u}px) scale(${0.94 + 0.06 * s})`, opacity: Math.min(1, s * 1.4)}}>
        <div style={{width: 118 * u, height: 118 * u, borderRadius: '50%', background: PLUM, color: CREAM, flexShrink: 0,
                     display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair', fontWeight: 800, fontSize: 58 * u}}>
          {item.icon ?? String(item.n).padStart(2, '0')}
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 26 * u, letterSpacing: 4 * u, color: '#8A6BB0',
                       textTransform: 'uppercase'}}>{item.label ?? `${item.n}-qadam`}</div>
          <div style={{fontFamily: 'Playfair', fontWeight: 800, fontSize: (item.size ?? 60) * u, color: PLUM, lineHeight: 1.05}}>{item.title}</div>
          {item.sub ? (
            <div style={{fontFamily: 'Montserrat', fontWeight: 500, fontSize: 32 * u, color: '#5A4A66', marginTop: 6 * u, opacity: sub,
                         lineHeight: 1.2}}>{item.sub}</div>
          ) : null}
        </div>
        {item.total ? (
          <div style={{position: 'absolute', right: 26 * u, top: 22 * u, display: 'flex', gap: 8 * u}}>
            {Array.from({length: item.total}).map((_, i) => (
              <div key={i} style={{width: 14 * u, height: 14 * u, borderRadius: '50%', background: i < item.n ? PLUM : 'rgba(59,30,84,0.2)'}} />
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Katta raqam kartasi: raqam 0 dan sanab chiqadi (masalan -50%), ostida izoh.
export const PCount: React.FC<P<Extract<Item, {type: 'pcount'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 14, mass: 0.7}});
  const c = interpolate(now, [item.start + 0.2, item.start + 1.2], [0, item.value], {...clamp, easing: ease});
  const o = interpolate(now, [item.end - 0.25, item.end], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.62), left: w * 0.12, right: w * 0.12, ...glass(u), textAlign: 'center',
                   padding: `${22 * u}px ${30 * u}px ${30 * u}px`, transform: `scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.4)}}>
        <div style={{fontFamily: 'Playfair', fontWeight: 900, fontSize: 170 * u, color: PLUM, lineHeight: 1}}>
          {item.prefix ?? ''}{Math.round(c)}{item.suffix ?? ''}
        </div>
        <div style={{fontFamily: 'Montserrat', fontWeight: 600, fontSize: 36 * u, color: '#5A4A66', marginTop: 6 * u, lineHeight: 1.2}}>{item.caption}</div>
      </div>
    </AbsoluteFill>
  );
};

// Subtitr: oq toza matn, aytilayotgan so'z binafsha plashkada.
export const PSub: React.FC<P<Extract<Item, {type: 'psub'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const o = Math.min(interpolate(now, [item.start, item.start + 0.12], [0, 1], clamp), interpolate(now, [item.end - 0.1, item.end], [1, 0], clamp));
  const cur = item.words.reduce((k, wd, i) => (now >= wd.t ? i : k), -1);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', top: h * (item.top ?? 0.86), left: w * 0.06, right: w * 0.06, textAlign: 'center',
                   fontFamily: 'Montserrat', fontWeight: 700, fontSize: 52 * u, lineHeight: 1.35}}>
        {item.words.map((wd: Word, i: number) => (
          <span key={i} style={{display: 'inline-block', margin: `0 ${5 * u}px`, padding: `0 ${10 * u}px`, borderRadius: 10 * u,
                                color: '#FFFFFF', background: i === cur ? PLUM : 'transparent',
                                textShadow: i === cur ? 'none' : `0 ${2 * u}px ${8 * u}px rgba(0,0,0,0.75)`}}>{wd.w}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
