#!/usr/bin/env python3
"""Pull every track-record and marketing figure live. Nothing is hardcoded.

Writes a `stats` block into bov-site.json carrying its own source and timestamp
so a figure can never silently go stale on a client-facing page. The 2026-07-30
build shipped with 23,795 subscribers and a 26.1% open rate copied from another
deal; both were wrong. This exists so that cannot happen again.

Track record is tiered, per Glen 2026-07-30:
  L1  everything LAAA has ever closed
  L2  the asset class of THIS deal
  L3  this property's own market: its submarket if LAAA has depth there,
      otherwise a radius, and the basis is always stated on the page

Marketing comes from Mailchimp. Opens use Mailchimp's own proxy-excluded count
(Apple Mail Privacy and other machine opens removed), not the raw number.

Usage:  python refresh_stats.py
"""
import base64
import json
import math
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent
CRED = Path.home() / ".claude" / "scripts" / ".credentials.env"
AIRTABLE_BASE, CLOSED_DEALS = "appJh9m9A1LzMeI6I", "tblSQs0OQxuGNcEpG"

# Level 3 ladder: try the property's own submarket first, then widen. A claim is
# only made when it clears MIN_SALES, and the basis used is always reported.
MIN_SALES = 5
RADII_MI = [1, 2, 3, 5, 10]


def cred(name):
    for line in CRED.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith(name + "=") :
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit(f"{name} not found in credentials")


def miles(a, b, c, d):
    R, p = 3958.8, math.pi / 180
    return 2 * R * math.asin(math.sqrt(
        math.sin((c - a) * p / 2) ** 2 +
        math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2))


# ---------------------------------------------------------------------------
# Airtable: the closed-deal track record
# ---------------------------------------------------------------------------
def closed_deals():
    key = cred("AIRTABLE_API_KEY")
    fields = ["Property Address", "Deal Stage", "Property Type", "City", "Submarket",
              "Close Price", "Units", "Latitude", "Longitude", "Year Closed", "State"]
    out, offset = [], None
    while True:
        q = [("pageSize", "100")] + [("fields[]", f) for f in fields]
        qs = urllib.parse.urlencode(q) + (f"&offset={offset}" if offset else "")
        req = urllib.request.Request(
            f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{CLOSED_DEALS}?{qs}",
            headers={"Authorization": f"Bearer {key}"})
        d = json.load(urllib.request.urlopen(req, timeout=60))
        out += d.get("records", [])
        offset = d.get("offset")
        if not offset:
            break
    return [r["fields"] for r in out if (r["fields"].get("Deal Stage") or "").lower() == "closed"]


def agg(rows):
    return {"count": len(rows),
            "volume": sum(r.get("Close Price") or 0 for r in rows),
            "units": sum(r.get("Units") or 0 for r in rows)}


def track_record(deals, prop):
    """Three tiers for one property. prop needs lat/lng, optionally submarket."""
    l1 = agg(deals)
    kind = prop.get("asset_class", "Apartments")
    same = [r for r in deals if r.get("Property Type") == kind]
    l2 = agg(same)

    sub = prop.get("submarket")
    l3 = basis = None
    if sub:
        g = [r for r in same if (r.get("Submarket") or "").strip().lower() == sub.strip().lower()]
        if len(g) >= MIN_SALES:
            l3, basis = agg(g), {"type": "submarket", "label": sub}
    if l3 is None and prop.get("lat"):
        geo = [r for r in same if r.get("Latitude")]
        for radius in RADII_MI:
            near = [r for r in geo if miles(prop["lat"], prop["lng"], r["Latitude"], r["Longitude"]) <= radius]
            if len(near) >= MIN_SALES:
                l3, basis = agg(near), {"type": "radius", "label": f"within {radius} miles", "radius_mi": radius}
                break
    return {"all": l1, "asset_class": l2, "asset_class_label": kind, "local": l3, "local_basis": basis}


