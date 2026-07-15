# Nova Invoices

Fast, GST-compliant invoicing for Indian businesses. Create a customer, add a
product, and generate a print-ready GST tax invoice PDF in under 30 seconds.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Base UI primitives)
- Prisma + Postgres
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

1. Get a Postgres connection string. Fastest options:
   - Free project at [neon.tech](https://neon.tech) (no credit card), or
   - Vercel dashboard → **Storage** tab → **Create Database** → **Postgres**
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
2. Set `DATABASE_URL` as an environment variable on the project:
   - Vercel dashboard → your project → **Settings → Environment Variables**
     → add `DATABASE_URL` with your connection string, for **all
     environments** (Production, Preview, Development), **or**
   - Vercel dashboard → your project → **Storage** tab → **Create Database**
     → **Postgres**, which sets `DATABASE_URL` automatically.
3. Make sure `prisma/migrations/` has at least one migration committed
   (`npx prisma migrate dev --name init` locally against your real database,
   then commit the generated folder) — the build runs `prisma migrate
   deploy`, which only applies migrations that already exist in the repo.
   It doesn't create the schema from nothing.
4. Redeploy.

**If the build fails with `Error: The datasource.url property is required
in your Prisma config file when using prisma migrate deploy`** — that means
`DATABASE_URL` isn't visible during the build. Check:
- The env var is actually saved on the Vercel project (not just typed and
  left unsaved), and its name is exactly `DATABASE_URL`.
- It's enabled for the **Production** environment if you're deploying to
  production (Vercel lets you scope env vars per environment).
- After adding/changing it, you need to **redeploy** — Vercel doesn't
  retroactively apply env var changes to a build that already ran.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # runs pending migrations, then builds for production
npm run test     # run unit tests (vitest)
npx prisma studio  # browse the database
```
