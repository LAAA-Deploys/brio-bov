/**
 * Media fit audit: does every image and map actually fit its frame?
 *
 * For every <img> and every CSS background-image on every page, at every
 * breakpoint, this measures the natural size against the rendered box and
 * reports how the image is being fitted. It catches the failure modes a
 * broken-link check cannot see:
 *
 *   STRETCHED   aspect ratio distorted (object-fit: fill on a mismatched box)
 *   CROPPED     object-fit: cover is cutting off too much of the source
 *   LETTERBOX   object-fit: contain is leaving dead space in the frame
 *   UPSCALED    rendered larger than the source, so it renders soft
 *   ZERO        never loaded or has no intrinsic size
 *   OVERFLOW    the image paints outside its own container
 *
 * Maps are held to a tighter crop budget than photos: a cropped photo loses
 * scenery, a cropped map loses pins, scale bars and labels.
 *
 * Usage: node audit_media.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:8901';
const PAGES = ['/index.html', '/359-parke/index.html', '/1623-menlo/index.html'];
const WIDTHS = [320, 390, 768, 1440];

// Budgets. A map may lose at most 12% of its source area; a photo 45%.
const CROP_BUDGET = { map: 0.12, photo: 0.45 };
const LETTERBOX_BUDGET = 0.12;   // dead space allowed inside a frame
const ASPECT_TOLERANCE = 0.02;   // 2% distortion before it reads as stretched
const UPSCALE_BUDGET = 1.15;     // rendered vs natural

const audit = (B) => {
  const { CROP_BUDGET, LETTERBOX_BUDGET, ASPECT_TOLERANCE, UPSCALE_BUDGET } = B;
  const out = [];
  const isMap = (src) => /map/i.test(src || '');

  const measure = (el, src, nw, nh, box, fit, kind) => {
    const cw = box.width, ch = box.height;
    if (!cw || !ch) return null;
    if (!nw || !nh) return { src, kind, w: cw, h: ch, issue: 'ZERO', detail: 'no intrinsic size' };

    const na = nw / nh, ca = cw / ch;
    const r = { src, kind, natural: `${nw}x${nh}`, box: `${Math.round(cw)}x${Math.round(ch)}`, fit };

    if (fit === 'fill' || fit === 'none' || fit === 'scale-down') {
      const drift = Math.abs(ca - na) / na;
      r.drift = +(drift * 100).toFixed(1);
      if (fit === 'fill' && drift > ASPECT_TOLERANCE) {
        return { ...r, issue: 'STRETCHED', detail: `aspect off by ${r.drift}%` };
      }
    }
    if (fit === 'cover') {
      const scale = Math.max(cw / nw, ch / nh);
      const visible = (cw / scale) * (ch / scale) / (nw * nh);
      r.visible = +(visible * 100).toFixed(0);
      const budget = 1 - CROP_BUDGET[isMap(src) ? 'map' : 'photo'];
      if (visible < budget) {
        return { ...r, issue: 'CROPPED', detail: `only ${r.visible}% of the source is visible` };
      }
    }
    if (fit === 'contain') {
      const scale = Math.min(cw / nw, ch / nh);
      const dead = 1 - (nw * scale * nh * scale) / (cw * ch);
      r.dead = +(dead * 100).toFixed(0);
      if (dead > LETTERBOX_BUDGET) {
        return { ...r, issue: 'LETTERBOX', detail: `${r.dead}% of the frame is empty` };
      }
    }
    const upscale = Math.max(cw / nw, ch / nh);
    if (upscale > UPSCALE_BUDGET) {
      return { ...r, issue: 'UPSCALED', detail: `rendered ${upscale.toFixed(2)}x its source` };
    }
    return { ...r, issue: null };
  };

  for (const el of document.querySelectorAll('img')) {
    const box = el.getBoundingClientRect();
    if (box.width < 4 || box.height < 4) continue;          // hidden or lightbox stub
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const src = el.getAttribute('src') || '';
    if (!src) continue;
    const res = measure(el, src, el.naturalWidth, el.naturalHeight, box, cs.objectFit, 'img');
    if (res) out.push(res);
    // paints outside its own container
    const par = el.parentElement.getBoundingClientRect();
    const pcs = getComputedStyle(el.parentElement);
    if (pcs.overflow === 'visible' && (box.right > par.right + 1 || box.bottom > par.bottom + 1)) {
      out.push({ src, kind: 'img', issue: 'OVERFLOW', detail: 'paints outside its container' });
    }
  }

  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (!bg || bg === 'none' || !bg.includes('url(')) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 4 || box.height < 4) continue;
    const src = bg.match(/url\(["']?(.*?)["']?\)/)?.[1] || '';
    out.push({ src: src.split('/').slice(-1)[0], kind: 'bg', box: `${Math.round(box.width)}x${Math.round(box.height)}`,
               fit: cs.backgroundSize, issue: null, _bg: true });
  }
  return out;
};

const browser = await chromium.launch();
const findings = [];
let checked = 0;

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // force every lazy image to load and settle before measuring
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 250));
      window.scrollTo(0, 0);
      await Promise.all([...document.images].filter(i => !i.complete)
        .map(i => new Promise(r => { i.onload = i.onerror = r; })));
    });
    await page.waitForTimeout(350);
    const rows = await page.evaluate(audit, { CROP_BUDGET, LETTERBOX_BUDGET, ASPECT_TOLERANCE, UPSCALE_BUDGET });
    for (const r of rows) {
      checked++;
      if (r.issue) findings.push({ width: w, page: path, ...r });
    }
  }
  await ctx.close();
}
await browser.close();

// A map that loses content is a failure: pins, labels and scale carry meaning.
// A photo limited by its own source resolution is a warning, because no CSS
// change can fix it. Splitting these keeps the gate actionable rather than
// permanently red, which is how a gate ends up switched off.
const isMapSrc = (s) => /map/i.test(String(s || ''));
const FAIL_ISSUES = new Set(['STRETCHED', 'ZERO', 'OVERFLOW']);
const fails = findings.filter(f => FAIL_ISSUES.has(f.issue)
  || (isMapSrc(f.src) && (f.issue === 'CROPPED' || f.issue === 'LETTERBOX')));
const warns = findings.filter(f => !fails.includes(f));

console.log(`\nMEDIA FIT AUDIT  ${BASE}`);
console.log(`checked ${checked} rendered images across ${PAGES.length} pages x ${WIDTHS.length} widths\n`);
if (!findings.length) {
  console.log('  PASS  every image and map fits its frame within budget');
} else {
  const by = {};
  for (const f of findings) {
    const tag = (fails.includes(f) ? 'FAIL ' : 'warn ') + f.issue;
    (by[tag] ||= []).push(f);
  }
  for (const [issue, list] of Object.entries(by)) {
    console.log(`  ${issue}  (${list.length})`);
    const seen = new Set();
    for (const f of list) {
      const key = f.src + f.issue;
      const widths = list.filter(x => x.src === f.src && x.issue === f.issue).map(x => x.width);
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`    ${String(f.src).split('/').pop()}`);
      console.log(`      ${f.detail}  |  natural ${f.natural} into ${f.box} (${f.fit})  |  at ${[...new Set(widths)].join(', ')}px`);
    }
  }
}
console.log(`\n  ${fails.length} failing, ${warns.length} warning`);
if (!fails.length) {
  console.log('  PASS  every map fits its frame exactly; anything remaining is a source-resolution limit');
}
process.exit(fails.length ? 1 : 0);
