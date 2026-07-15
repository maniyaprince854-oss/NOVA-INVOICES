# Nova Invoices

Fast, GST-compliant invoicing for Indian businesses. Create a customer, add a
product, and generate a print-ready GST tax invoice PDF in under 30 seconds.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI primitives)
- Prisma + SQLite (offline-first, single-file local database)
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
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No external services or
accounts needed — the database is a local SQLite file (`dev.db`). The first
company profile is created automatically the first time you visit any page.

## Deploying (e.g. to Vercel)

This app is set up for local, offline-first use by default. Vercel's
serverless functions don't have a persistent filesystem, so the local SQLite
file won't work there as-is. To deploy somewhere like Vercel, switch to a
network-accessible Postgres database first:

1. `prisma/schema.prisma` — change the datasource `provider` from `"sqlite"`
   to `"postgresql"`.
2. `lib/db.ts` — swap the `PrismaBetterSqlite3` adapter for `PrismaPg` (from
   `@prisma/adapter-pg`; run `npm install @prisma/adapter-pg pg` first).
3. Point `DATABASE_URL` at a real Postgres database (e.g. a free project at
   [neon.tech](https://neon.tech), or Vercel's **Storage** tab → **Create
   Database** → **Postgres**) and run `npx prisma migrate dev --name init`
   against it to create fresh migration history (delete the old
   SQLite-flavored migrations first — the SQL dialects aren't compatible).
4. Add `"prisma migrate deploy && "` in front of the `build` script in
   `package.json` so pending migrations apply automatically on every deploy.

Ask for help with this switch whenever you're ready to actually deploy —
it's a quick, mechanical change.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run test     # run unit tests (vitest)
npx prisma studio  # browse the local database
```
