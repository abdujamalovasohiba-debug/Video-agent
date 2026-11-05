import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GOLD, Item, Word} from './types';
import {RevealWord} from './Reveal';

// Referens: "doktor" uslubi - chat-pufak hook, oq KATTA + oltin qo'lyozma matn, oltin kalit iboralar.
type P<T> = {item: T; u: number; w: number; h: number; top?: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const shadow = (u: number) => `0 ${2 * u}px ${10 * u}px rgba(0,0,0,0.55), 0 0 ${18 * u}px rgba(0,0,0,0.35)`;

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

const fadeOut = (now: number, end: number) => interpolate(now, [end - 0.15, end], [1, 0], clamp);

// Chat-pufak: krem gradient, oltin hoshiya, kichikdan sakrab chiqadi.
export const Bubble: React.FC<P<Extract<Item, {type: 'bubble'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 12, mass: 0.6}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.56), opacity: fadeOut(now, item.end)}}>
      <div
        style={{
          transform: `scale(${0.3 + 0.7 * s})`,
          opacity: Math.min(1, s * 1.6),
          maxWidth: w * 0.8,
          padding: `${22 * u}px ${44 * u}px`,
          borderRadius: 999,
          background: 'linear-gradient(180deg, #FFF6EA 0%, #F1DCC3 100%)',
          border: `${4 * u}px solid #C99A5B`,
          boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`,
          color: '#2A211B',
          fontFamily: 'Montserrat',
          fontWeight: 600,
          fontSize: 50 * u,
          lineHeight: 1.18,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {item.text}
      </div>
    </AbsoluteFill>
  );
};

// Ikki qavat: tepada oq qalin KATTA harflar, ostida oltin qo'lyozma.
export const Duo: React.FC<P<Extract<Item, {type: 'duo'}>>> = ({item, u, w, h, top}) => {
  const {now} = useNow();
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? top ?? 0.5), opacity: fadeOut(now, item.end)}}>
      <div style={{maxWidth: w * 0.88, textAlign: 'center', textShadow: shadow(u)}}>
        {item.caps.length ? (
          <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 76 * u, letterSpacing: 1 * u,
                       textTransform: 'uppercase', lineHeight: 1.05}}>
            <Words words={item.caps} color="#FFFFFF" />
          </div>
        ) : null}
        {item.script.length ? (
          <div style={{fontFamily: 'Courgette', fontSize: 74 * u, lineHeight: 1.1, marginTop: 4 * u}}>
            <Words words={item.script} color={GOLD} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Oltin kalit ibora (siqiq KATTA harflar), pastroqda.
export const GoldLine: React.FC<P<Extract<Item, {type: 'gold'}>>> = ({item, u, w, h, top}) => {
  const {now} = useNow();
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? (top ?? 0.5) + 0.08), opacity: fadeOut(now, item.end)}}>
      <div style={{maxWidth: w * 0.86, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700,
                   fontSize: 64 * u, textTransform: 'uppercase', textShadow: shadow(u), lineHeight: 1.05}}>
        <Words words={item.words} color={GOLD} />
      </div>
    </AbsoluteFill>
  );
};

// Katta oltin qo'lyozma (raqam, natija), tepada.
export const Stat: React.FC<P<Extract<Item, {type: 'stat'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.1), opacity: fadeOut(now, item.end)}}>
      <div style={{transform: `scale(${0.7 + 0.3 * s})`, maxWidth: w * 0.9, textAlign: 'center',
                   fontFamily: 'Courgette', fontSize: 110 * u, textShadow: shadow(u), lineHeight: 1.1}}>
        <Words words={item.words} color={GOLD} />
      </div>
    </AbsoluteFill>
  );
};
