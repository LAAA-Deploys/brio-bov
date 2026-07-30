#!/usr/bin/env python3
"""Assemble and write the Brio BOV pages.

Usage:  python render.py
Reads bov-site.json. Writes index.html and one route file per property.
Never hand-edit the output. Fix bov-site.json and rebuild.
"""
import json
import shutil
from pathlib import Path

import build_site as B
import sections as S

ROOT = Path(__file__).parent


def property_page(data, p):
    """One property route file, e.g. 359-parke/index.html. depth = 1."""
    d = 1
    title = f"Broker Opinion of Value - {p['short_name']}"
    desc = (f"{p['units']}-Unit Multifamily Investment - {p['city']} | "
            f"LAAA Team - Marcus & Millichap")
    nav = [("index.html", "Portfolio")]
    nav += [("#track-record", "Track Record"), ("#marketing", "Marketing"),
            ("#investment", "Investment"), ("#location", "Location"),
            ("#prop-details", "Property")]
    if p["gallery"]:
        nav.append(("#photos", "Photos"))
    nav += [("#property-info", "Buyer Profile"), ("#rent-comps", "Rent Comps"),
            ("#sale-comps", "Sale Comps")]
    if p["active_comps"]:
        nav.append(("#on-market", "On-Market"))
    nav += [("#financials", "Financials"), ("#contact", "Contact")]

    photo_html, slide_js = S.photos(p, d)
    stats = [(str(p["units"]), "Units"), (B.num(p["building_sf"]), "Square Feet"),
             (str(p["year_built"]), "Year Built"), (B.num(p["lot_sf"]), "SF Lot")]

    parts = [
        B.head(title, desc, data, d, f"/{p['slug']}/"),
        B.cover(logo="images/LAAA_Team_White.png",
                label="Confidential Broker Opinion of Value",
                title=p["short_name"], address=p["city"], stats=stats,
                leads=data["team"]["leads"], client=data["meta"]["client"],
                month=data["meta"]["month_year"], hero=p["hero"], d=d),
        B.toc(nav, d),
        B.track_record(data, d),
        B.marketing(data),
        S.investment(p, d),
        S.location(p, d),
        S.prop_details(p, d),
        photo_html,
        S.buyer_profile(p),
        S.rent_comps(p, d),
        S.sale_comps(p, d),
        S.on_market(p, d),
        S.financials(p),
        B.footer(data, d),
        "\n<script>\n" + B.NAV_JS + (slide_js or "") + "</script>\n</body>\n</html>\n",
    ]
    return "".join(parts)


def hub_page(data):
    """Portfolio landing page. depth = 0. Carries no price."""
    d = 0
    title = f"Broker Opinion of Value - {data['meta']['title']}"
    pf = data["portfolio"]
    desc = (f"{pf['total_units']}-Unit Two-Property Multifamily Portfolio | "
            f"LAAA Team - Marcus & Millichap")
    nav = [("#portfolio", "Portfolio")]
    nav += [(f"{p['slug']}/index.html", p["short_name"]) for p in data["properties"]]
    nav += [("#track-record", "Track Record"), ("#marketing", "Marketing"), ("#contact", "Contact")]
    total_sf = sum(p["building_sf"] for p in data["properties"])
    years = sorted(p["year_built"] for p in data["properties"])
    stats = [(str(pf["total_units"]), "Total Units"),
             (str(len(data["properties"])), "Properties"),
             (B.num(total_sf), "Combined Building SF"),
             (f"{years[0]} / {years[-1]}", "Year Built")]
    parts = [
        B.head(title, desc, data, d, "/"),
        B.cover(logo="images/LAAA_Team_White.png",
                label="Confidential Broker Opinion of Value",
                title=data["meta"]["title"], address=data["meta"]["subtitle"], stats=stats,
                leads=data["team"]["leads"], client=data["meta"]["client"],
                month=data["meta"]["month_year"], hero=data["meta"]["hero"], d=d),
        B.toc(nav, d),
        S.portfolio_overview(data, d),
        B.track_record(data, d),
        B.marketing(data),
        B.footer(data, d),
        "\n<script>\n" + B.NAV_JS + "</script>\n</body>\n</html>\n",
    ]
    return "".join(parts)


def make_og(data):
    """1200x630 share card from the portfolio hero. Required on every build."""
    try:
        from PIL import Image
    except ImportError:
        print("  ! Pillow not installed, skipping og.jpg")
        return
    src = ROOT / data["meta"]["hero"]
    if not src.exists():
        print(f"  ! hero missing, skipping og.jpg: {src}")
        return
    im = Image.open(src)
    if im.mode != "RGB":
        im = im.convert("RGB")
    w, h = 1200, 630
    sr, ir = w / h, im.width / im.height
    if ir > sr:
        nw = int(im.height * sr)
        im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    else:
        nh = int(im.width / sr)
        im = im.crop((0, (im.height - nh) // 2, im.width, (im.height - nh) // 2 + nh))
    out = ROOT / "og.jpg"
    im.resize((w, h), Image.LANCZOS).save(out, format="JPEG", quality=86, optimize=True)
    print(f"  og.jpg  {out.stat().st_size:,} bytes (1200x630)")


def main():
    data = json.loads((ROOT / "bov-site.json").read_text(encoding="utf-8"))

    html = hub_page(data)
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"  index.html                {len(html.encode()):,} bytes")

    for p in data["properties"]:
        out = ROOT / p["slug"]
        out.mkdir(exist_ok=True)
        html = property_page(data, p)
        (out / "index.html").write_text(html, encoding="utf-8")
        print(f"  {p['slug']}/index.html".ljust(28) + f"{len(html.encode()):,} bytes")

    (ROOT / "CNAME").write_text(data["meta"]["domain"] + "\n", encoding="utf-8")
    (ROOT / ".nojekyll").write_text("", encoding="utf-8")
    make_og(data)
    print("build complete")


if __name__ == "__main__":
    main()
