# Nova Invoices

Fast, GST-compliant invoicing for Indian businesses. Create a customer, add a
product, and generate a print-ready GST tax invoice PDF in under 30 seconds.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI primitives)
- Prisma + Postgres (works with Neon, Vercel Postgres, or any Postgres host)
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

1. Get a Postgres connection string — the fastest way is a free project at
   [neon.tech](https://neon.tech), or Vercel's dashboard: **Storage** tab →
   **Create Database** → **Postgres**.
2. ```bash
   npm install
   cp .env.example .env   # paste your connection string into DATABASE_URL
   npx prisma migrate dev --name init
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The first company
profile is created automatically the first time you visit any page.

## Deploying to Vercel

1. Import this repo into Vercel.
2. Add a Postgres database from the **Storage** tab (this sets `DATABASE_URL`
   automatically), or add `DATABASE_URL` manually under **Settings → Environment
   Variables** if you're using Neon/another provider directly.
3. Deploy. The build runs `prisma migrate deploy` automatically before
   `next build`, so make sure you've run `prisma migrate dev` locally at
   least once first and committed the generated `prisma/migrations/` folder —
   otherwise there's nothing for `migrate deploy` to apply.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # runs pending migrations, then builds for production
npm run test     # run unit tests (vitest)
npx prisma studio  # browse the database
```
