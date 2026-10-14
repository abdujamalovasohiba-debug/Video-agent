// Montaj rejasi (Python agent yaratadi, plan.json orqali tahrirlash mumkin).
export type Word = {w: string; t: number}; // t - so'z paydo bo'ladigan vaqt (s)
export type Line = {style: 'caps' | 'sans' | 'small'; align?: 'left' | 'center' | 'right'; words: Word[]};

export type Item =
  | {type: 'hook'; start: number; end: number; small: string; big: string; top?: number}
  | {type: 'card'; start: number; end: number; lines: Line[]}
  | {type: 'caption'; start: number; end: number; top?: number; lines: Line[]}
  | {type: 'number'; start: number; end: number; n: number; total: number; lines: Line[]; top?: number}
  | {type: 'leak'; start: number; dur: number}
  | {type: 'flash'; start: number; dur: number}
  | {type: 'bubble'; start: number; end: number; text: string; top?: number}
  | {type: 'duo'; start: number; end: number; top?: number; caps: Word[]; script: Word[]}
  | {type: 'gold'; start: number; end: number; top?: number; words: Word[]}
  | {type: 'stat'; start: number; end: number; top?: number; words: Word[]}
  | {type: 'headline'; start: number; end: number; top?: number; lines: string[]; big: string; bigAt?: number; framed?: boolean; emojis?: string[]; bg?: string; size?: number}
  | {type: 'plain'; start: number; end: number; top?: number; glow?: boolean; color?: string; caps: Word[]; script: Word[]}
  | {type: 'point'; start: number; end: number; top?: number; label?: string; color?: string; n: number; total: number; caps: Word[]; script: Word[]}
  | {type: 'tri'; start: number; end: number; top?: number; size?: number; pre?: Word[]; pill?: string; big: Word[]; post?: Word[]; wave?: boolean; tag?: string}
  | {type: 'keys'; start: number; end: number; top?: number; pre?: Word[]; keys: {c: string; t: number}[]; post?: Word[]; tag?: string}
  | {type: 'stamps'; start: number; end: number; top?: number; pre?: Word[]; cards: {icon: string; label: string; t: number}[]; tag?: string}
  | {type: 'white'; start: number; end: number; pre?: string; quote?: string; size?: number; post?: string;
     app?: {icon?: string; image?: string; label: string; pill?: string; total?: number}}
  | {type: 'glow'; start: number; dur: number}
  | {type: 'panel'; start: number; end: number; height?: number; label?: string; icon?: string; word: string; size?: number; pill?: string; tone?: 'good' | 'bad'}
  | {type: 'diag'; start: number; end: number; top?: number; n?: number; total?: number; label?: string; icon?: string; word: string; size?: number; pill?: string; tone?: 'good' | 'bad'}
  | {type: 'karaoke'; start: number; end: number; top?: number; words: Word[]}
  | {type: 'follow'; start: number; end: number; image: string; label?: string; done?: string};

export type Palette = {brown: string; cream: string; hookBg: string; keyword: string; text: string};

export const PALETTE: Palette = {
  brown: '#683B18',
  cream: '#F6EDB4',
  hookBg: '#FAF7BE',
  keyword: '#F3E7A6',
  text: '#F8F6ED',
};

export const GOLD = '#F2C443';
