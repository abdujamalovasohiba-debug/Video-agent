import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFonts} from '../fonts';
import {unit} from '../theme';
import {Card, Caption, Flash, Follow, Hook, Leak, NumberBox} from './Elements';
import {Bubble, Duo, GoldLine, Stat} from './Gold';
import {Headline, Plain, Point} from './Podcast';
import {Glow, Karaoke, Keys, Panel, Stamps, Tri, White} from './Explainer';
import {Item, PALETTE, Palette} from './types';

loadFonts();

export type ExpertProps = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  items: Item[];
  palette?: Partial<Palette>;
  captionTop?: number; // so'zma-so'z matn balandligi (yuzdan pastda bo'lishi uchun)
};

const ORDER = {card: 0, caption: 1, number: 1, duo: 1, gold: 1, stat: 1, plain: 1, point: 1, hook: 2, headline: 2, tri: 2, keys: 2, stamps: 2, white: 3, glow: 5, panel: 1, karaoke: 2, bubble: 2, follow: 2, leak: 3, flash: 4} as const;

// Butun video uchun bitta shaffof overlay: rejadagi har bir element o'z vaqtida chiqadi.
// Elementlar absolyut vaqt (soniya) bilan ishlaydi, shuning uchun Sequence ishlatilmaydi.
export const ExpertOverlay: React.FC<ExpertProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  const u = unit(p);
  const pal = {...PALETTE, ...(p.palette ?? {})};
  const active = p.items
    .filter((it) => {
      const end = 'end' in it ? it.end : it.start + it.dur;
      return now >= it.start - 1e-6 && now < end;
    })
    .sort((a, b) => ORDER[a.type] - ORDER[b.type]);
  const common = {u, pal, w: p.width, h: p.height, top: p.captionTop};
  return (
    <AbsoluteFill>
      {active.map((it, i) => (
        <AbsoluteFill key={`${it.type}-${it.start}-${i}`}>
          {it.type === 'hook' && <Hook item={it} {...common} />}
          {it.type === 'card' && <Card item={it} {...common} />}
          {it.type === 'caption' && <Caption item={it} {...common} />}
          {it.type === 'number' && <NumberBox item={it} {...common} />}
          {it.type === 'leak' && <Leak item={it} {...common} />}
          {it.type === 'flash' && <Flash item={it} {...common} />}
          {it.type === 'follow' && <Follow item={it} {...common} />}
          {it.type === 'bubble' && <Bubble item={it} {...common} />}
          {it.type === 'duo' && <Duo item={it} {...common} />}
          {it.type === 'gold' && <GoldLine item={it} {...common} />}
          {it.type === 'stat' && <Stat item={it} {...common} />}
          {it.type === 'headline' && <Headline item={it} {...common} />}
          {it.type === 'tri' && <Tri item={it} {...common} />}
          {it.type === 'keys' && <Keys item={it} {...common} />}
          {it.type === 'stamps' && <Stamps item={it} {...common} />}
          {it.type === 'white' && <White item={it} {...common} />}
          {it.type === 'glow' && <Glow item={it} {...common} />}
          {it.type === 'panel' && <Panel item={it} {...common} />}
          {it.type === 'karaoke' && <Karaoke item={it} {...common} />}
          {it.type === 'plain' && <Plain item={it} {...common} />}
          {it.type === 'point' && <Point item={it} {...common} />}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
