import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, mode, outDir] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', m => console.log('console:', m.text()));
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto('http://127.0.0.1:8765/index.html');
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
const times = mode === 'all' ? Array.from({ length: 65 * 30 }, (_, i) => i / 30) : mode.split(',').map(Number);
let i = 0; const t0 = Date.now();
for (const t of times) {
  await page.evaluate(t => window.renderAt(t), t);
  const name = mode === 'all' ? String(i).padStart(5, '0') : 't' + t;
  await page.screenshot({ path: `${outDir}/${name}.jpg`, type: 'jpeg', quality: 92 });
  if (++i % 150 === 0) console.log(i, ((Date.now() - t0) / i).toFixed(0) + 'ms/frame');
}
await browser.close();
