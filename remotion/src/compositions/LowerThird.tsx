import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';

// Pastki yozuv (lower third): ism va lavozim chapdan siljib kiradi.
export const LowerThird: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const vertical = p.height > p.width;
  const barIn = spring({frame, fps, config: {damping: 200}});
  const textIn = spring({frame: frame - 6, fps, config: {damping: 18}});
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shift = (1 - textIn + out) * -120 * u;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: vertical
          ? `0 ${60 * u}px ${p.height * 0.42}px`
          : `0 ${90 * u}px ${p.height * 0.25}px`,
        fontFamily: p.fontFamily,
        opacity: 1 - out,
      }}
    >
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 12 * u, background: p.accent, transform: `scaleY(${barIn})`}} />
        <div
          style={{
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.72)',
            padding: `${16 * u}px ${32 * u}px`,
            clipPath: `inset(0 ${(1 - barIn) * 100}% 0 0)`,
          }}
        >
          <div
            style={{
              color: p.textColor,
              fontSize: 56 * u,
              fontWeight: 800,
              transform: `translateX(${shift}px)`,
            }}
          >
            {p.name}
          </div>
          {p.role ? (
            <div
              style={{
                color: p.accent,
                fontSize: 36 * u,
                fontWeight: 600,
                marginTop: 4 * u,
                transform: `translateX(${shift * 1.3}px)`,
              }}
            >
              {p.role}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
