/**
 * Table fit audit: is every cell, row and column deliberately sized?
 *
 * A data table is the densest thing on a BOV and the easiest to get wrong. This
 * measures every table on every page at every breakpoint and reports:
 *
 *   WRAP        a cell renders on more than one line (Glen: no wrapping)
 *   HEADER_WRAP a column header splits across lines ("BLDG SF" on two rows)
 *   RAGGED      row heights inside one table are not uniform
 *   LOPSIDED    one column is disproportionately wider than the rest
 *   TINY        font renders below the legibility floor
 *   CONTRAST    text fails WCAG AA against its own background
 *   CLIPPED     the table overflows with no way to scroll to the rest
 *   MISALIGNED  a numeric column is not right-aligned
 *
 * Desktop and mobile are judged separately, because a table that reads well at
 * 1440 can be unreadable at 390 and the fix differs.
 *
 * Usage: node audit_tables.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:8901';
const PAGES = ['/index.html', '/359-parke/index.html', '/1623-menlo/index.html'];
const WIDTHS = [390, 768, 1440];

const LIMITS = {
  minFontPx: 9,          // below this a figure is not readable on a phone
  rowHeightTolerance: 0.30,  // spread allowed between the tallest and shortest body row
  columnRatio: 6.0,      // widest data column vs narrowest, before it looks lopsided
  contrastNormal: 4.5,   // WCAG AA
  contrastLarge: 3.0,
};

const audit = (L) => {
  const out = [];

  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const bgOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const p = parse(bg);
      if (p.length === 3 && !/rgba\(.*,\s*0\)/.test(bg)) return p;
    }
    return [255, 255, 255];
  };
  const ratio = (fg, bg) => {
    const a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  // a cell wraps if its content box is taller than roughly one line
  const lines = (el) => {
    const cs = getComputedStyle(el);
    let lh = parseFloat(cs.lineHeight);
    if (!lh || Number.isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.2;
    const inner = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return Math.max(1, Math.round(inner / lh));
  };

  document.querySelectorAll('table').forEach((table, ti) => {
    if (!table.offsetParent && getComputedStyle(table).display === 'none') return;
    const section = table.closest('[id]')?.id || `table${ti}`;
    const scroller = table.closest('.table-scroll');
    const isData = !!scroller;                    // .info-table prose may wrap
    const tag = `${section}${isData ? '' : ' (info)'}`;

    // clipped: wider than its parent with no scroll
    const parent = scroller || table.parentElement;
    if (table.scrollWidth > parent.clientWidth + 1) {
      const canScroll = getComputedStyle(parent).overflowX.match(/auto|scroll/);
      if (!canScroll) {
        out.push({ table: tag, issue: 'CLIPPED',
                   detail: `table is ${Math.round(table.scrollWidth)}px inside a ${Math.round(parent.clientWidth)}px box with no scroll` });
      }
    }

    const heads = [...table.querySelectorAll('thead th')];
    heads.forEach((th) => {
      if (isData && lines(th) > 1) {
        out.push({ table: tag, issue: 'HEADER_WRAP', detail: `header "${th.textContent.trim()}" wraps to ${lines(th)} lines` });
      }
    });

    const bodyRows = [...table.querySelectorAll('tbody tr')];
    bodyRows.forEach((tr) => {
      [...tr.children].forEach((td) => {
        const txt = td.textContent.trim();
        if (!txt) return;
        const n = lines(td);
        if (isData && n > 1) {
          out.push({ table: tag, issue: 'WRAP', detail: `"${txt.slice(0, 34)}" wraps to ${n} lines` });
        }
        const cs = getComputedStyle(td);
        const fs = parseFloat(cs.fontSize);
        if (fs < L.minFontPx) {
          out.push({ table: tag, issue: 'TINY', detail: `${fs.toFixed(1)}px on "${txt.slice(0, 22)}"` });
        }
        const c = ratio(parse(cs.color), bgOf(td));
        const need = (fs >= 18 || (fs >= 14 && +cs.fontWeight >= 700)) ? L.contrastLarge : L.contrastNormal;
        if (c < need) {
          out.push({ table: tag, issue: 'CONTRAST', detail: `${c.toFixed(2)}:1 needs ${need}:1 on "${txt.slice(0, 22)}"` });
        }
        // a cell holding only a figure must be right aligned
        if (isData && /^[($]?[\d,]+(\.\d+)?%?\)?$/.test(txt) && txt.length > 2 && cs.textAlign !== 'right') {
          out.push({ table: tag, issue: 'MISALIGNED', detail: `"${txt}" is ${cs.textAlign}, numbers align right` });
        }
      });
    });

    // uniform row heights: no wrapping means every body row should match
    const hs = !isData ? [] : bodyRows.filter(r => !r.classList.contains('summary'))
                       .map(r => r.getBoundingClientRect().height).filter(h => h > 4);
    if (hs.length > 2) {
      const min = Math.min(...hs), max = Math.max(...hs);
      if (min > 0 && (max - min) / min > L.rowHeightTolerance) {
        out.push({ table: tag, issue: 'RAGGED', detail: `row heights run ${Math.round(min)}px to ${Math.round(max)}px` });
      }
    }

    // column balance across data columns
    if (isData && bodyRows.length) {
      const first = bodyRows.find(r => r.children.length === heads.length);
      if (first) {
        const w = [...first.children].map(c => c.getBoundingClientRect().width).filter(x => x > 0);
        if (w.length > 2) {
          const mx = Math.max(...w), mn = Math.min(...w);
          if (mn > 0 && mx / mn > L.columnRatio) {
            out.push({ table: tag, issue: 'LOPSIDED', detail: `widest column ${Math.round(mx)}px vs narrowest ${Math.round(mn)}px (${(mx / mn).toFixed(1)}x)` });
          }
        }
      }
    }
  });
  return out;
};

const browser = await chromium.launch();
const findings = [];
let tables = 0;

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    tables += await page.evaluate(() => document.querySelectorAll('table').length);
    for (const r of await page.evaluate(audit, LIMITS)) {
      findings.push({ width: w, page: path.replace('/index.html', '') || '/', ...r });
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`\nTABLE FIT AUDIT  ${BASE}`);
console.log(`checked ${tables} rendered tables across ${PAGES.length} pages x ${WIDTHS.length} widths\n`);

if (!findings.length) {
  console.log('  PASS  no wrapping, uniform rows, balanced columns, legible and AA-contrast at every width');
} else {
  const by = {};
  for (const f of findings) (by[f.issue] ||= []).push(f);
  for (const [issue, list] of Object.entries(by)) {
    // collapse identical findings that repeat across widths
    const seen = new Map();
    for (const f of list) {
      const k = `${f.page}|${f.table}|${f.detail}`;
      if (!seen.has(k)) seen.set(k, { ...f, widths: [] });
      seen.get(k).widths.push(f.width);
    }
    console.log(`  ${issue}  (${seen.size} distinct)`);
    for (const f of [...seen.values()].slice(0, 8)) {
      console.log(`    ${f.page}  ${f.table}`);
      console.log(`      ${f.detail}   at ${[...new Set(f.widths)].join(', ')}px`);
    }
    if (seen.size > 8) console.log(`    ... and ${seen.size - 8} more`);
  }
}
process.exit(findings.length ? 1 : 0);
