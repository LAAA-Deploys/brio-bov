# Brio Portfolio BOV

Seller-facing broker opinion of value for 359 Parke Street in Pasadena and 1623 Menlo Avenue in Los Angeles.

## Routes

- `/` portfolio overview
- `/359-parke` standalone Parke BOV
- `/1623-menlo` standalone Menlo BOV

## Local use

Copy `.env.example` to `.env.local` and provide the approved Google Maps key. Then:

```powershell
npm install
npm run dev
```

## Verification

```powershell
npm run qa:all
```

The website is verified at desktop, 390px, 360px, and 320px widths before publication.
