# Brio Portfolio BOV — Official Regulatory, Location, and Active-Listing Verification

Access date for all live sources: **July 30, 2026**

Scope: one bounded gap-closing pass for 359 Parke Street and 1623 South Menlo Avenue. This file does not revisit value, underwriting, rent or sale comp selection, or the locked property-specific comp sets.

## Decision summary

- **359 Parke Street:** The City of Pasadena's current zoning layer identifies the parcel location as **RM-12, Low-Medium Density Residential**. The stale `PSR1` value carried in assessor-derived material should not appear as current zoning. A 1957 ten-unit property appears to fall within the City's generally covered pre-February 1, 1995 multifamily class for rent stabilization, absent a documented exemption. The public rental-registry portal returned no result under either the street address or APN; that search result is not enough to label the property unregistered or noncompliant. No match appeared in the City's active-building-permit or open/pending code-compliance map layers. A full historical permit record and Certificate of Occupancy were not retrievable from the public Permit Center portal.
- **1623 South Menlo Avenue:** Live ZIMAS identifies **RD1.5-1 zoning**, **Low Medium II Residential** land use, **RSO: No**, **JCO: Yes**, and **Ellis Act Property: No**. LADBS returned two finaled electrical permits, including a 1999 permit whose description references smoke alarms for eight residential units, and zero code-enforcement items. No original Certificate of Occupancy was displayed. The permit description corroborates historical eight-unit occupancy but does not establish the current legal unit mix, bedroom/bath mix, or present CofO status.
- **Menlo active competition:** Public IDX pages still showed 1056 Dewey Avenue and 955 South Normandie Avenue active at the supplied asking prices on July 30. The July 29 supplied MLS export remains the freshest source for days on market and should control where public sites differ.
- **Location positioning:** Parke's defensible distinguishing feature is direct frontage at Villa Parke, with central-Pasadena and A Line access as broader context. Menlo should be presented as a Pico-Union/South Los Angeles infill location near major transit corridors—not as prime Koreatown. ZIMAS itself supplies the strongest transit facts: TOC Tier 4, within one-half mile of a Major Transit Stop and High Quality Transit Corridor.

## 359 Parke Street, Pasadena

### Verified facts

| ID | Verified fact | Client-facing use |
|---|---|---|
| P-01 | Subject identifiers used in this pass: **359 Parke Street, Pasadena, CA 91101; APN 5725-029-018**. Property coordinates supplied in the Brio source packet: **34.157070, -118.143151**. | Internal source control and map query only. |
| P-02 | The current City of Pasadena zoning feature intersecting the supplied subject coordinate returns **ZONE_CODE RM-12**, **GEN_CODE Multi-Family Residential**, **GEN_PLAN LMDR**, and **GEN_PLAN_DESC Low-Medium Density Residential**. No overlay code or description was returned. | “The property is mapped RM-12 within Pasadena's Low-Medium Density Residential land-use framework.” Add the usual zoning-verification disclosure. |
| P-03 | The official zoning map item was updated July 2, 2026 and states it is current through Ordinance 7472, adopted June 25, 2026. The City also states the online map is for reference and directs users to Current Planning for legal verification. | Use RM-12 as the current official-map fact; do not state development capacity or entitlement conclusions without parcel-specific planning confirmation. |
| P-04 | Pasadena's landlord FAQ says most multi-unit rental properties built before February 1, 1995 are subject to rent control, subject to listed exemptions. The supplied source record describes Parke as a 1957 ten-unit apartment property, and this pass found no official exemption evidence. | Treat the property as **apparently within the generally covered class**, not as exempt. Avoid a definitive legal conclusion about unit-by-unit coverage. |
| P-05 | Pasadena requires annual registration of covered rental units. The City's public portal states that members of the public may search property information without an account. Searches for `359 Parke Street` and `5725-029-018` each returned “It seems we can't find what you're looking for.” | State only that **no public registry result was found by address or APN**. Do not convert a search miss into “unregistered,” “noncompliant,” or “exempt.” |
| P-06 | The City's current Annual General Adjustment is **2.25%**, effective October 1, 2025 through September 30, 2026. The City says an increase is limited to once in a 12-month period, unused adjustments cannot be banked, and registration/fee/compliance requirements must be satisfied before an increase. | Appropriate for a restrained regulatory note; do not apply the AGA to the underwriting or claim increase eligibility without unit-level records. |
| P-07 | A query for address text containing `359` and `PARKE` returned **zero matches** in the City's active-building-permit layer. A parallel query returned **zero matches** in the City's open/pending code-compliance layer. | “No subject-address match appeared in the City's active-permit or open-code map layers as of July 30, 2026.” Do not call this a clean historical record. |
| P-08 | The City's full Permit Center / EnerGov search portal remained behind a Cloudflare verification screen in the interactive browser and returned HTTP 403 to a direct request. No historical permit set or Certificate of Occupancy could be retrieved. | Keep CofO, legal unit count, and full permit/code history in seller diligence. |
| P-09 | FEMA's National Flood Hazard Layer returned **Zone X — Area of Minimal Flood Hazard**, `SFHA_TF = F`, at the supplied subject point. The state liquefaction Zone of Required Investigation layer returned no intersecting feature at that point. | If used at all, state as a preliminary map-screening result, not a substitute for the Natural Hazard Disclosure or parcel-level professional review. |

