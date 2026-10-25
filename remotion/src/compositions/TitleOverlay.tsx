import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';

// Shaffof fonli sarlavha: video ustida yuqorida paydo bo'ladi va yo'qoladi.
export const TitleOverlay: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const vertical = p.height > p.width;
  const inS = spring({frame, fps, config: {damping: 16}});
  const outS = spring({frame: frame - (durationInFrames - 15), fps, config: {damping: 200}});
  const v = inS - outS;
  const wipe = interpolate(v, [0, 1], [0, 100]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: vertical ? p.height * 0.12 : p.height * 0.08,
        fontFamily: p.fontFamily,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - v) * -60 * u}px) rotate(${(1 - v) * -3}deg)`,
          opacity: Math.min(1, v * 1.5),
          clipPath: `inset(0 ${100 - wipe}% 0 0)`,
          background: p.accent,
          color: '#000',
          padding: `${18 * u}px ${44 * u}px`,
          borderRadius: 18 * u,
          fontSize: (vertical ? 70 : 64) * u,
          fontWeight: 900,
          textTransform: 'uppercase',
          maxWidth: p.width * 0.88,
          textAlign: 'center',
          lineHeight: 1.1,
          boxShadow: `0 ${12 * u}px ${40 * u}px rgba(0,0,0,0.35)`,
        }}
      >
        {p.title}
      </div>
    </AbsoluteFill>
  );
};
