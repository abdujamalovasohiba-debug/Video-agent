import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Line} from './types';

// So'z ichidagi harflar chapdan o'ngga xiralikdan tiniqlashib chiqadi
// (After Effects "Fade Up Characters" effektiga o'xshash).
export const RevealWord: React.FC<{text: string; t: number; color: string}> = ({text, t, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  const chars = Array.from(text);
  return (
    <span style={{display: 'inline-block', whiteSpace: 'pre', color}}>
      {chars.map((c, i) => {
        const start = t + i * 0.022;
        const p = interpolate(now, [start, start + 0.16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              filter: `blur(${(1 - p) * 6}px)`,
              transform: `translateY(${(1 - p) * 0.12}em)`,
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
};

export const lineFont = (style: Line['style'], u: number) => {
  if (style === 'caps') {
    return {fontFamily: 'Montserrat', fontWeight: 600, fontSize: 80 * u, letterSpacing: -0.5 * u, textTransform: 'uppercase' as const};
  }
  if (style === 'small') return {fontFamily: 'Montserrat', fontWeight: 500, fontSize: 48 * u};
  return {fontFamily: 'Montserrat', fontWeight: 600, fontSize: 70 * u};
};

export const RevealLine: React.FC<{line: Line; u: number; color: string; font?: React.CSSProperties}> = ({
  line,
  u,
  color,
  font,
}) => (
  <div
    style={{
      ...lineFont(line.style, u),
      ...font,
      lineHeight: 1.08,
      textAlign: line.align ?? 'center',
      // Och fonda ham o'qilishi uchun yumshoq qorong'i halo + aniq soya
      textShadow: `0 0 ${16 * u}px rgba(0,0,0,0.55), 0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.5)`,
    }}
  >
    {line.words.map((wd, i) => (
      <span key={i}>
        <RevealWord text={wd.w} t={wd.t} color={color} />
        {i < line.words.length - 1 ? ' ' : ''}
      </span>
    ))}
  </div>
);