### Defensible location drivers

- **Direct park frontage is the clearest block-level differentiator.** The City locates the Villa Parke athletic field at Parke Street and Garfield Avenue, adjacent to the Villa Parke Community Center at 363 East Villa Street. The subject fronts Parke Street at this park edge.
- **The amenity is substantial and verifiable.** The City lists a gymnasium, fitness center, boxing gym, library, computer lab, playground, basketball courts, swimming pool, meeting facilities, community programming, and the City's largest youth soccer program at Villa Parke.
- **Central Pasadena access is supportable but should not be inflated.** Metro identifies Memorial Park as an A Line station and City material identifies Old Pasadena as the City's original business district. Use “access to” or “near central Pasadena,” not “in Old Pasadena.”
- **Tradeoff to acknowledge internally:** direct frontage at an active community park can add open-space visibility and tenant convenience while also bringing scheduled recreation activity, pedestrian traffic, event noise, and parking pressure. The BOV can sell the frontage without promising quiet.
- **Location-grade inputs:** strong civic/recreation amenity adjacency; good central-Pasadena/transit context; ordinary multifamily residential block rather than a trophy residential enclave; park activity is both amenity and externality. Do not use a walk score, crime superlative, school claim, or “prime Pasadena” label without a separately verified source.

### Recommended copy-safe language

> 359 Parke occupies a distinctive park-edge position in central Pasadena, directly across from Villa Parke's recreation fields and community facilities. The setting combines neighborhood-scale multifamily housing with convenient access to Pasadena's employment, retail, and transit network.

> The City of Pasadena's current zoning map identifies the site as RM-12 within a Low-Medium Density Residential designation. Pasadena's rent-stabilization rules generally cover multifamily rentals built before February 1, 1995; final unit-level coverage, registration, lawful base rents, and increase eligibility should be confirmed through the Rent Stabilization Department and seller records.

### Unresolved diligence items

- Property- and unit-specific Pasadena rental registration status.
- Documentary evidence of any exemption from rent stabilization or just-cause rules.
- Lawful base rent and adjustment history for each unit.
- Original and current Certificates of Occupancy.
- Current legal unit count and unit mix as established by City records.
- Complete historical building, planning, fire, and code-compliance records.
- Any open item not surfaced by the City's public active/open map layers.

## 1623 South Menlo Avenue, Los Angeles

### Verified facts

