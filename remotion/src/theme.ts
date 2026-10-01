import {z} from 'zod';

// Barcha kompozitsiyalar uchun umumiy props sxemasi.
// Python agent shu maydonlarni JSON qilib --props orqali yuboradi.
export const baseSchema = z.object({
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  durationInFrames: z.number(),
  primary: z.string(),
  accent: z.string(),
  textColor: z.string(),
  fontFamily: z.string(),
});

export const motionSchema = baseSchema.extend({
  title: z.string(),
  subtitle: z.string(),
  name: z.string(),
  role: z.string(),
  cta: z.string(),
  titleFont: z.string().optional(),
});

export type MotionProps = z.infer<typeof motionSchema>;

export const defaultProps: MotionProps = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 90,
  primary: '#111827',
  accent: '#FACC15',
  textColor: '#FFFFFF',
  fontFamily: 'Montserrat, "DejaVu Sans", Arial, sans-serif',
  title: "Sun'iy intellekt bilan montaj",
  subtitle: 'Video agent',
  name: 'Ism Familiya',
  role: 'Bloger',
  cta: "Obuna bo'ling!",
};

// Har xil o'lchamlarda (16:9 va 9:16) bir xil ko'rinishi uchun masshtab.
export const unit = (p: {width: number; height: number}) =>
  Math.min(p.width, p.height) / 1080;
