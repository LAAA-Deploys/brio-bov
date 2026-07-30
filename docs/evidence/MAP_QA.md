# Brio Google Maps QA

Reviewed: 2026-07-30T18:10:15.714Z

## Result

- 22 of 22 addresses resolved through the sanctioned `laaa-geo/capabilities/resolveAddress.mjs` workflow.
- 22 markers passed the resolver and visual rooftop/parcel gate.
- Unresolved/non-rooftop markers: 0.
- Every persisted entity includes Google `place_id`, exact Google-standardized address, lat/lng, precision, resolver source, source evidence, review state, and a no-key Google Maps click-through.
- Google Static Maps were downloaded locally for portfolio, subject, sold, active, rent, and per-sale relationship uses. Both subject aerials and building-facing Street View frames were generated with the proven LAAA subject-imagery workflow.

## Visual notes

- Parke sale markers 4 and 5 are too close to read simultaneously at the full-cohort scale; `print/parke-sold-comps-earlham-inset.png` is the required companion inset.
- The portfolio map uses `P` for Parke and `M` for Menlo so the two subject markers are unambiguous.
- 955 S Normandie was checked against the saved MLS exterior; its rooftop massing/red-tile edge matches even though a nearby church POI label appears on the Google base map.
- 456 E Orange Grove is a building-level Rentometer observation with no unit number. Google's exact standardized building rooftop was accepted; no unit-level pin is claimed.

## Runtime note

- A server-restricted Google Maps key was available for sanctioned resolution, Static Maps, aerial, and Street View downloads and was never printed or persisted.
- No authorized browser-restricted JavaScript API key was detected in this run. The site should use these print-safe Google assets plus the manifest click-through links unless a browser-restricted key is injected at runtime.
- Final desktop and 390px placement was included in the completed website-level QA.
