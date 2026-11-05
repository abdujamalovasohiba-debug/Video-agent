import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';
import {InstagramIcon} from './InstagramIcon';

// Yakuniy karta: qora fon, markazda Instagram belgisi (oqdan rangliga o'tadi) va @username.
export const EndCard: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const pop = spring({frame: frame - fps * 0.3, fps, config: {damping: 14, mass: 0.7}});
  const color = interpolate(frame, [fps * 1.0, fps * 1.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const handleIn = interpolate(frame, [fps * 0.9, fps * 1.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = interpolate(frame, [durationInFrames - fps * 0.4, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: out, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `scale(${0.7 + 0.3 * pop})`, opacity: Math.min(1, pop * 1.5)}}>
          <InstagramIcon size={150 * u} progress={color} stroke={2.2} />
        </div>
        {p.handle ? (
          <div
            style={{
              marginTop: 34 * u,
              color: '#fff',
              fontFamily: '"DejaVu Sans Condensed", "DejaVu Sans", Arial, sans-serif',
              fontWeight: 700,
              fontSize: 34 * u,
              letterSpacing: 1 * u,
              textTransform: 'uppercase',
              opacity: handleIn,
              transform: `translateY(${(1 - handleIn) * 12 * u}px)`,
            }}
          >
            {p.handle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
