import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';

// Outro: chaqiruv (CTA) tugmasi pulsatsiya bilan, kanal nomi.
export const Outro: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const enter = spring({frame, fps, config: {damping: 14}});
  const pulse = 1 + 0.05 * Math.sin((frame / fps) * Math.PI * 2.5) * enter;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const nameIn = spring({frame: frame - 12, fps, config: {damping: 200}});

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${p.primary} 0%, #000 75%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: p.fontFamily,
        opacity: fadeIn * fadeOut,
      }}
    >
      <div
        style={{
          transform: `scale(${enter * pulse})`,
          background: p.accent,
          color: '#000',
          fontSize: 90 * u,
          fontWeight: 900,
          padding: `${28 * u}px ${70 * u}px`,
          borderRadius: 999,
          textTransform: 'uppercase',
          boxShadow: `0 ${20 * u}px ${80 * u}px ${p.accent}66`,
          textAlign: 'center',
          maxWidth: p.width * 0.85,
        }}
      >
        {p.cta}
      </div>
      {p.name ? (
        <div
          style={{
            marginTop: 50 * u,
            color: p.textColor,
            fontSize: 54 * u,
            fontWeight: 700,
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 40 * u}px)`,
          }}
        >
          {p.name}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
