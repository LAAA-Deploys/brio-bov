"""Property-page and hub sections for the Brio BOV.

Design is LOCKED to LAAA-Deploys/11168-camarillo-bov. Structure mirrors
Camarillo section for section. Do not restyle here.
"""
import json
from build_site import (e, num, money, pct, paras, rel, section_head, metrics4, SLIDE_JS)


def map_frame(src, alt, d, extra_class=""):
    """Emit a map in a <picture> so the render matches the frame at every width.

    make_maps.py writes two files per map: `<name>.png` at 3:1 for the desktop
    band and `<name>-tall.png` at 4:3 for phones. bov.css switches the frame
    aspect at the same 700px breakpoint, so neither render is ever cropped or
    letterboxed. Verified by audit_media.mjs.
    """
    if not src:
        return ""
    tall = src.replace(".png", "-tall.png")
    cls = ("loc-wide-map " + extra_class).strip()
    return ('  <div class="%s"><picture>'
            '<source media="(max-width: 700px)" srcset="%s">'
            '<img src="%s" alt="%s" loading="lazy"></picture></div>\n'
            % (cls, rel(tall, d), rel(src, d), e(alt)))


# ---------------------------------------------------------------------------
# property page sections
# ---------------------------------------------------------------------------
def investment(p, d):
    hl = "".join(f"<li>{e(h)}</li>" for h in p["highlights"])
    photo = p["gallery"][1]["src"] if len(p["gallery"]) > 1 else p["hero"]
    stats = [(num(p["units"]), "Units"), (num(p["building_sf"]), "Building SF"),
             (str(p["year_built"]), "Year Built"), (num(p["lot_sf"]), "Lot SF")]
    return f"""
<div class="page-break-marker"></div>
<div class="section section-alt" id="investment">
{section_head("Investment Overview", p["address"])}\
  <div class="inv-split">
    <div class="inv-left">
{metrics4(stats)}\
      <div class="inv-text">
{paras(p["overview"])}
{paras(p["positioning_narrative"])}
      </div>
    </div>
    <div class="inv-right">
      <div class="inv-photo"><img src="{rel(photo, d)}" alt="{e(p['short_name'])}" loading="lazy"></div>
      <div class="inv-highlights"><h4>Investment Highlights</h4><ul>{hl}</ul></div>
    </div>
  </div>
</div>
"""


def location(p, d):
    map_html = map_frame(p["maps"].get("subject"), "Location Map", d)
    rows = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in [
        ("Address", p["address"]), ("City", p["city"]), ("APN", p["apn"]),
        ("Year Built", p["year_built"]), ("Building SF", num(p["building_sf"])),
        ("Lot Size", f"{num(p['lot_sf'])} SF ({p['lot_acres']} ac)"),
        ("Units", p["units"]), ("Parking", p["parking"]),
    ])
    return f"""
<div class="page-break-marker"></div>
<div class="section section-alt" id="location">
{section_head("Location Overview", p["location_title"])}\
  <div class="loc-grid">
    <div class="loc-left">
{paras(p["location_narrative"])}
    </div>
    <div class="loc-right">
      <table class="info-table"><thead><tr><th colspan="2">Property &amp; Location Details</th></tr></thead><tbody>{rows}</tbody></table>
    </div>
  </div>
{map_html}</div>
"""


def prop_details(p, d):
    mix = "".join(
        f'<tr><td>{u["count"]}x {e(u["type"])}</td><td class="num">{num(u["sf"])} SF</td></tr>'
        for u in p["unit_mix"])
    t1 = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in [
        ("Units", p["units"]), ("Year Built", p["year_built"]),
        ("Building SF", num(p["building_sf"])), ("Lot SF", num(p["lot_sf"])),
        ("APN", p["apn"]),
    ])
    return f"""
<div class="page-break-marker"></div>
<div class="section" id="prop-details">
{section_head("Property Details", p["short_name"])}\
  <div class="prop-grid-4">
    <div><table class="info-table"><thead><tr><th colspan="2">Property Overview</th></tr></thead><tbody>{t1}</tbody></table></div>
    <div><table class="info-table"><thead><tr><th colspan="2">Unit Mix</th></tr></thead><tbody>{mix}</tbody></table></div>
  </div>
  <div class="inv-text" style="margin-top:18px;">
{paras(p["physical_narrative"])}
  </div>
</div>
"""


