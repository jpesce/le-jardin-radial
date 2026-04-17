/**
 * Captures a framed screenshot of the app for README.
 *
 * Usage: npx tsx scripts/screenshot.ts
 */
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { raw } from '../src/data/flowers';

// ── Configuration ───────────────────────────────────────────────────────

const VIEWPORT_WIDTH = 1866;
const VIEWPORT_HEIGHT = 1166;
const DPR = 3;
const PADDING = 180; // px around the screenshot (in CSS pixels)
const BACKGROUND = '#DAE0D6';
const OUTPUT_WIDTH = 4000; // final image width in pixels (height scales proportionally)
const OUTPUT = 'docs/screenshot.webp';
const QUALITY = 90;

// ── Garden selection ────────────────────────────────────────────────────

const ALL_IDS = raw.map((f) => f.id);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const ai = a[i] as T;
    const aj = a[j] as T;
    [a[i], a[j]] = [aj, ai];
  }
  return a;
}

const garden = shuffle(ALL_IDS).slice(0, 15);
const selected = garden.slice(0, 10);

const SEED_JSON = JSON.stringify({
  state: {
    owner: 'Tainah Drummond',
    labels: true,
    defaultCatalog: raw,
    garden,
    selected,
    customFlowers: {},
    isShared: false,
  },
  version: 0,
});

// ── Server ──────────────────────────────────────────────────────────────

const server = await createServer({
  server: { port: 0 },
  optimizeDeps: { entries: ['src/main.tsx'] },
});
await server.listen();
const address = server.httpServer?.address();
if (!address || typeof address === 'string')
  throw new Error('Server failed to start');
const port = address.port;
const url = `http://localhost:${port}`;

// ── Capture ─────────────────────────────────────────────────────────────

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  deviceScaleFactor: DPR,
});

await page.goto(url);
await page.evaluate((json) => {
  localStorage.setItem('jardin-radial', json);
  localStorage.setItem('jardin-radial-lang', 'fr');
}, SEED_JSON);
await page.reload();
await page.locator('.radial-chart-svg').waitFor();
await page.waitForTimeout(1500);
await page.getByText('Planifier jardin').click();
await page.waitForTimeout(500);

const rawScreenshot = await page.screenshot();

// ── Frame ───────────────────────────────────────────────────────────────

const frameWidth = VIEWPORT_WIDTH + PADDING * 2;
const frameHeight = VIEWPORT_HEIGHT + PADDING * 2;

const base64 = rawScreenshot.toString('base64');
const html = `<!DOCTYPE html>
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;
  width:${frameWidth}px;height:${frameHeight}px;
  background:${BACKGROUND};">
  <div style="border-radius:10px;overflow:hidden;
    box-shadow:0 20px 60px rgba(68,53,40,0.25),0 0 0 0.5px rgba(68,53,40,0.1);">
    <img src="data:image/png;base64,${base64}" style="display:block;width:${VIEWPORT_WIDTH}px;" />
  </div>
</body></html>`;

await page.setViewportSize({ width: frameWidth, height: frameHeight });
await page.setContent(html);
const pngBuffer = await page.screenshot();
await browser.close();
await server.close();

// ── Output ──────────────────────────────────────────────────────────────

const sharp = (await import('sharp')).default;
await sharp(pngBuffer)
  .resize(OUTPUT_WIDTH)
  .webp({ quality: QUALITY })
  .toFile(OUTPUT);

console.log(`Viewport: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT} @ ${DPR}x DPR`);
console.log(`Padding: ${PADDING}px → frame ${frameWidth}x${frameHeight}`);
console.log(`Output: ${OUTPUT_WIDTH}px wide, ${OUTPUT}`);
console.log(`Garden: ${selected.join(', ')}`);
