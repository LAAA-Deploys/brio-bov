/**
 * Navigation audit: can a reader actually reach every section?
 *
 * The sticky nav scrolls horizontally on a phone. Two defects shipped here and
 * neither was visible to a link-checker or a screenshot:
 *
 *  1. `justify-content: center` on an overflowing flex scroller pushes the
 *     LEADING links into negative space that scrollLeft:0 cannot reach, so
 *     Portfolio and Track Record were permanently unreachable on mobile. Fixed
 *     with `justify-content: safe center`.
 *  2. `padding-right` collapses on an overflowing flex scroller, so the final
 *     link (Contact) could never be brought fully into view. Fixed with a
 *     zero-width trailing flex spacer.
 *
 * This sweeps the scroller end to end at every breakpoint and fails if any link
 * is never fully visible at any scroll position.
 *
 * Usage: node audit_nav.mjs [baseUrl]
 */
import { chromium } from 'playwright';
const PAGES=['/index.html','/359-parke/index.html','/1623-menlo/index.html'];
const BASE = process.argv[2] || 'http://localhost:8901';
const b = await chromium.launch(); let bad=0;
for (const w of [320,390,768,1440]) {
  const ctx = await b.newContext({ viewport:{width:w,height:844}, hasTouch:w<700, isMobile:w<700 });
  const p = await ctx.newPage();
  for (const path of PAGES) {
    await p.goto(BASE+path,{waitUntil:'networkidle'});
    const r = await p.evaluate(async ()=>{
      const n=document.getElementById('toc-nav');
      n.style.scrollBehavior='auto';
      const links=[...n.querySelectorAll('a')];
      const unreachable=[];
      // walk the scroller end to end and record which links are ever fully visible
      const seen=new Set(); const max=n.scrollWidth-n.clientWidth;
      for(let x=0;x<=max+1;x+=20){
        n.scrollLeft=x; await new Promise(r=>requestAnimationFrame(r));
        const nr=n.getBoundingClientRect();
        links.forEach(a=>{const ar=a.getBoundingClientRect();
          if(ar.left>=nr.left-2 && ar.right<=nr.right+2) seen.add(a.textContent.trim());});
      }
      links.forEach(a=>{const t=a.textContent.trim(); if(!seen.has(t)) unreachable.push(t);});
      return {total:links.length, unreachable, overflow:max};
    });
    const tag=(path.replace('/index.html','')||'/').padEnd(12);
    if(r.unreachable.length){bad++;console.log(`  ${w}px ${tag} UNREACHABLE: ${r.unreachable.join(', ')}`);}
    else console.log(`  ${w}px ${tag} all ${r.total} links reachable (scrollable ${r.overflow}px)`);
  }
  await ctx.close();
}
await b.close();
console.log(bad? `\n  ${bad} FAILURES` : '\n  PASS every nav link is reachable at every width on every page');
process.exit(bad?1:0);
