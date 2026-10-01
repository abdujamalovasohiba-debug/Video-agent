import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {MotionProps, unit} from '../theme';
import {InstagramIcon} from './InstagramIcon';

// Estetik Instagram uslubi: markazdan yuqoriroqda kichik nafis matn + emojilar,
// o'ngda Instagram belgisi va @username. Butun video davomida turadi.
export const AestheticText: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const u = unit(p);
  const vertical = p.height > p.width;
  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - fps * 0.6, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = fadeIn * fadeOut;
  const shadow = `0 ${1 * u}px ${6 * u}px rgba(0,0,0,0.55)`;
  const textTop = p.height * (p.textY ?? (vertical ? 0.36 : 0.3));

  return (
    <AbsoluteFill style={{opacity}}>
      {p.handle ? (
        <div
          style={{
            position: 'absolute',
            right: (vertical ? 44 : 70) * u,
            top: vertical ? p.height * 0.255 : p.height * 0.12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10 * u,
            filter: `drop-shadow(${shadow})`,
          }}
        >
          <InstagramIcon size={54 * u} stroke={2.1} />
          <div
            style={{
              color: '#fff',
              fontFamily: '"DejaVu Sans Condensed", "DejaVu Sans", Arial, sans-serif',
              fontWeight: 700,
              fontSize: 25 * u,
              letterSpacing: 0.5 * u,
              textTransform: 'uppercase',
            }}
          >
            {p.handle}
          </div>
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: textTop,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: `0 ${p.width * 0.12}px`,
        }}
      >
        <div
          style={{
            color: '#F7F3EC',
            fontFamily: p.titleFont || '"Liberation Serif", Georgia, serif',
            fontSize: (vertical ? 44 : 40) * u,
            lineHeight: 1.25,
            whiteSpace: 'pre-line',
            textShadow: shadow,
          }}
        >
          {p.title}
        </div>
        {p.subtitle ? (
          <div
            style={{
              marginTop: 8 * u,
              fontSize: 36 * u,
              fontFamily: '"Noto Color Emoji", sans-serif',
              letterSpacing: 4 * u,
              filter: `drop-shadow(${shadow})`,
            }}
          >
            {p.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