| ID | Verified fact | Client-facing use |
|---|---|---|
| M-01 | Live ZIMAS returned **1623 1-8 S MENLO AVE, Los Angeles, CA 90006**, PIN **126B197 241**, APN **5056-022-005**, Vermont Avenue Tract, Block 1, Lot 30, and a calculated parcel area of **7,300 square feet**. | Address, parcel identity, and site-size context. Treat calculated area as approximate. |
| M-02 | ZIMAS identifies **RD1.5-1** zoning and **Low Medium II Residential** General Plan land use. It shows no Specific Plan, Historic Preservation Review, CDO, CPIO, RIO, HCR, NSO, or Sign District. | “The parcel is mapped RD1.5-1 with Low Medium II Residential land use.” Avoid claiming by-right development yield. |
| M-03 | ZIMAS identifies the Neighborhood as **Pico-Union**, Community Plan Area as **South Los Angeles**, Area Planning Commission as **South Los Angeles**, Neighborhood Council as **Pico Union**, Council District 1, and LADBS district as Los Angeles Metro. | Use Pico-Union as the neighborhood label and South Los Angeles as the formal community-plan context. |
| M-04 | ZIMAS returns **RSO: No [APN 5056022005]**, **Ellis Act Property: No**, and **JCO: Yes**. | Exact regulatory positioning: “ZIMAS identifies the property as not subject to RSO and subject to JCO.” Add an as-of date. |
| M-05 | ZIMAS returns year built **1979** and use code **0500 — Residential — Five or More Units or Apartments (Any Combination) — 4 Stories or Less**. | Building-era and broad multifamily-use context only; the use code does not establish the exact legal unit mix. |
| M-06 | ZIMAS returns **TOC Tier 4**, **TOIA 3**, `AB 2097 Within 1/2 Mile of a Major Transit Stop: Yes`, and `High Quality Transit Corridor Within 1/2 Mile: Yes`. It also returns `AB 2334 Very Low Vehicle Travel Area: Yes`. | Strong, exact, official transit-access facts. Do not turn them into an entitlement or redevelopment promise. |
| M-07 | ZIMAS reports `500 Ft School Zone: None` and `500 Ft Park Zone: None`. | Useful internal block context; no need to feature in marketing copy. |
| M-08 | The ZIMAS-to-LADBS public property-activity page displayed two finaled electrical permits for 1623 South Menlo: permit **99041-70000-15909**, finaled August 19, 1999, described as “install smoke alarms for 8 residential units”; and permit **19041-30000-02084**, finaled January 22, 2019, for installation of 31 smoke detectors. | The 1999 description corroborates historical reference to eight residential units. It is not a substitute for a Certificate of Occupancy and does not verify bedroom/bath mix. |
| M-09 | LADBS returned **zero code-enforcement items** in the property-activity result. | “The public LADBS result returned no code-enforcement items as of July 30, 2026.” Do not call the property violation-free. |
| M-10 | The LADBS result did not display an original Certificate of Occupancy. A soft-story program tab was present but remained on “Retrieving Data” and did not return a readable property-specific status. | Keep both CofO/legal unit status and any soft-story status in diligence; make no compliance assurance. |
| M-11 | FEMA's National Flood Hazard Layer returned **Zone X — Area of Minimal Flood Hazard**, `SFHA_TF = F`, at the supplied subject point. The state liquefaction Zone of Required Investigation layer returned no intersecting feature at that point. | Preliminary map-screening only; not a Natural Hazard Disclosure determination. |

### Defensible location drivers

- **The exact neighborhood label is Pico-Union.** Do not present the property as being in Koreatown. References to Koreatown should be limited to regional access, if used at all.
- **Transit access is the strongest official location fact.** ZIMAS identifies TOC Tier 4, TOIA 3, a High Quality Transit Corridor within one-half mile, and a Major Transit Stop within one-half mile.
- **The block is urban infill near major corridors.** The subject is on a residential multifamily block near Vermont Avenue and Venice Boulevard, connecting it to central Los Angeles employment and services. This is credible workforce-renter positioning, not a luxury-neighborhood story.
- **Mixed housing stock is characteristic of the broader area.** City Planning describes Pico-Union as having a mixture of single-family and multifamily housing and substantial ethnic and socioeconomic diversity.
- **Tradeoff to acknowledge internally:** proximity to high-capacity corridors supports mobility and renter access but also means urban traffic, noise, and variable block conditions. Avoid “quiet,” “secluded,” “prestigious,” “prime Koreatown,” or “walker's paradise” without separate evidence.
- **Location-grade inputs:** very strong planning-defined transit access; central-city renter-demand context; residential side-street address near major arterials; mixed infill surroundings; no ZIMAS-designated park or school within 500 feet. The honest location story is connectivity and attainable central-city housing, not luxury placemaking.