def photos(p, d):
    if not p["gallery"]:
        return "", ""
    slides = ",\n  ".join(f'["{rel(g["src"], d)}", {json.dumps(g["alt"])}]' for g in p["gallery"])
    first = p["gallery"][0]
    html = f"""
<div class="page-break-marker"></div>
<div class="section" id="photos">
{section_head("Property Photos", p["short_name"])}\
  <div class="slideshow">
    <div class="slide-stage">
      <span class="slide-counter" id="slideCounter">1 / {len(p['gallery'])}</span>
      <button class="slide-arrow prev" onclick="slideMove(-1)" aria-label="Previous photo">&#8249;</button>
      <img id="slideMain" src="{rel(first['src'], d)}" alt="{e(p['short_name'])} photo" onclick="openLightbox()">
      <div class="slide-caption" id="slideCaption">{e(first['alt'])}</div>
      <button class="slide-arrow next" onclick="slideMove(1)" aria-label="Next photo">&#8250;</button>
    </div>
    <div class="slide-thumbs" id="slideThumbs"></div>
  </div>
  <p style="font-size:11px;color:#6B7280;margin-top:8px;">Click any image to enlarge. Images depict the property and representative interiors. Source: listing media and site photography.</p>
</div>
<div class="lightbox" id="lightbox" onclick="if(event.target===this)closeLightbox()">
  <button class="lb-close" onclick="closeLightbox()" aria-label="Close">&times;</button>
  <button class="lb-arrow prev" onclick="slideMove(-1);syncLightbox()" aria-label="Previous">&#8249;</button>
  <img id="lbImg" src="" alt="{e(p['short_name'])} photo enlarged">
  <button class="lb-arrow next" onclick="slideMove(1);syncLightbox()" aria-label="Next">&#8250;</button>
  <div class="lb-cap" id="lbCap"></div>
</div>
"""
    return html, f"var SLIDES = [\n  {slides}\n];\n" + SLIDE_JS


def buyer_profile(p):
    left = "".join(f'<div class="obj-item"><p class="obj-q">{e(b["title"])}</p>'
                   f'<p class="obj-a">{e(b["copy"])}</p></div>' for b in p["buyer_profiles"])
    right = "".join(f'<div class="obj-item"><p class="obj-q">{e(s["title"])}</p>'
                    f'<p class="obj-a">{e(s["copy"])}</p></div>' for s in p["strategy"])
    return f"""
<div class="section section-alt" id="property-info">
{section_head("Buyer Profile & Transaction Strategy", "Target Investors and How We Reach Them")}\
  <div class="buyer-split">
    <div class="buyer-split-left"><h3 class="sub-heading">Target Buyer Profile</h3>{left}</div>
    <div class="buyer-split-right"><h3 class="sub-heading">Transaction Strategy</h3>{right}</div>
  </div>
</div>
"""


