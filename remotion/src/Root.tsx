import {CalculateMetadataFunction, Composition} from 'remotion';
import {Intro} from './compositions/Intro';
import {Outro} from './compositions/Outro';
import {TitleOverlay} from './compositions/TitleOverlay';
import {LowerThird} from './compositions/LowerThird';
import {defaultProps, motionSchema, MotionProps} from './theme';

// O'lcham va davomiylik props'dan olinadi, shuning uchun bitta kompozitsiya
// 16:9 va 9:16 formatlar uchun ham ishlaydi.
const calc: CalculateMetadataFunction<MotionProps> = ({props}) => ({
  width: props.width,
  height: props.height,
  fps: props.fps,
  durationInFrames: Math.max(1, Math.round(props.durationInFrames)),
});

const comps = [
  {id: 'Intro', component: Intro},
  {id: 'Outro', component: Outro},
  {id: 'TitleOverlay', component: TitleOverlay},
  {id: 'LowerThird', component: LowerThird},
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {comps.map(({id, component}) => (
      <Composition
        key={id}
        id={id}
        component={component}
        schema={motionSchema}
        defaultProps={defaultProps}
        calculateMetadata={calc}
        width={defaultProps.width}
        height={defaultProps.height}
        fps={defaultProps.fps}
        durationInFrames={defaultProps.durationInFrames}
      />
    ))}
  </>
);