### Recommended copy-safe language

> 1623 Menlo is positioned in Pico-Union, on a residential multifamily block near Vermont Avenue and Venice Boulevard. ZIMAS identifies the site as TOC Tier 4 and within one-half mile of both a Major Transit Stop and a High Quality Transit Corridor, supporting direct access to the broader central Los Angeles employment base.

> The City's current ZIMAS profile maps the parcel RD1.5-1 with Low Medium II Residential land use and identifies the property as RSO No, JCO Yes, and Ellis Act Property No. Public LADBS records include a finaled 1999 electrical permit whose description references eight residential units; legal unit configuration and Certificate of Occupancy documentation remain subject to seller and City-record verification.

### Unresolved diligence items

- Original and current Certificates of Occupancy.
- Current legal unit count and precise bedroom/bath configuration.
- Complete permit history beyond the records displayed by the public property-activity result.
- Documentary soft-story retrofit/program status; the public tab did not return a readable result.
- Any enforcement or compliance matter outside the public LADBS result.
- Seller records substantiating unit configuration and physical alterations.

## Menlo active-listing refresh

Public listing pages were used only to corroborate current status and asking price. The supplied July 29 MLS export remains controlling for days on market and listing-history detail.

| Property | July 30 public result | Use |
|---|---|---|
| **1056 Dewey Avenue, Los Angeles** | Compass showed **Active**, **$1,695,000**, MLS **26657719**, with page update July 6, 2026. Its displayed history also showed the prior $1,845,000 list price and subsequent reductions. | Keep the supplied $1.695 million current asking price. Retain DOM from the July 29 MLS export rather than the public page's older count. |
| **955 South Normandie Avenue, Los Angeles** | Coldwell Banker showed **Active**, **$4,750,000**, MLS **26833637**, last updated June 22, 2026. Redfin also showed active at $4.75 million. | Keep the supplied $4.75 million current asking price. Retain DOM from the July 29 MLS export. Ignore stale syndicated pages carrying the prior MLS number or $4.85 million ask. |

## Source manifest

### Pasadena official sources

