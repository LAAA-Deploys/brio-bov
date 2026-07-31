#!/usr/bin/env python3
"""Build the portfolio hub hero: both buildings, not one.

The hub cover shipped as a single photo of 359 Parke, which reads as an
oversight on a two-property portfolio.

Built from the two facade photos. The aerials were tried first because they are
higher resolution (1280x800 against Parke's 640x427), and rejected: two
straight-down satellite views side by side read as a map rather than a cover,
carry duplicated "Imagery (c) Airbus, Maxar" attribution across the seam, and
the Menlo frame is dominated by a neighbouring car lot. A slightly soft facade
is worth more than a sharp parcel map on a cover.

Parke's whole photo set is 640x427, so the output is deliberately sized to keep
that upscale under 2x rather than filling a larger canvas with mush. If a
higher-resolution Parke exterior is ever sourced, raise WIDE/TALL here.

Two outputs, because a 50/50 side-by-side is the worst possible thing to
center-crop on a phone: the crop lands exactly on the seam. The wide file is
for desktop and the stacked file for narrow viewports, selected by media query
in bov.css.

Never hand-edit the output. Change the inputs here and re-run.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
IMAGES = ROOT / "images"
GOLD = (197, 162, 88)          # #C5A258, the locked accent
RULE = 6                       # divider thickness, enough to read as deliberate

PANELS = [IMAGES / "subjects-parke-parke-hero.jpg",
          IMAGES / "subjects-menlo-menlo-hero.jpg"]
WIDE = (1920, 800)             # panel 957x800 from 640x427 = 1.87x upscale
TALL = (1100, 1400)            # panel 1100x697 from 640x427 = 1.72x upscale


def fill(path, w, h):
    """Center-crop to the target aspect, then resize. Never distorts."""
    im = Image.open(path).convert("RGB")
    sw, sh = im.size
    if sw / sh > w / h:
        new = int(sh * w / h)
        im = im.crop(((sw - new) // 2, 0, (sw + new) // 2, sh))
    else:
        new = int(sw * h / w)
        im = im.crop((0, (sh - new) // 2, sw, (sh + new) // 2))
    return im.resize((w, h), Image.LANCZOS)


def build(out, size, horizontal, quality):
    w, h = size
    canvas = Image.new("RGB", size, GOLD)
    if horizontal:
        pw = (w - RULE) // 2
        canvas.paste(fill(PANELS[0], pw, h), (0, 0))
        canvas.paste(fill(PANELS[1], w - pw - RULE, h), (pw + RULE, 0))
    else:
        ph = (h - RULE) // 2
        canvas.paste(fill(PANELS[0], w, ph), (0, 0))
        canvas.paste(fill(PANELS[1], w, h - ph - RULE), (0, ph + RULE))
    canvas.save(out, quality=quality, optimize=True)
    print(f"  {out.name:36} {w}x{h}  {out.stat().st_size // 1024:,} KB")


if __name__ == "__main__":
    # The cover renders under filter: brightness(0.45), so compression artifacts
    # are invisible here in a way they would not be on a gallery photo. Mobile
    # gets the tighter setting because it pays the most for the bytes.
    print("portfolio hub hero:")
    build(IMAGES / "portfolio-hero-split.jpg", WIDE, True, 80)
    build(IMAGES / "portfolio-hero-split-tall.jpg", TALL, False, 74)
