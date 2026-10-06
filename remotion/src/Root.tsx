import {CalculateMetadataFunction, Composition} from 'remotion';
import {Intro} from './compositions/Intro';
import {Outro} from './compositions/Outro';
import {TitleOverlay} from './compositions/TitleOverlay';
import {LowerThird} from './compositions/LowerThird';
import {CinematicTitle} from './compositions/CinematicTitle';
import {AestheticText} from './compositions/AestheticText';
import {EndCard} from './compositions/EndCard';
import {ExpertOverlay, ExpertProps} from './expert/ExpertOverlay';
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
  {id: 'CinematicTitle', component: CinematicTitle},
  {id: 'AestheticText', component: AestheticText},
  {id: 'EndCard', component: EndCard},
] as const;

const calcExpert: CalculateMetadataFunction<ExpertProps> = ({props}) => ({
  width: props.width,
  height: props.height,
  fps: props.fps,
  durationInFrames: Math.max(1, Math.round(props.durationInFrames)),
});

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ExpertOverlay"
      component={ExpertOverlay}
      defaultProps={{width: 1080, height: 1920, fps: 30, durationInFrames: 150, items: []} as ExpertProps}
      calculateMetadata={calcExpert}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
    />
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
