# Nova Invoices

Fast, GST-compliant invoicing for Indian businesses. Create a customer, add a
product, and generate a print-ready GST tax invoice PDF in under 30 seconds.

All data (company profile, customers, products, invoices) is stored locally
in your browser using IndexedDB — there is no server database, no
environment variables, and nothing to configure. Your data stays on your
device.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI primitives)
- Dexie.js (IndexedDB) for local, client-side storage
- pdf-lib for pixel-precise invoice PDFs, generated entirely in the browser
- react-hook-form + zod

## Features

- Company profile, customers, products
- Invoice creation with live-calculating totals, keyboard shortcuts
  (`Ctrl+N` new invoice, `F2` new customer, `F3` new product, `Ctrl+S`/`F12`
  save), and search
- GST engine: Auto Detect / CGST+SGST / IGST tax modes, per-item tax
  treatment (Exclusive, Inclusive, Exempt, Zero Rated, Nil Rated, Reverse
  Charge), and a confirmation prompt when overriding a product's GST rate
- Print-ready invoice PDF matching a standard Indian tax invoice layout,
  including a running "Total Due" across a customer's invoices
- Fully responsive — usable end-to-end on mobile
- 100% client-side storage — works offline after the first load, no
  database or backend required

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first company
profile is created automatically the first time you visit any page. All
data is saved to your browser's IndexedDB — clearing your browser storage
for this site will delete it, so avoid private/incognito windows if you
want data to persist.

## Deploying to Vercel

1. Import this repo into Vercel.
2. Click **Deploy**.

That's it — there's no database to provision and no environment variables
to set, since all data lives in the visiting browser rather than on the
server.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # build for production
npm run test     # run unit tests (vitest)
```
