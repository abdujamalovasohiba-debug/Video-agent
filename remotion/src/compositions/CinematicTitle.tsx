import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {MotionProps, unit} from '../theme';

// Kinematik sarlavha: ingichka serif matn, keng harf oralig'i,
// xiralikdan tiniqlashib chiqadi, ostida nozik chiziq cho'ziladi.
export const CinematicTitle: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const vertical = p.height > p.width;
  const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
  const inT = interpolate(frame, [0, fps * 1.2], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const outT = interpolate(frame, [durationInFrames - fps * 0.9, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const line = interpolate(frame, [fps * 0.5, fps * 1.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const opacity = inT * (1 - outT);
  const spacing = interpolate(inT, [0, 1], [26, 14]) * u;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        fontFamily: p.titleFont || p.fontFamily,
        paddingBottom: vertical ? p.height * 0.2 : p.height * 0.12,
      }}
    >
      {/* Matn o'qilishi uchun pastdan yumshoq qorong'ilik */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 50%)',
          opacity,
        }}
      />
      <div
        style={{
          color: '#F5EEDF',
          fontSize: (vertical ? 92 : 80) * u,
          fontWeight: 400,
          letterSpacing: spacing,
          textTransform: 'uppercase',
          textAlign: 'center',
          maxWidth: p.width * 0.86,
          lineHeight: 1.3,
          opacity,
          filter: `blur(${(1 - inT) * 10 * u + outT * 6 * u}px)`,
          transform: `translateY(${(1 - inT) * 14 * u}px)`,
          textShadow: `0 ${2 * u}px ${18 * u}px rgba(0,0,0,0.45)`,
        }}
      >
        {p.title}
      </div>
      <div
        style={{
          marginTop: 28 * u,
          height: Math.max(1, 2 * u),
          width: 180 * u * line,
          background: p.accent,
          opacity: 0.85 * (1 - outT),
        }}
      />
      {p.subtitle ? (
        <div
          style={{
            marginTop: 22 * u,
            color: p.accent,
            fontSize: 34 * u,
            letterSpacing: 10 * u,
            textTransform: 'uppercase',
            fontStyle: 'italic',
            opacity: line * (1 - outT),
          }}
        >
          {p.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