# ---------------------------------------------------------------------------
# Mailchimp: audience and real engagement
# ---------------------------------------------------------------------------
def mailchimp():
    dc, key, lid = cred("MC_DC"), cred("MC_API_KEY"), cred("MC_LIST_ID")
    hdr = {"Authorization": "Basic " + base64.b64encode(f"anystring:{key}".encode()).decode()}

    def get(path):
        return json.load(urllib.request.urlopen(
            urllib.request.Request(f"https://{dc}.api.mailchimp.com/3.0/{path}", headers=hdr), timeout=60))

    lst = get(f"lists/{lid}")
    segs = {s["name"]: s["member_count"] for s in get(f"lists/{lid}/segments?count=100")["segments"]}

    # Only full-list first sends. Targeted resends to non-openers have very
    # different engagement and would drag the averages down misleadingly.
    camps = get("campaigns?count=40&status=sent&sort_field=send_time&sort_dir=DESC")["campaigns"]
    full = [c for c in camps if (c.get("emails_sent") or 0) >= 18000][:8]
    opens, verified, clickers, prop_clicks, n = [], [], [], [], 0
    for c in full:
        rep = get(f"reports/{c['id']}")
        o, cl = rep["opens"], rep["clicks"]
        opens.append(o["unique_opens"])
        verified.append(o.get("proxy_excluded_unique_opens") or 0)
        clickers.append(cl["unique_subscriber_clicks"])
        try:
            # Clicks that reached a property page. The same page is usually linked
            # twice in one email (hero and button), so unique_clicks must be taken
            # per destination PATH and the best placement used. Summing raw rows
            # double counts the same person and can exceed total clickers.
            urls = get(f"reports/{c['id']}/click-details?count=40").get("urls_clicked", [])
            by_path = {}
            for u in urls:
                path = urllib.parse.urlparse(u["url"]).path.rstrip("/")
                if any(k in path for k in ("/om/", "/listings", "closed-deal-stories")):
                    by_path[path] = max(by_path.get(path, 0), u["unique_clicks"])
            # bounded by the number of distinct people who clicked anything
            prop_clicks.append(min(sum(by_path.values()), cl["unique_subscriber_clicks"]))
        except Exception:
            pass
        n += 1

    mean = lambda xs: int(round(sum(xs) / len(xs))) if xs else 0
    return {
        "subscribers": lst["stats"]["member_count"],
        "brokers": segs.get("Brokers", 0),
        # "Clients" is an INTERNAL segment name and must never be shown that way.
        "principals": segs.get("Clients", 0),
        "developers": segs.get("Developers", 0),
        "campaigns_sent": lst["stats"].get("campaign_count", 0),
        "per_launch": {
            "opens_raw": mean(opens),
            "opens_verified": mean(verified),
            "clickers": mean(clickers),
            "property_page_clicks": mean(prop_clicks),
            "sample_campaigns": n,
        },
    }


def pull():
    """One live fetch. Callers that need the figures BEFORE writing bov-site.json
    (make_data.py builds its headline copy from them) pull once and hand the
    result to main() so the build never hits the APIs twice."""
    return closed_deals(), mailchimp()


_ABBR = {
    "AL": "ALABAMA", "AK": "ALASKA", "AZ": "ARIZONA", "AR": "ARKANSAS", "CA": "CALIFORNIA",
    "CO": "COLORADO", "CT": "CONNECTICUT", "DE": "DELAWARE", "FL": "FLORIDA", "GA": "GEORGIA",
    "HI": "HAWAII", "ID": "IDAHO", "IL": "ILLINOIS", "IN": "INDIANA", "IA": "IOWA",
    "KS": "KANSAS", "KY": "KENTUCKY", "LA": "LOUISIANA", "ME": "MAINE", "MD": "MARYLAND",
    "MA": "MASSACHUSETTS", "MI": "MICHIGAN", "MN": "MINNESOTA", "MS": "MISSISSIPPI",
    "MO": "MISSOURI", "MT": "MONTANA", "NE": "NEBRASKA", "NV": "NEVADA",
    "NH": "NEW HAMPSHIRE", "NJ": "NEW JERSEY", "NM": "NEW MEXICO", "NY": "NEW YORK",
    "NC": "NORTH CAROLINA", "ND": "NORTH DAKOTA", "OH": "OHIO", "OK": "OKLAHOMA",
    "OR": "OREGON", "PA": "PENNSYLVANIA", "RI": "RHODE ISLAND", "SC": "SOUTH CAROLINA",
    "SD": "SOUTH DAKOTA", "TN": "TENNESSEE", "TX": "TEXAS", "UT": "UTAH", "VT": "VERMONT",
    "VA": "VIRGINIA", "WA": "WASHINGTON", "WV": "WEST VIRGINIA", "WI": "WISCONSIN",
    "WY": "WYOMING",
}
_DC = {"DC", "DISTRICT OF COLUMBIA", "WASHINGTON, D.C.", "WASHINGTON DC"}