1. City of Pasadena, landlord FAQ: [FAQs for Landlords](https://www.cityofpasadena.net/rent-stabilization/faqs-landlords/)
2. City of Pasadena, registration rules and current fee: [Rental Registry](https://www.cityofpasadena.net/rent-stabilization/rental-registry/)
3. City of Pasadena, current adjustment rules: [Rent Levels and Rent Increases](https://www.cityofpasadena.net/rent-stabilization/info-sheets/rent-levels-and-rent-increases/)
4. City of Pasadena, official registry link announcement: [Latest News from the Rent Stabilization Department — January 2026](https://www.cityofpasadena.net/rent-stabilization/news-announcements/latest-news-from-the-rent-stabilization-department-january-2026/)
5. City of Pasadena public registry portal: [Pasadena Rental Registry](https://pasadenarentalregistry.3diengage.com/)
6. City of Pasadena ArcGIS item: [City of Pasadena Zoning Map](https://www.arcgis.com/home/item.html?id=2c3295b27e0649a181db3512bf0940d4)
7. City of Pasadena ArcGIS zoning service: [Zoning FeatureServer layer](https://services2.arcgis.com/zNjnZafDYCAJAbN0/arcgis/rest/services/Zoning/FeatureServer/0)
8. City of Pasadena: [Planning and Code Compliance Activity Maps](https://www.cityofpasadena.net/planning/planning-division/activity-maps/)
9. City active-building-permit layer: [Active Building Permits FeatureServer](https://services2.arcgis.com/zNjnZafDYCAJAbN0/arcgis/rest/services/Active_Building_Permits_view/FeatureServer/0)
10. City open/pending code-compliance layer: [Code Enforcement Cases FeatureServer](https://services3.arcgis.com/hPs600I3X0RTaaaq/ArcGIS/rest/services/CodeEnforcementCases_view/FeatureServer/0)
11. City of Pasadena: [Permit Center Online](https://www.cityofpasadena.net/planning/permit-center/permit-center-online/)
12. City public Permit Center search: [EnerGov Search](https://mypermits.cityofpasadena.net/EnerGov_Prod/SelfService#/search)
13. City of Pasadena: [Villa Parke Community Center](https://www.cityofpasadena.net/parks-and-rec/parks/villa-parke-community-center/)
14. City confirmation of the field location at Parke Street and Garfield Avenue: [2026 Villa Parke Youth Soccer League announcement](https://www.cityofpasadena.net/city-manager/news/the-city-of-pasadena-invites-the-public-to-the-2026-villa-parke-youth-soccer-league-inauguration-parade/)
15. City economic-development context: [Explore the City](https://www.cityofpasadena.net/economicdevelopment/explore-the-city/)
16. LA Metro, current system context and A Line service: [Metro Maps and Schedules](https://www.metro.net/riding/schedules/)
17. LA Metro confirmation of Memorial Park as an A Line station: [Memorial Park Station wayfinding notice](https://cloud.sfmc.metro.net/MemorialPark_WayFinding_Signage_Install)

### Los Angeles official sources

18. Los Angeles City Planning: [ZIMAS](https://zimas.lacity.org/)
19. Subject-specific ZIMAS permalink: [PIN 126B197 241](https://zimas.lacity.org/?pin=126B197%20%20%20241)
20. ZIMAS-to-LADBS property activity result: [Building Permit Information for PIN 126B197 241](https://zimas.lacity.org/zm4WS/processdatalink.aspx?field=BPI&value=View&pin=126B197%20%20%20241)
21. Los Angeles City Planning: [Pico-Union](https://planning.lacity.gov/preservation-design/overlays/pico-union)

### Official hazard-screening sources

22. FEMA National Flood Hazard Layer: [Flood Hazard Zones layer](https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28)
23. California Geological Survey: [California Seismic Hazard Zones](https://conservation.ca.gov/cgs/shma)
24. California Geological Survey map service: [Liquefaction Zone of Required Investigation](https://services.gis.ca.gov/arcgis/rest/services/GeoscientificInformation/Liquefaction/MapServer)

### Public active-listing corroboration

25. Compass: [1056 Dewey Avenue](https://www.compass.com/homedetails/1056-Dewey-Ave-Los-Angeles-CA-90006/1ITE0H_pid/)
26. Coldwell Banker: [955 South Normandie Avenue](https://www.coldwellbanker.com/ca/los-angeles/955-s-normandie-ave/lid-P00800000HAzlA64fAyP0y5pwVi2rdqRJU4R4qUU)
27. Redfin: [955 South Normandie Avenue](https://www.redfin.com/CA/Los-Angeles/955-S-Normandie-Ave-90006/home/6909082)

## Publication guardrails

- Do not state that Parke is exempt from Pasadena rent stabilization.
- Do not state that Parke is unregistered or noncompliant solely because the public registry search returned no result.
- Do not use `PSR1` as Parke's current zoning label.
- Do not describe zero active/open map matches as a clean full permit or code history.
- Do not state that Menlo's exact present unit mix is legally verified.
- Do not use the 1999 Menlo smoke-alarm permit as a substitute for a Certificate of Occupancy.
- Do not describe Menlo as being in Koreatown; use Pico-Union.
- Do not state or imply redevelopment capacity, entitlement feasibility, or parking relief from the transit overlays without separate planning analysis.
- Do not feature FEMA or CGS point-screening as a substitute for seller disclosures, an NHD report, or professional site analysis.
