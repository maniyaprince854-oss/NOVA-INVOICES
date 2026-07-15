# Nova Invoices

Fast, GST-compliant invoicing for Indian businesses. Create a customer, add a
product, and generate a print-ready GST tax invoice PDF in under 30 seconds.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI primitives)
- Prisma + SQLite (offline-first, single-file database)
- pdf-lib for pixel-precise invoice PDFs
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

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first company
profile is created automatically the first time you visit any page.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run test     # run unit tests (vitest)
npx prisma studio  # browse the local database
```
