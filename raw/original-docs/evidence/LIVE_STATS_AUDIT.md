# LAAA live closed-deal stats audit

Read-only source: Airtable base `appJh9m9A1LzMeI6I`, table `tblSQs0OQxuGNcEpG` (`LAAA Closed Deals`), queried 2026-07-30.

Calculation basis: `Close Price` for volume and `Close Date` for timing. `Price Per Unit` and any asking-price fields were not used for aggregate sales volume.

## Verified live totals

| Scope | Closed deals | Close Price volume | Units |
|---|---:|---:|---:|
| All property types | 492 | $1,548,928,899.50 | Not used |
| Apartments | 340 | $1,156,335,729.50 | 4,668 |
| 2026 YTD through 2026-07-30, all property types | 19 | $50,546,941.00 | Not used |
| 2026 YTD through 2026-07-30, apartments | 11 | $26,214,000.00 | Included in the 4,668 all-time apartment total |

Additional apartment audit:

- Apartment records with usable `Close Price` and `Units`: 340.
- Average observed close price per unit: $299,328.49.
- Median observed close price per unit: $278,888.89.
- Range: $37,638.89 to $1,166,666.67 per unit.
- Apartment building square footage populated on 315 of 340 records; the populated total is 3,945,827 SF. Do not present that as a complete all-time apartment square-foot total.

## Recommended client-facing use

Safest current proof line:

> 492 closed transactions representing more than $1.54 billion in aggregate Close Price, including 340 apartment transactions and 4,668 apartment units.

If a shorter, apartment-specific line is preferred:

> 340 apartment transactions totaling more than $1.15 billion in aggregate Close Price and 4,668 units.

These are closed-deal totals from the current LAAA Airtable table. Do not convert them into buyer-reach, email-database, active-investor, or marketing-distribution claims.