def _state(raw):
    v = (raw or "").strip().upper()
    return "DC" if v in _DC else _ABBR.get(v, v)


def geography(deals):
    """State spread, so a geographic claim in the copy can never go stale.

    Written after the live page claimed the whole track record sat in three
    California counties while 53 closings were in 20 other states plus DC.

    The normalization is not optional. This table stores the same state both
    ways ("California" and "CA", "Colorado" and "CO"), so counting distinct raw
    values returns 24 when the real answer is 21 states plus DC. A naive count
    would have published an inflated number on a client-facing page.
    """
    norm = [_state(r.get("State")) for r in deals]
    states = {s for s in norm if s and s != "DC"}
    has_dc = "DC" in norm
    outside = [r for r in deals if _state(r.get("State")) not in ("CALIFORNIA", "")]
    label = f"{len(states)} states" + (" and Washington, D.C." if has_dc else "")
    return {"states": len(states), "has_dc": has_dc, "label": label,
            "outside_ca": len(outside),
            "outside_ca_volume": sum(r.get("Close Price") or 0 for r in outside)}


def main(deals=None, mc=None):
    data = json.loads((ROOT / "bov-site.json").read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    if deals is None or mc is None:
        deals, mc = pull()

    for p in data["properties"]:
        subj = {"lat": None, "lng": None, "submarket": p.get("submarket"), "asset_class": "Apartments"}
        for mp in p.get("map_points", []):
            if mp.get("kind") == "subject" and mp.get("lat"):
                subj["lat"], subj["lng"] = mp["lat"], mp["lng"]
        p["track_record"] = track_record(deals, subj)

    data["stats"] = {
        "live": True,
        "generated": now,
        "geography": geography(deals),
        "sources": {
            "track_record": f"Airtable {AIRTABLE_BASE}/{CLOSED_DEALS}, Deal Stage=closed",
            "marketing": "Mailchimp API, full-list sends only; opens are proxy-excluded",
        },
        "marketing": mc,
        "portfolio_track_record": track_record(deals, {"asset_class": "Apartments"}),
    }
    (ROOT / "bov-site.json").write_text(json.dumps(data, indent=2), encoding="utf-8")

    print(f"stats refreshed {now}\n")
    tr = data["stats"]["portfolio_track_record"]
    print(f"  L1 all closings     {tr['all']['count']:>4}  ${tr['all']['volume']:>14,.0f}  {tr['all']['units']:>5,} units")
    print(f"  L2 apartments       {tr['asset_class']['count']:>4}  ${tr['asset_class']['volume']:>14,.0f}  {tr['asset_class']['units']:>5,} units")
    for p in data["properties"]:
        t = p["track_record"]
        b = t["local_basis"]
        if t["local"]:
            print(f"  L3 {p['slug']:12s} {t['local']['count']:>4}  ${t['local']['volume']:>14,.0f}  "
                  f"{t['local']['units']:>5,} units   [{b['type']}: {b['label']}]")
        else:
            print(f"  L3 {p['slug']:12s}  none above the {MIN_SALES}-sale floor")
    m = mc["per_launch"]
    print(f"\n  audience   {mc['subscribers']:,} total | {mc['brokers']:,} brokers | "
          f"{mc['principals']:,} principals | {mc['developers']:,} developers")
    print(f"  per launch {m['opens_verified']:,} verified opens ({m['opens_raw']:,} raw) | "
          f"{m['clickers']:,} clickers | {m['property_page_clicks']:,} to a property page"
          f"   [{m['sample_campaigns']} campaigns]")


if __name__ == "__main__":
    main()
