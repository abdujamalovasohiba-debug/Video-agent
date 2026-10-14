// Tez ko'rib chiqish: kompozitsiyadan bir nechta kadrni PNG qilib chiqaradi.
// Ishlatish: node still.mjs <Kompozitsiya> props.json out_prefix kadr1,kadr2,...
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const [comp, propsFile, prefix, frames] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync(propsFile, 'utf8'));
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: comp, inputProps, puppeteerInstance: browser});
for (const f of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, inputProps, frame: f, output: `${prefix}_${f}.png`, puppeteerInstance: browser, imageFormat: 'png'});
}
await browser.close({silent: true});