def rent_comps(p, d):
    map_html = map_frame(p["maps"].get("rent"), "Rent Comps Map", d, "comp-map")
    rows = "".join(
        f'<tr><td>{e(c["address"])}</td><td>{e(c["unit_type"])}</td>'
        f'<td class="num">{num(c["square_feet"]) if c.get("square_feet") else "-"}</td>'
        f'<td class="num">{money(c["rent"])}</td>'
        f'<td class="num">{c["distance"]:.2f} mi</td></tr>' for c in p["rent_comps"])
    n = len(p["rent_comps"])
    avg = sum(c["rent"] for c in p["rent_comps"]) / n if n else 0
    # Same rule as the sale table: every column carrying numbers gets an
    # aggregate. SF and distance were being dashed or hidden under a colspan.
    sfs = [c["square_feet"] for c in p["rent_comps"] if c.get("square_feet")]
    avg_sf = sum(sfs) / len(sfs) if sfs else None
    dists = [c["distance"] for c in p["rent_comps"] if c.get("distance") is not None]
    avg_dist = sum(dists) / len(dists) if dists else None
    return f"""
<div class="page-break-marker"></div>
<div class="section" id="rent-comps">
{section_head("Rent Comparables", "Achieved and Asking Rents in the Immediate Submarket")}\
{map_html}\
  <div class="table-scroll"><table>
    <thead><tr><th>Address</th><th>Unit Type</th><th class="num">SF</th><th class="num">Asking Rent</th><th class="num">Distance</th></tr></thead>
    <tbody>{rows}
<tr class="summary"><td colspan="2"><strong>Average ({n} rent comps)</strong></td><td class="num"><strong>{num(avg_sf) if avg_sf else "-"}</strong></td><td class="num"><strong>{money(avg)}</strong></td><td class="num"><strong>{f"{avg_dist:.2f} mi" if avg_dist is not None else "-"}</strong></td></tr>
</tbody>
  </table></div>
{paras(p["rent_narrative"], "narrative")}
</div>
"""


