#!/usr/bin/env python3
"""Regenerate every static map at the exact aspect ratio of its frame.

Why this exists: a map is not a photo. Cropping a photo loses scenery; cropping
a map loses pins, labels and scale. The media-fit audit (audit_media.mjs) found
that a 1280x840 map dropped into a fixed-height band lost about a quarter of
itself on desktop and left 43% dead space in the comp frames. The locked
Camarillo reference has the same defect (71% visible / 46% empty), so this is
not a regression, it is a latent defect being fixed.

The fix is art direction rather than a compromise aspect: each map is rendered
twice, once wide for desktop and once tall for phones, and the page picks with
a <picture> media query. Frames use aspect-ratio so their shape is constant at
every viewport, which means the render can match the frame exactly and nothing
is ever cropped or letterboxed.

Coordinates come from the approved map manifest, all ROOFTOP precision. The API
key is read from the environment or the credentials file and never reaches the
emitted HTML.

Usage:  python make_maps.py [--force]
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
MANIFEST = ROOT / "raw" / "original-assets" / "maps" / "map-manifest.json"
OUT = ROOT / "images"

# Frame shapes. Must match the aspect-ratio values in template/bov.css.
WIDE = (640, 213)   # 3:1  desktop band
TALL = (640, 480)   # 4:3  phone
NAVY, GOLD = "0x1B3A5C", "0xC5A258"


def key():
    k = os.environ.get("GOOGLE_MAPS_SERVER_KEY") or os.environ.get("GOOGLE_MAPS_API_KEY")
    if k:
        return k.strip()
    cred = Path.home() / ".claude" / "scripts" / ".credentials.env"
    for line in cred.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith("GOOGLE_MAPS_SERVER_KEY") and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("GOOGLE_MAPS_SERVER_KEY not found")


def fetch(pins, size, dest, api_key):
    """pins: list of (color, label, lat, lng). No center/zoom, so Google fits them."""
    params = [("size", f"{size[0]}x{size[1]}"), ("scale", "2"), ("maptype", "roadmap"),
              ("format", "png"), ("style", "feature:poi|element:labels|visibility:off")]
    for color, label, lat, lng in pins:
        params.append(("markers", f"color:{color}|label:{label}|{lat},{lng}"))
    qs = "&".join(f"{k}={urllib.parse.quote(str(v), safe=',|:')}" for k, v in params)
    url = f"https://maps.googleapis.com/maps/api/staticmap?{qs}&key={urllib.parse.quote(api_key, safe='')}"
    req = urllib.request.Request(url, headers={"User-Agent": "laaa-bov-build/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if len(data) < 5000:
        raise SystemExit(f"map render too small for {dest.name}, likely an API error")
    dest.write_bytes(data)
    return len(data)


def main():
    api_key = key()
    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))["entries"]

    def sel(prop, cat):
        return [e for e in entries if e["property"] == prop and e["category"] == cat]

    def pins_for(prop, cats):
        out = []
        subj = sel(prop, "subject")[0]
        out.append((GOLD, "S", subj["lat"], subj["lng"]))
        n = 1
        for cat in cats:
            for e in sorted(sel(prop, cat), key=lambda x: x.get("order", 0)):
                out.append((NAVY, str(n), e["lat"], e["lng"]))
                n += 1
        return out

    jobs = []
    # portfolio hub: both subjects only
    subs = [e for e in entries if e["category"] == "subject"]
    jobs.append(("maps-portfolio-subjects",
                 [(GOLD, "A" if i == 0 else "B", e["lat"], e["lng"]) for i, e in enumerate(subs)]))
    for prop in ("359-parke", "1623-menlo"):
        jobs.append((f"maps-{prop}-subject", pins_for(prop, [])))
        if sel(prop, "sold"):
            jobs.append((f"maps-{prop}-sale-comps", pins_for(prop, ["sold"])))
        if sel(prop, "rent"):
            jobs.append((f"maps-{prop}-rent-comps", pins_for(prop, ["rent"])))
        if sel(prop, "active"):
            jobs.append((f"maps-{prop}-active-comps", pins_for(prop, ["active"])))

    total = 0
    for name, pins in jobs:
        w = fetch(pins, WIDE, OUT / f"{name}.png", api_key)
        t = fetch(pins, TALL, OUT / f"{name}-tall.png", api_key)
        total += w + t
        print(f"  {name:34s} {len(pins)} pins   wide {w/1024:5.0f}K   tall {t/1024:5.0f}K")
    print(f"\n{len(jobs)} maps, {len(jobs)*2} renders, {total/1048576:.2f} MB before optimization")

    # palette-quantize: map renders compress hard with no visible loss
    from PIL import Image
    after = 0
    for f in sorted(OUT.glob("maps-*.png")):
        im = Image.open(f).convert("RGB")
        im.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG).save(f, "PNG", optimize=True)
        after += f.stat().st_size
    print(f"after quantization: {after/1048576:.2f} MB")


if __name__ == "__main__":
    main()
