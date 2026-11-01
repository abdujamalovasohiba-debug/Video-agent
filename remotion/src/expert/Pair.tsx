import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Item, Word} from './types';

// "Juftlik psixologiyasi" referensi: jigarrang hook plashkasi, oq ekranda ulkan jigarrang raqam,
// gapiruvchi ustida sariq KATTA + oq kichik qator (aytilmagan so'z xira), B-roll ustida oq kursiv yozuv, oxirida profil kartasi.
type P<T> = {item: T; u: number; w: number; h: number};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useNow = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {now: frame / fps, fps};
};
const fadeOut = (now: number, end: number) => interpolate(now, [end - 0.15, end], [1, 0], clamp);
const BROWN = '#4A2A14';
const CREAM = '#F4E6CC';
const GOLD = '#F2C230';
const shadow = (u: number) => `0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.6), 0 0 ${16 * u}px rgba(0,0,0,0.35)`;

// So'z aytilganda yorishadi (oldin xira), yumshoq ko'tariladi.
const Lit: React.FC<{words: Word[]; color: string; dim?: number}> = ({words, color, dim = 0.35}) => {
  const {now} = useNow();
  return (
    <>
      {words.map((wd, i) => {
        const p = interpolate(now, [wd.t - 0.05, wd.t + 0.15], [0, 1], clamp);
        return (
          <span key={i} style={{color, opacity: dim + (1 - dim) * p, display: 'inline-block',
                                transform: `translateY(${(1 - p) * 4}px)`}}>
            {wd.w}{i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

// Hook: to'q jigarrang yumaloq plashka, krem siqiq KATTA qatorlar, ostida oq pill.
export const Plaque: React.FC<P<Extract<Item, {type: 'plaque'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 13, mass: 0.6}});
  const s2 = spring({frame: (now - item.start - 0.3) * fps, fps, config: {damping: 11, mass: 0.5}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.6), opacity: fadeOut(now, item.end)}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.5)}}>
        <div style={{background: 'rgba(74,42,20,0.92)', border: `${4 * u}px solid ${CREAM}`, borderRadius: 18 * u,
                     padding: `${12 * u}px ${30 * u}px`, textAlign: 'center', fontFamily: 'Oswald', fontWeight: 700,
                     color: CREAM, textTransform: 'uppercase', lineHeight: 1.08, boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`}}>
          {item.lines.map((ln, i) => (
            <div key={i} style={{fontSize: (i === 0 ? item.size ?? 78 : (item.size ?? 78) * 0.62) * u}}>{ln}</div>
          ))}
        </div>
        {item.pill ? (
          <div style={{marginTop: -12 * u, background: '#FFF', color: BROWN, border: `${3 * u}px solid ${BROWN}`, borderRadius: 10 * u,
                       fontFamily: 'Oswald', fontWeight: 700, fontSize: 52 * u, padding: `${0}px ${60 * u}px`, textTransform: 'uppercase',
                       transform: `scale(${0.5 + 0.5 * s2})`, opacity: Math.min(1, s2 * 1.5)}}>
            {item.pill}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Oq ekran: chapda ulkan jigarrang raqam (xiralikdan tiniqlashadi), o'ngda KATTA sarlavha + ostida kichik qatorlar.
export const NumScreen: React.FC<P<Extract<Item, {type: 'numscreen'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const inP = interpolate(now, [item.start, item.start + 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const bg = interpolate(now, [item.start, item.start + 0.2, item.end - 0.2, item.end], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: `rgba(250,250,248,${bg})`}}>
      <div style={{position: 'absolute', top: h * 0.5, left: w * 0.06, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center',
                   gap: 22 * u, opacity: bg}}>
        <div style={{fontFamily: 'Anton', fontSize: 420 * u, lineHeight: 1, color: BROWN, filter: `blur(${(1 - inP) * 24}px)`,
                     transform: `scale(${1.25 - 0.25 * inP})`}}>
          {item.n}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', maxWidth: w * 0.52}}>
          <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 64 * u, lineHeight: 1.05, textTransform: 'uppercase'}}>
            <Lit words={item.title} color={BROWN} dim={0} />
          </div>
          {item.lines.map((ln, i) => (
            <div key={i} style={{fontFamily: 'Montserrat', fontWeight: 500, fontSize: Math.max(26, 44 - i * 7) * u, lineHeight: 1.15,
                                 marginTop: 4 * u}}>
              <Lit words={ln} color={BROWN} dim={0} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Gapiruvchi ustida: sariq KATTA qator + oq kichik qator; B-roll ustida (broll: true) — oq kursiv KATTA.
export const Duet: React.FC<P<Extract<Item, {type: 'duet'}>>> = ({item, u, w, h}) => {
  const {now} = useNow();
  const b = !!item.broll;
  return (
    <AbsoluteFill style={{opacity: fadeOut(now, item.end)}}>
      <div style={{position: 'absolute', top: h * (item.top ?? (b ? 0.5 : 0.6)), left: w * 0.06, right: w * 0.06, textAlign: 'center',
                   textShadow: shadow(u)}}>
        <div style={{fontFamily: 'Montserrat', fontWeight: b ? 700 : 800, fontStyle: b ? 'italic' : 'normal', fontSize: (item.size ?? (b ? 60 : 64)) * u,
                     lineHeight: 1.08, textTransform: 'uppercase'}}>
          <Lit words={item.caps} color={b ? '#FFFFFF' : GOLD} />
        </div>
        {item.small?.length ? (
          <div style={{fontFamily: 'Montserrat', fontWeight: 500, fontSize: 44 * u, lineHeight: 1.15, marginTop: 4 * u}}>
            <Lit words={item.small} color="#FFFFFF" />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// Oxirida: doira avatar + oq mini profil kartasi (obunachilar soni, "Follow" tugmasi).
export const Profile: React.FC<P<Extract<Item, {type: 'profile'}>>> = ({item, u, w, h}) => {
  const {now, fps} = useNow();
  const s = spring({frame: (now - item.start) * fps, fps, config: {damping: 12, mass: 0.6}});
  const followed = now > item.start + 1.2;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: h * (item.top ?? 0.72), opacity: fadeOut(now, item.end)}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - s) * 60 * u}px)`, opacity: Math.min(1, s * 1.5)}}>
        {item.image ? (
          <Img src={staticFile(item.image)} style={{width: 120 * u, height: 120 * u, borderRadius: '50%', border: `${4 * u}px solid #FFF`,
                                                     objectFit: 'cover', marginBottom: -30 * u, zIndex: 1}} />
        ) : null}
        <div style={{background: '#FFF', borderRadius: 18 * u, padding: `${38 * u}px ${36 * u}px ${18 * u}px`, minWidth: w * 0.42,
                     fontFamily: 'Montserrat', color: '#111', textAlign: 'center', boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.35)`}}>
          <div style={{fontWeight: 700, fontSize: 30 * u}}>{item.name}</div>
          {item.stats ? (
            <div style={{display: 'flex', justifyContent: 'space-around', fontSize: 24 * u, marginTop: 8 * u, color: '#444'}}>
              {item.stats.map((st, i) => <span key={i}>{st}</span>)}
            </div>
          ) : null}
          <div style={{marginTop: 12 * u, borderRadius: 8 * u, padding: `${6 * u}px 0`, fontWeight: 700, fontSize: 26 * u,
                       background: followed ? '#EFEFEF' : '#0095F6', color: followed ? '#111' : '#FFF'}}>
            {followed ? 'Obuna bo‘ldingiz' : 'Obuna bo‘lish'}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
