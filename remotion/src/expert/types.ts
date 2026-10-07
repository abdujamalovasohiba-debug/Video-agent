// Montaj rejasi (Python agent yaratadi, plan.json orqali tahrirlash mumkin).
export type Word = {w: string; t: number}; // t - so'z paydo bo'ladigan vaqt (s)
export type Line = {style: 'caps' | 'sans' | 'small'; align?: 'left' | 'center' | 'right'; words: Word[]};

export type Item =
  | {type: 'hook'; start: number; end: number; small: string; big: string; top?: number}
  | {type: 'card'; start: number; end: number; lines: Line[]}
  | {type: 'caption'; start: number; end: number; lines: Line[]}
  | {type: 'number'; start: number; end: number; n: number; total: number; lines: Line[]; top?: number}
  | {type: 'leak'; start: number; dur: number}
  | {type: 'flash'; start: number; dur: number}
  | {type: 'follow'; start: number; end: number; image: string; label?: string; done?: string};

export type Palette = {brown: string; cream: string; hookBg: string; keyword: string; text: string};

export const PALETTE: Palette = {
  brown: '#683B18',
  cream: '#F6EDB4',
  hookBg: '#FAF7BE',
  keyword: '#F3E7A6',
  text: '#F8F6ED',
};
