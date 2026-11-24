// Bir nechta kompozitsiyani bitta jarayonda render qiladi:
// loyiha bir marta bundle qilinadi va brauzer qayta ishlatiladi.
//
// Ishlatish: node render.mjs jobs.json
// jobs.json: [{"composition": "Intro", "props": {...}, "output": "/abs/out.mp4", "alpha": false}, ...]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const concurrency = Number(process.env.REMOTION_CONCURRENCY || 0) || null;

const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable});
const results = [];
try {
  for (const job of jobs) {
    const t0 = Date.now();
    const composition = await selectComposition({
      serveUrl, id: job.composition, inputProps: job.props, puppeteerInstance: browser, browserExecutable,
    });
    const alpha = Boolean(job.alpha);
    await renderMedia({
      serveUrl,
      composition,
      inputProps: job.props,
      outputLocation: job.output,
      puppeteerInstance: browser,
      browserExecutable,
      concurrency,
      overwrite: true,
      imageFormat: alpha ? 'png' : 'jpeg',
      jpegQuality: 95,
      codec: alpha ? 'prores' : 'h264',
      ...(alpha ? {proResProfile: '4444', pixelFormat: 'yuva444p10le'} : {crf: 14, pixelFormat: 'yuv420p'}),
    });
    results.push({output: job.output, seconds: (Date.now() - t0) / 1000});
    console.log(JSON.stringify({done: job.output, seconds: (Date.now() - t0) / 1000}));
  }
} finally {
  await browser.close({silent: true});
}
