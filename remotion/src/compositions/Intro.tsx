import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';

// Intro: gradient fon, so'zma-so'z sakrab chiquvchi sarlavha, urg'u chizig'i.
export const Intro: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const words = p.title.split(/\s+/).filter(Boolean);
  const vertical = p.height > p.width;

  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bar = spring({frame: frame - 6 - words.length * 3, fps, config: {damping: 200}});
  const bgShift = interpolate(frame, [0, durationInFrames], [0, 40]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + bgShift}deg, ${p.primary} 0%, #000 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: p.fontFamily,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 900 * u,
          height: 900 * u,
          borderRadius: '50%',
          background: p.accent,
          opacity: 0.12,
          filter: `blur(${120 * u}px)`,
          transform: `scale(${spring({frame, fps, config: {damping: 30}})})`,
        }}
      />
      <div
        style={{
          opacity: exit,
          transform: `scale(${interpolate(exit, [0, 1], [1.08, 1])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: `0 ${80 * u}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: `${8 * u}px ${24 * u}px`,
            maxWidth: vertical ? p.width * 0.86 : p.width * 0.8,
          }}
        >
          {words.map((w, i) => {
            const s = spring({frame: frame - 4 - i * 3, fps, config: {damping: 12, mass: 0.6}});
            return (
              <span
                key={i}
                style={{
                  color: p.textColor,
                  fontSize: (vertical ? 120 : 110) * u,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: -2 * u,
                  display: 'inline-block',
                  opacity: s,
                  transform: `translateY(${(1 - s) * 80 * u}px) scale(${0.6 + 0.4 * s})`,
                  textShadow: `0 ${6 * u}px ${30 * u}px rgba(0,0,0,0.5)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 36 * u,
            height: 12 * u,
            width: 360 * u * bar,
            background: p.accent,
            borderRadius: 6 * u,
          }}
        />
        {p.subtitle ? (
          <div
            style={{
              marginTop: 30 * u,
              color: p.accent,
              fontSize: 44 * u,
              fontWeight: 700,
              letterSpacing: 6 * u,
              textTransform: 'uppercase',
              opacity: bar,
            }}
          >
            {p.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
