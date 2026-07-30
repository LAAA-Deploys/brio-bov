#!/usr/bin/env python3
"""Build bov-site.json for the Brio portfolio from two sources.

1. The approved Brio analysis (narratives, comps, photos, rooftop coordinates)
   extracted from the retired React app's src/data/portfolio.ts.
2. The LAAA setup sheets dated 2026-07-30, which are the pricing authority
   (Glen, 2026-07-30) and also resolve the unit mix the earlier build could
   not confirm.

Run once to regenerate bov-site.json. The generator (build_site.py) never
reads anything but bov-site.json.
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent
RAW = json.loads((ROOT / "raw" / "brio-raw.json").read_text(encoding="utf-8"))

# ---------------------------------------------------------------------------
# Setup sheets, transcribed verbatim from the two PDFs. Pricing authority.
#   1623 Menlo Avenue - Setup Sheet.pdf
#   359 Parke Street - Setup Sheet - REVIEW.pdf
# ---------------------------------------------------------------------------
SETUP = {
    "1623-menlo": {
        "price": 2200000,
        "down_payment_pct": 29, "down_payment": 639844,
        "units": 8, "price_per_unit": 275000,
        "grm_current": 9.90, "grm_market": 8.96,
        "cap_current": 6.55, "cap_market": 7.58,
        "year_built": 1979,
        "lot_sf": 7405, "lot_acres": 0.17,
        "building_sf": 5170, "price_per_sf": 425.53,
        "operating": {
            "sgi":       (223620, 246960),
            "vacancy":   (6665, 7366), "vacancy_pct": 3.0,
            "goi":       (216955, 239594),
            "expenses":  (72862, 72862), "expense_ratio": (32.6, 29.5),
            "noi":       (144092, 166732),
            "loan_payments": (-115274, -115274),
            "pretax_cf": (28818, 51458), "pretax_cf_pct": (4.50, 8.04),
            "principal_reduction": (18282, 18282),
            "total_return": (47100, 69740), "total_return_pct": (7.36, 10.90),
        },
        "financing": {"loan_amount": 1560156, "rate": 6.25, "amortization": 30, "dcr": 1.25},
        "unit_mix": [
            {"count": 7, "type": "1 + 1", "sf": 625, "rent_current": 2232, "monthly_current": 15627,
             "rent_market": 2495, "monthly_market": 17465},
            {"count": 1, "type": "2 + 1", "sf": 800, "rent_current": 2888, "monthly_current": 2888,
             "rent_market": 2995, "monthly_market": 2995},
        ],
        "scheduled_rent": (18515, 20460),
        "additional_income": (120, 120),
        "monthly_sgi": (18635, 20580),
        "expense_lines": [
            ("Property Tax", 27352), ("Insurance", 6463), ("Utilities", 16400), ("Trash", 0),
            ("Repairs & Maintenance", 6000), ("Contracts", 3000), ("General & Admin", 1200),
            ("Reserves", 1600), ("Management", 10848),
        ],
        "expense_total": 72862, "expense_per_sf": 14.09, "expense_per_unit": 9107.79,
        "highlights": [
            "Eight units built in 1979",
            "$18,515 monthly scheduled rent",
            "Gated access with on-site parking",
            "TOC Tier 4 near central L.A. transit",
        ],
    },
    "359-parke": {
        "price": 2500000,
        "down_payment_pct": 32, "down_payment": 797649,
        "units": 10, "price_per_unit": 250000,
        "grm_current": 10.27, "grm_market": 9.08,
        "cap_current": 6.29, "cap_market": 7.53,
        "year_built": 1957,
        "lot_sf": 11326, "lot_acres": 0.26,
        "building_sf": 7196, "price_per_sf": 347.42,
        "operating": {
            "sgi":       (245292, 277200),
            "vacancy":   (7305, 8262), "vacancy_pct": 3.0,
            "goi":       (237987, 268938),
            "expenses":  (80762, 80762), "expense_ratio": (32.9, 29.1),
            "noi":       (157225, 188176),
            "loan_payments": (-125780, -125780),
            "pretax_cf": (31445, 62396), "pretax_cf_pct": (3.94, 7.82),
            "principal_reduction": (19948, 19948),
            "total_return": (51393, 82344), "total_return_pct": (6.44, 10.32),
        },
        "financing": {"loan_amount": 1702351, "rate": 6.25, "amortization": 30, "dcr": 1.25},
        "unit_mix": [
            {"count": 5, "type": "1 + 1", "sf": 650, "rent_current": 1840, "monthly_current": 9200,
             "rent_market": 2095, "monthly_market": 10475},
            {"count": 5, "type": "2 + 1", "sf": 775, "rent_current": 2218, "monthly_current": 11091,
             "rent_market": 2495, "monthly_market": 12475},
        ],
        "scheduled_rent": (20291, 22950),
        "additional_income": (150, 150),
        "monthly_sgi": (20441, 23100),
        "expense_lines": [
            ("Property Tax", 30668), ("Insurance", 8995), ("Utilities", 15200), ("Trash", 0),
            ("Repairs & Maintenance", 7500), ("Contracts", 3000), ("General & Admin", 1500),
            ("Reserves", 2000), ("Management", 11899),
        ],
        "expense_total": 80762, "expense_per_sf": 11.22, "expense_per_unit": 8076.22,
        "highlights": [
            "Ten units: five 1BRs and five 2BRs",
            "$20,291 monthly scheduled rent",
            "Fourteen reported parking spaces",
            "Separate gas and electric meters",
        ],
    },
}

# The approved value range from the prior analysis. Both setup-sheet prices sit
# at the top of their approved range, so no new range is invented here.
VALUE_RANGE = {"1623-menlo": "$2,000,000 to $2,200,000", "359-parke": "$2,350,000 to $2,500,000"}

SLUG_TO_RAW = {"1623-menlo": "menlo", "359-parke": "parke"}

# Copy overrides. The retired build hedged on the Menlo unit mix because the
# seller rent roll did not state it. The 2026-07-30 setup sheet resolves it
# (seven 1+1 at ~625 SF, one 2+1 at ~800 SF), so the defensive wording is now
# both stale and off-standard. Overrides are recorded here, not edited into the
# template, so the change stays traceable.
#
# The valuation and market narratives were written against the retired $2.10M /
# $2.45M pricing and are arithmetically wrong at the setup-sheet prices. They are
# rewritten here to the current figures. The market_narrative paragraphs also
# stated the SUBJECT's per-unit and cap rate inside the Sale Comps section, which
# is before the valuation reveal, so those are restated qualitatively.
COPY_OVERRIDES = {
    "359-parke": {
        "valuationNarrative": {
            0: "The income approach supports value through a normalized current net operating income of $157,225. At $2,500,000 the implied going-in cap rate is 6.29% and the current gross rent multiplier is 10.27. On the market rent schedule the same basis produces a 7.53% cap rate and a 9.08 multiplier.",
            1: "The sales comparison approach supports $250,000 per unit and approximately $347 per square foot. These metrics fall within the supplied Pasadena evidence and align with the subject's income profile, scale, and vintage.",
            2: "We therefore recommend a list price of $2,500,000, at the upper end of the supported range of $2,350,000 to $2,500,000, subject to inspection, lease review, and confirmation of operating expenses.",
        },
        "marketNarrative": {
            1: "The subject is positioned near the center of the observed physical metrics on both a per-unit and a per-square-foot basis. Its current income yield sits near the upper end of the supported range, which helps offset the property's older vintage.",
        },
    },
    "1623-menlo": {
        "valuationNarrative": {
            0: "The income approach supports value through a normalized current net operating income of $144,092. At $2,200,000 the implied going-in cap rate is 6.55% and the current gross rent multiplier is 9.90. On the market rent schedule the same basis produces a 7.58% cap rate and an 8.96 multiplier.",
            1: "The sales comparison approach supports $275,000 per unit and approximately $426 per square foot. These metrics fit within the supplied closed and active evidence, with the higher price per square foot supported by the nearby Dewey closing and the stronger current yield.",
            2: "We therefore recommend a list price of $2,200,000, at the upper end of the supported range of $2,000,000 to $2,200,000, subject to inspection, lease review, and confirmation of legal unit configuration.",
        },
        "marketNarrative": {
            1: "On a per-unit basis the subject sits above the larger closed sale and below both active asking levels. On a per-square-foot basis it aligns closely with the smaller nearby Dewey closing. Its current income yield is stronger than the supported closed-sale metrics, which is the core of the pricing argument.",
        },
        "overview": {
            1: "The current rent roll, normalized operating statement, two closed sales, two active competitors, and nearby asking rents establish the property's income and market position. The unit mix is seven one-bedroom units of approximately 625 SF and one two-bedroom unit of approximately 800 SF."
        },
        "positioningNarrative": {
            0: "The recommended value is anchored on the subject's current income and its competitive going-in return, supported by a documented unit mix and the rents the property achieves today.",
            1: "The result balances the nearby Dewey physical comparison against the lower per-unit signal from the larger Ardmore sale, with the current active listings framing the upper end of the range.",
        },
    },
}

# Map budget: one portfolio map, and per property subject/location, sale comps,
# rent comps, optional active comps. Per-comp maps are deliberately dropped.
MAPS = {
    "1623-menlo": {"subject": "maps/1623-menlo-subject.png", "sale": "maps/1623-menlo-sale-comps.png",
                   "rent": "maps/1623-menlo-rent-comps.png", "active": "maps/1623-menlo-active-comps.png"},
    "359-parke":  {"subject": "maps/359-parke-subject.png", "sale": "maps/359-parke-sale-comps.png",
                   "rent": "maps/359-parke-rent-comps.png", "active": None},
}

# Track record pulled live from Airtable LAAA Closed Deals (tblSQs0OQxuGNcEpG)
# on 2026-07-30: 487 records at stage "closed", $1,548,928,900 volume, 4,684 units.
# Displayed figures are rounded DOWN from the live pull so they stay defensible.
# PENDING GLEN'S CONFIRMATION before send (global hard rule 4).
TRACK_RECORD = {
    "source": "Airtable LAAA Closed Deals tblSQs0OQxuGNcEpG",
    "pulled": "2026-07-30",
    "raw": {"closed": 487, "volume": 1548928900, "units": 4684},
    "metrics": [
        ("485+", "Closed Transactions"),
        ("$1.5B+", "Total Sales Volume"),
        ("4,600+", "Units Sold"),
        ("#1", "Most Active · LA County"),
    ],
    "narrative": [
        "Since 2013, the LAAA Team has closed more than 485 multifamily transactions totaling over $1.5B in volume across Los Angeles, Ventura, and Santa Barbara counties, with particular depth in rent-controlled vintage apartment product.",
        "Our practice is built on disciplined underwriting, the deepest comparable-sales dataset in the submarket, and a marketing engine that reaches every active multifamily buyer in Los Angeles. We advise owners on when and how to sell, not just whether, and we price to clear rather than to languish.",
        "For the Brio portfolio, that means an evidence-based opinion of value on each asset independently, anchored in recent Pico Union and Pasadena apartment sales, presented with the same rigor we would bring to defending the price against a buyer's due-diligence challenge.",
    ],
    "achievements": [
        ("Chairman's Club", "Marcus & Millichap's top-tier annual honor"),
        ("National Achievement Award", "multiple years, both partners"),
        ("#1 Most Active Multifamily Team in LA County", "CoStar 2019-2021"),
        ("Sales Recognition Award", "every year since 2016"),
        ("40+ transactions per year", "one of SoCal's most active groups"),
    ],
    "press": ["BISNOW", "YAHOO FINANCE", "CONNECT CRE", "SFVBJ", "THE PINNACLE LIST"],
}

MARKETING = {
    "metrics": [
        ("23,795+", "Email Subscribers"),
        ("26.1%", "Avg Open Rate"),
        ("7 Days", "To Full Market Reach"),
        ("40+", "Transactions Per Year"),
    ],
    "channels": [
        ("Proprietary buyer database", "23,795+ active multifamily investors, segmented by product type, submarket, and check size"),
        ("Marcus & Millichap national platform", "the largest private-capital investment brokerage network in the country"),
        ("Direct outreach", "targeted calls to the owners and exchange buyers most likely to trade into this product"),
        ("Full digital syndication", "LoopNet, CoStar, Crexi, MLS, and the LAAA listing platform at laaa.com"),
        ("Dedicated property websites", "every listing gets its own site, so the offering is never a PDF attachment"),
    ],
    "narrative": [
        "A portfolio of this size draws two distinct buyer pools: private central-Los Angeles operators for Menlo, and Pasadena-focused investors for Parke. We market each asset to its own pool while keeping the portfolio available to a single buyer who wants both.",
    ],
}

BIOS = {
    "Glen Scher": "Co-founder of the LAAA Team and one of the most active multifamily brokers in Los Angeles, with 485+ transactions and $1.5B+ in closed sales. Glen has advised owners across central Los Angeles and the San Gabriel Valley since 2014, with deep transaction history in the rent-controlled vintage apartment product that defines both assets in this portfolio.",
    "Filip Niculete": "Co-founder of the LAAA Team and one of Southern California's top multifamily brokers. Since 2011, Filip has built a reputation for execution, integrity, and relentless work ethic, helping lead the team to $1.5B+ in closed transactions while consistently leading the market in active inventory.",
}

TEAM = [
    ("Aida Memary Scher", "Associate Director", "Aida_Memary_Scher.png"),
    ("Luka Leader", "Associate Investments", "Luka_Leader.png"),
    ("Morgan Wetmore", "Associate Investments", "Morgan_Wetmore.png"),
    ("Logan Ward", "Associate Investments", "Logan_Ward.png"),
    ("Alexandro Tapia", "Associate Investments", "Alexandro_Tapia.png"),
    ("Blake Lewitt", "Associate Investments", "Blake_Lewitt.png"),
    ("Mike Palade", "Agent Assistant", "Mike_Palade.png"),
    ("Tony H. Dang", "Business Operations Manager", "Tony_Dang.png"),
    ("Tirajeh Vossoughi-Horton", "Intern", "Tirajeh_Vossoughi-Horton.png"),
]


def asset(p):
    """Rewrite a /assets/... path from the retired app to the flat images/ tree."""
    return "images/" + p.replace("/assets/", "").replace("/", "-") if p else None


def build_property(slug):
    raw = dict(RAW[SLUG_TO_RAW[slug]])
    s = SETUP[slug]
    op = s["operating"]

    for field, repl in COPY_OVERRIDES.get(slug, {}).items():
        lines = list(raw[field])
        for idx, text in repl.items():
            lines[idx] = text
        raw[field] = lines

    def comp(c):
        return {
            "address": c["address"], "status": c["status"], "price": c["price"], "units": c["units"],
            "year_built": c["yearBuilt"], "building_sf": c["buildingSquareFeet"],
            "lot_sf": c["lotSquareFeet"], "date": c["date"], "days_on_market": c["daysOnMarket"],
            "price_per_unit": c["pricePerUnit"], "price_per_sf": c["pricePerSquareFoot"],
            "grm": c.get("grm"), "cap_rate": c.get("capRate"), "image": asset(c["image"]),
            "summary": c["summary"], "relevance": c["relevance"], "considerations": c["considerations"],
        }

    return {
        "slug": slug,
        "short_name": raw["shortName"],
        "address": raw["address"],
        "city": raw["city"],
        # Menlo: the retired build used menlo-online-exterior.jpg, a flat wall shot.
        # menlo-hero.jpg is the professional listing exterior, cropped tighter on
        # the building. Parke keeps its approved hero.
        "hero": ("images/subjects-menlo-menlo-hero.jpg" if slug == "1623-menlo"
                 else asset(raw["hero"])),
        "gallery": [{"src": asset(g["src"]), "alt": g["alt"]} for g in raw["gallery"]],
        "apn": raw["apn"],
        "parking": raw["parking"],
        "location_title": raw["locationTitle"],

        "price": s["price"],
        "value_range": VALUE_RANGE[slug],
        "units": s["units"], "year_built": s["year_built"],
        "building_sf": s["building_sf"], "lot_sf": s["lot_sf"], "lot_acres": s["lot_acres"],
        "price_per_unit": s["price_per_unit"], "price_per_sf": s["price_per_sf"],
        "grm_current": s["grm_current"], "grm_market": s["grm_market"],
        "cap_current": s["cap_current"], "cap_market": s["cap_market"],
        "noi_current": op["noi"][0], "noi_market": op["noi"][1],
        "operating": op,
        "financing": s["financing"],
        "unit_mix": s["unit_mix"],
        "scheduled_rent": s["scheduled_rent"],
        "additional_income": s["additional_income"],
        "monthly_sgi": s["monthly_sgi"],
        "expense_lines": s["expense_lines"],
        "expense_total": s["expense_total"],
        "expense_per_sf": s["expense_per_sf"],
        "expense_per_unit": s["expense_per_unit"],
        "highlights": s["highlights"],

        "overview": raw["overview"],
        "location_narrative": raw["locationNarrative"],
        "physical_narrative": raw["physicalNarrative"],
        "rent_narrative": raw["rentNarrative"],
        "market_narrative": raw["marketNarrative"],
        "positioning_narrative": raw["positioningNarrative"],
        "valuation_narrative": raw["valuationNarrative"],
        "buyer_profiles": [{"title": b["title"], "copy": b["copy"]} for b in raw["buyerProfiles"]],
        "strategy": [{"title": b["title"], "copy": b["copy"]} for b in raw["strategy"]],
        "disclosures": raw["disclosures"],
        "rent_comps": [{"address": r["address"], "unit_type": r["unitType"], "rent": r["rent"],
                        "square_feet": r.get("squareFeet"), "distance": r["distance"],
                        "image": asset(r.get("image"))} for r in raw["rentComps"]],
        "sale_comps": [comp(c) for c in raw["saleComps"]],
        "active_comps": [comp(c) for c in (raw.get("activeComps") or [])],
        "map_points": raw["mapPoints"],
        "maps": {k: (asset("/assets/" + v) if v else None) for k, v in MAPS[slug].items()},
    }


def main():
    props = [build_property("359-parke"), build_property("1623-menlo")]
    total_units = sum(p["units"] for p in props)
    combined = sum(p["price"] for p in props)

    data = {
        "schema_version": 1,
        "document_type": "bov",
        "site_mode": "portfolio",
        "meta": {
            "domain": "brio.laaa.com",
            "client": RAW["portfolio"]["client"],
            "title": "Brio Real Estate Portfolio",
            "subtitle": "Two-Property Multifamily Portfolio",
            "month_year": "July 2026",
            "hero": props[0]["hero"],
            "portfolio_map": "images/maps-portfolio-subjects.png",
        },
        "portfolio": {
            "combined_value": combined,
            "total_units": total_units,
            "total_current_rent": sum(p["scheduled_rent"][0] * 12 for p in props),
            "total_noi": sum(p["noi_current"] for p in props),
        },
        "track_record": TRACK_RECORD,
        "marketing": MARKETING,
        "team": {
            "leads": [
                {"name": "Glen Scher", "title": "Senior Managing Director Investments",
                 "phone": "(818) 212-2808", "tel": "8182122808",
                 "email": "Glen.Scher@marcusmillichap.com", "license": "CA License: 01962976",
                 "headshot": "images/team-Glen_Scher.png", "bio": BIOS["Glen Scher"]},
                {"name": "Filip Niculete", "title": "Senior Managing Director Investments",
                 "phone": "(818) 212-2748", "tel": "8182122748",
                 "email": "Filip.Niculete@marcusmillichap.com", "license": "CA License: 01905352",
                 "headshot": "images/team-Filip_Niculete.png", "bio": BIOS["Filip Niculete"]},
            ],
            "grid": [{"name": n, "title": t, "headshot": "images/team-" + f} for n, t, f in TEAM],
        },
        "properties": props,
    }
    # Self-heal image references. The optimizer re-encodes photos and headshots
    # from PNG to JPEG; point the data at whatever file actually exists so a
    # reference can never go stale.
    fixed = []

    def heal(o):
        if isinstance(o, dict):
            return {k: heal(v) for k, v in o.items()}
        if isinstance(o, list):
            return [heal(v) for v in o]
        if isinstance(o, str) and o.startswith("images/") and not (ROOT / o).exists():
            for ext in (".jpg", ".png", ".webp"):
                alt = str(Path(o).with_suffix(ext)).replace("\\", "/")
                if (ROOT / alt).exists():
                    fixed.append((o, alt))
                    return alt
        return o

    data = heal(data)
    if fixed:
        print(f"  healed {len(fixed)} image refs (e.g. {fixed[0][0]} -> {fixed[0][1]})")
    missing = []

    def check(o):
        if isinstance(o, dict):
            [check(v) for v in o.values()]
        elif isinstance(o, list):
            [check(v) for v in o]
        elif isinstance(o, str) and o.startswith("images/") and not (ROOT / o).exists():
            missing.append(o)

    check(data)
    if missing:
        raise SystemExit(f"MISSING IMAGE ASSETS: {missing}")

    out = ROOT / "bov-site.json"
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size:,} bytes)")
    print(f"  portfolio: ${combined:,} across {total_units} units")
    for p in props:
        print(f"  {p['slug']:12s} ${p['price']:,}  {p['units']}u  "
              f"${p['price_per_unit']:,}/unit  ${p['price_per_sf']:.2f}/SF  "
              f"cap {p['cap_current']}%  GRM {p['grm_current']}")


if __name__ == "__main__":
    main()
