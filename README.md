# Brio Portfolio BOV

Seller-facing broker opinion of value for 359 Parke Street in Pasadena and 1623 Menlo Avenue in Los Angeles. Prepared for Tim Okay / Brio Real Estate.

## Design lock

This site is built to the **Camarillo design**, the locked LAAA BOV/OM website standard (`LAAA-Deploys/11168-camarillo-bov`). The structure and stylesheet in `template/` came from Camarillo's shipped `index.html` verbatim, with the PDF download button removed and the nav touch target raised to 44px.

**This is static HTML. It is not a framework app and must never become one.** React, Vite, Next, Svelte, Astro, and Slidev are prohibited for any BOV or OM website. The full rule is the BOV/OM DESIGN LOCK in `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`, which outranks this file. The previous version of this site was a React/Vite SPA and was rejected.

## Build

```powershell
python make_data.py   # sources -> bov-site.json  (only needed when the data changes)
python render.py      # bov-site.json -> index.html + one route file per property
```

Every deal fact lives in `bov-site.json`. **Never hand-edit the generated HTML.** Fix the data and rebuild, or the next build silently reverts your change.

## Routes

Real route files, no client-side routing, so every URL returns HTTP 200 on GitHub Pages.

- `/` portfolio hub, carries no price
- `/359-parke/` full Parke valuation
- `/1623-menlo/` full Menlo valuation

## Sources

- **Pricing authority:** the LAAA setup sheets dated 2026-07-30. Parke $2,500,000, Menlo $2,200,000. These also supply the unit mix, operating data, and financing.
- **Narratives, comps, photos, rooftop coordinates:** the approved Brio analysis, preserved in `raw/`. Not re-derived.
- **Track record:** pulled live from Airtable LAAA Closed Deals on 2026-07-30 and rounded down.

## STATUS: the shared generator has not been extracted yet

`render.py`, `sections.py`, `build_site.py`, and `template/` were written here, for this deal, from Camarillo's HTML. They are **meant to become the shared LAAA generator** at `LAAA-AI-Prompts/reporting/bovsite/`.

**Until that extraction lands, do not hand-build another BOV or OM website, and do not clone this repo to start one.** Extract the generator into `LAAA-AI-Prompts` first, then build the next deal from there. Cloning the last deal is exactly how the design drifted before, and copying this repo would restart that cycle with a second divergent copy.

If you are reading this because you are about to start a new BOV website: stop, check whether `LAAA-AI-Prompts/reporting/bovsite/build_bov_site.py` exists, and if it does not, extract it from this repo before going further.