def _comp_table(comps, price_label):
    rows = "".join(
        f'<tr><td>{e(c["address"])}</td><td class="num">{c["year_built"]}</td>'
        f'<td class="num">{num(c["units"])}</td><td class="num">{num(c["building_sf"])}</td>'
        f'<td class="num">{money(c["price"])}</td><td class="num">{money(c["price_per_unit"])}</td>'
        f'<td class="num">${c["price_per_sf"]:,.0f}</td>'
        f'<td class="num">{("%.2f" % c["grm"]) if c.get("grm") else "-"}</td>'
        f'<td class="num">{pct(c["cap_rate"]) if c.get("cap_rate") else "-"}</td>'
        f'<td class="num">{e(c["date"])}</td></tr>' for c in comps)
    n = len(comps)

    def med(k):
        """True median over the comps that actually carry the value.

        Two rules learned the hard way:
        1. For an even count take the mean of the two middle values. sorted[n//2]
           alone reports the higher of a pair, which is not a median.
        2. Skip missing values instead of dashing the whole column. Not every
           comp reports GRM or a cap rate, but five of six still make a real
           median. Dashing those two while publishing $/unit and $/SF drops the
           two metrics a seller judges yield on, and the pricing doctrine holds
           all four to equal standing with no lead metric.
        """
        v = sorted(c[k] for c in comps if c.get(k) not in (None, "", 0))
        if not v:
            return None
        m = len(v)
        return v[m // 2] if m % 2 else (v[m // 2 - 1] + v[m // 2]) / 2

    mg, mc, msf = med("grm"), med("cap_rate"), med("building_sf")
    # Every column with numbers above it gets a median. Only Date is genuinely
    # not aggregatable. Enforced by audit_tables.mjs (SUMMARY_GAP).
    return f"""  <div class="table-scroll"><table>
    <thead><tr><th>Address</th><th class="num">Yr</th><th class="num">Units</th><th class="num">Bldg SF</th><th class="num">{price_label}</th><th class="num">$/Unit</th><th class="num">$/SF</th><th class="num">GRM</th><th class="num">Cap</th><th class="num">Date</th></tr></thead>
    <tbody>{rows}
<tr class="summary"><td colspan="3"><strong>Median ({n} comps)</strong></td><td class="num"><strong>{num(msf)}</strong></td><td class="num"><strong>{money(med("price"))}</strong></td><td class="num"><strong>{money(med("price_per_unit"))}</strong></td><td class="num"><strong>${med("price_per_sf"):,.0f}</strong></td><td class="num"><strong>{f"{mg:.2f}" if mg else "-"}</strong></td><td class="num"><strong>{pct(mc) if mc else "-"}</strong></td><td class="num">-</td></tr>
</tbody>
  </table></div>
"""


def sale_comps(p, d):
    map_html = map_frame(p["maps"].get("sale"), "Sale Comps Map", d, "comp-map")
    cards = "".join(
        f'<p class="narrative"><strong>{i}. {e(c["address"])}</strong> - {e(c["summary"])} '
        f'{e(c["relevance"])} {e(c["considerations"])}</p>'
        for i, c in enumerate(p["sale_comps"], 1))
    sub = f"{len(p['sale_comps'])} Closed Sales in the Submarket"
    return f"""
<div class="page-break-marker"></div>
<div class="section" id="sale-comps">
{section_head("Sale Comparables", sub)}\
{map_html}{_comp_table(p["sale_comps"], "Sale Price")}\
{paras(p["market_narrative"], "narrative")}
  <div class="comp-narratives">{cards}</div>
</div>
"""


def on_market(p, d):
    if not p["active_comps"]:
        return ""
    map_html = map_frame(p["maps"].get("active"), "On-Market Comps Map", d, "comp-map")
    cards = "".join(
        f'<p class="narrative"><strong>{e(c["address"])}</strong> - {e(c["summary"])} {e(c["relevance"])}</p>'
        for c in p["active_comps"])
    return f"""
<div class="page-break-marker"></div>
<div class="section section-alt" id="on-market">
{section_head("On-Market Comparables", "Active Competition and the Pricing Ceiling")}\
{map_html}{_comp_table(p["active_comps"], "List Price")}\
  <div class="comp-narratives">{cards}</div>
</div>
"""


def financials(p):
    op = p["operating"]
    mix_rows = "".join(
        f'<tr><td class="num">{u["count"]}</td><td>{e(u["type"])}</td><td class="num">{num(u["sf"])}</td>'
        f'<td class="num">{money(u["rent_current"])}</td><td class="num">{money(u["monthly_current"])}</td>'
        f'<td class="num">{money(u["rent_market"])}</td><td class="num">{money(u["monthly_market"])}</td></tr>'
        for u in p["unit_mix"])

    def orow(label, cur, mkt, cls=""):
        c = f' class="{cls}"' if cls else ""
        return (f'<tr{c}><td>{e(label)}</td><td class="num">{money(cur)}</td>'
                f'<td class="num">{money(mkt)}</td></tr>')

    ops = "".join([
        orow("Scheduled Gross Income", *op["sgi"]),
        orow(f'Vacancy Reserve at {op["vacancy_pct"]}%', -op["vacancy"][0], -op["vacancy"][1]),
        orow("Gross Operating Income", *op["goi"], cls="summary"),
        orow("Operating Expenses", -op["expenses"][0], -op["expenses"][1]),
        orow("Net Operating Income", *op["noi"], cls="summary"),
        orow("Loan Payments", *op["loan_payments"]),
        orow("Pre-Tax Cash Flow", *op["pretax_cf"]),
        orow("Principal Reduction", *op["principal_reduction"]),
        orow("Total Return Before Taxes", *op["total_return"], cls="summary"),
    ])
    # Expenses: Current and Pro Forma side by side with a numbered note ref on
    # every line, matching the locked Camarillo operating statement. A $0 line is
    # dropped entirely rather than printed as "$0" (Glen 2026-07-30) — an expense
    # the seller never reported is a diligence gap, and the note says so.
    ex_rows, notes_used = [], []
    for row in p["expense_lines"]:
        label, cur, pf, ref = (list(row) + [None, None])[:4] if len(row) >= 4 else (row[0], row[1], row[1], None)
        if not cur and not pf:
            continue
        ref_html = f'<span class="note-ref">[{ref}]</span>' if ref else ""
        if ref and ref not in notes_used:
            notes_used.append(ref)
        ex_rows.append(f'<tr><td>{e(label)}{ref_html}</td>'
                       f'<td class="num">{money(cur)}</td><td class="num">{money(pf)}</td></tr>')
    exp = "".join(ex_rows)
    # Use the setup sheet's STATED total, not a recomputed sum. Its line items
    # add to $72,863 against a stated $72,862 (rounding), and the stated figure
    # is the one every other number on the page ties to.
    exp_cur = p["expense_total"]
    exp_pf = p["operating"]["expenses"][1] or p["expense_total"]
    notes = p.get("expense_notes") or {}
    notes_html = "".join(
        f'<p class="os-note"><span class="note-ref">[{k}]</span> <strong>{e(notes[str(k)][0])}:</strong> '
        f'{e(notes[str(k)][1])}</p>'
        for k in notes_used if str(k) in notes)
    fin = p["financing"]
    summ = "".join(f'<tr><td>{e(k)}</td><td class="num">{v}</td></tr>' for k, v in [
        ("Price", money(p["price"])), ("Number of Units", num(p["units"])),
        ("Price per Unit", money(p["price_per_unit"])), ("Price per SF", f"${p['price_per_sf']:,.2f}"),
        ("Current GRM", f"{p['grm_current']:.2f}"), ("Market GRM", f"{p['grm_market']:.2f}"),
        ("Current Cap Rate", pct(p["cap_current"])), ("Market Cap Rate", pct(p["cap_market"])),
    ])
    finrows = "".join(f'<tr><td>{e(k)}</td><td class="num">{v}</td></tr>' for k, v in [
        ("Loan Amount", money(fin["loan_amount"])),
        ("Down Payment", money(p["price"] - fin["loan_amount"])),
        ("Interest Rate", pct(fin["rate"])), ("Amortization", f"{fin['amortization']} years"),
        ("DCR", f"{fin['dcr']:.2f}"),
    ])
    return f"""
<div class="page-break-marker"></div>
<div class="section section-alt" id="financials">
{section_head("Financial Analysis", p["short_name"])}\
  <h3 class="sub-heading">Unit Mix &amp; Scheduled Rent</h3>
  <div class="table-scroll"><table>
    <thead><tr><th class="num">Units</th><th>Type</th><th class="num">Approx SF</th><th class="num">Current Rent</th><th class="num">Current Monthly</th><th class="num">Market Rent</th><th class="num">Market Monthly</th></tr></thead>
    <tbody>{mix_rows}
<tr class="summary"><td colspan="3"><strong>Total Scheduled Rent</strong></td><td class="num"><strong>{money(p['scheduled_rent'][0] / p['units'])}</strong></td><td class="num"><strong>{money(p['scheduled_rent'][0])}</strong></td><td class="num"><strong>{money(p['scheduled_rent'][1] / p['units'])}</strong></td><td class="num"><strong>{money(p['scheduled_rent'][1])}</strong></td></tr>
<tr><td colspan="3">Additional Income</td><td class="num">-</td><td class="num">{money(p['additional_income'][0])}</td><td class="num">-</td><td class="num">{money(p['additional_income'][1])}</td></tr>
<tr class="summary"><td colspan="3"><strong>Monthly Scheduled Gross Income</strong></td><td class="num">-</td><td class="num"><strong>{money(p['monthly_sgi'][0])}</strong></td><td class="num">-</td><td class="num"><strong>{money(p['monthly_sgi'][1])}</strong></td></tr>
</tbody>
  </table></div>

  <div class="os-two-col">
    <div class="os-left">
      <h3 class="sub-heading">Annualized Operating Data</h3>
      <table><thead><tr><th>&nbsp;</th><th class="num">Current</th><th class="num">Market</th></tr></thead>
      <tbody>{ops}</tbody></table>
    </div>
    <div class="os-right">
      <h3 class="sub-heading">Annualized Expenses</h3>
      <table><thead><tr><th>&nbsp;</th><th class="num">Current</th><th class="num">Pro Forma</th></tr></thead>
      <tbody>{exp}
<tr class="summary"><td><strong>Total Operating Expenses</strong></td><td class="num"><strong>{money(exp_cur)}</strong></td><td class="num"><strong>{money(exp_pf)}</strong></td></tr>
<tr><td>Expense Ratio</td><td class="num">{pct(p['operating']['expense_ratio'][0], 1)}</td><td class="num">{pct(p['operating']['expense_ratio'][1], 1)}</td></tr>
<tr><td>Per Unit</td><td class="num">{money(exp_cur / p['units'])}</td><td class="num">{money(exp_pf / p['units'])}</td></tr>
<tr><td>Per Square Foot</td><td class="num">${exp_cur / p['building_sf']:,.2f}</td><td class="num">${exp_pf / p['building_sf']:,.2f}</td></tr>
</tbody></table>
    </div>
  </div>
  <div class="os-notes">
    <h4>Notes to the Operating Statement</h4>
{notes_html}
    <p class="os-note os-note-foot">Owner-reported figures are unaudited. A buyer should verify all income and expenses in due diligence.</p>
  </div>

  <div class="summary-page">
    <div class="summary-banner">Summary</div>
    <div class="summary-two-col">
      <div class="summary-left">
        <table class="summary-table"><thead><tr><th colspan="2" class="summary-header">Operating Data</th></tr></thead><tbody>{summ}</tbody></table>
      </div>
      <div class="summary-right">
        <table class="summary-table"><thead><tr><th colspan="2" class="summary-header">Proposed Financing</th></tr></thead><tbody>{finrows}</tbody></table>
      </div>
    </div>
{paras(p["valuation_narrative"], "narrative")}
    <div class="price-reveal">
      <div class="summary-trade-range">
        <div class="summary-trade-label">Recommended List Price</div>
        <div class="summary-trade-prices">{money(p['price'])}</div>
      </div>
      <p style="font-size:12px;color:#6B7280;margin-top:10px;">Supported value range: {e(p['value_range'])}</p>
    </div>
    <div class="condition-note"><div class="condition-note-label">Disclosures</div>
{paras(p["disclosures"])}
    </div>
  </div>
</div>
"""


# ---------------------------------------------------------------------------
# portfolio hub
# ---------------------------------------------------------------------------
def portfolio_overview(data, d):
    """Hub landing section. Carries NO price, consistent with reveal-last."""
    pf = data["portfolio"]
    cards = ""
    for p in data["properties"]:
        cards += f"""
    <a class="bio-card" href="{p['slug']}/" style="text-decoration:none;color:inherit;align-items:stretch;">
      <img class="bio-headshot prop-card-img" src="{rel('images/card-' + p['slug'].split('-', 1)[1] + '.jpg', d)}" alt="{e(p['short_name'])}" loading="lazy">
      <div style="display:flex;flex-direction:column;flex:1;">
        <div class="bio-name">{e(p['short_name'])}</div>
        <div class="bio-title">{e(p['city'])}</div>
        <div class="bio-text" style="flex:1;">{p['units']} units &middot; {num(p['building_sf'])} building SF &middot; built {p['year_built']}. {e(p['location_title'])}</div>
        <div style="margin-top:10px;font-size:12px;font-weight:700;color:#C5A258;letter-spacing:1px;text-transform:uppercase;">View the full valuation &#8250;</div>
      </div>
    </a>"""
    stats = [(str(pf["total_units"]), "Total Units"), (str(len(data["properties"])), "Properties"),
             (money(pf["total_current_rent"]), "Current Annual Rent"), (money(pf["total_noi"]), "Current NOI")]
    return f"""
<div class="section section-alt" id="portfolio">
{section_head("Portfolio Overview", data["meta"]["subtitle"])}\
{metrics4(stats)}\
  <div class="inv-text">
    <p>The Brio portfolio comprises two central Southern California apartment properties totaling {pf['total_units']} units. Each asset is valued independently on its own income, its own comparable set, and its own submarket, and each has a dedicated valuation page below.</p>
    <p>The two assets serve different buyer pools. {e(data['properties'][1]['short_name'])} is a central Los Angeles rent-controlled asset with a durable going-in return. {e(data['properties'][0]['short_name'])} is a Pasadena property with a larger unit count and a two-bedroom-weighted mix. Marketed together or separately, both are positioned to clear.</p>
  </div>
  <h3 class="sub-heading">The Properties</h3>
  <div class="bio-grid">{cards}
  </div>
{map_frame(data['meta']['portfolio_map'], "Portfolio Map", d).rstrip()}
</div>
"""
