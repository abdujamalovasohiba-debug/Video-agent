// Instagram belgisi (SVG). progress: 0 - oq, 1 - rangli gradient.
export const InstagramIcon: React.FC<{size: number; progress?: number; stroke?: number}> = ({
  size,
  progress = 0,
  stroke = 2,
}) => {
  const id = 'igGrad';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="30%" stopColor="#FA7E1E" />
          <stop offset="55%" stopColor="#D62976" />
          <stop offset="80%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      {[0, 1].map((layer) => (
        <g
          key={layer}
          fill="none"
          stroke={layer === 0 ? '#FFFFFF' : `url(#${id})`}
          strokeWidth={stroke}
          opacity={layer === 0 ? 1 - progress : progress}
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
          <circle cx="12" cy="12" r="4.3" />
          <circle cx="17.4" cy="6.6" r="0.6" fill={layer === 0 ? '#FFFFFF' : '#D62976'} stroke="none" />
        </g>
      ))}
    </svg>
  );
};
