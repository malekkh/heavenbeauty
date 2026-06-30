# Heaven Beauty

A multi-country beauty storefront with WhatsApp checkout and a password-protected
admin dashboard. Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4 ·
Supabase · Zustand**, deployed on Vercel.

- **No customer accounts.** Visitors browse and check out over WhatsApp.
- **Admin-only auth.** The owner signs in to manage the catalog.
- **Per-country catalog.** Jordan, Lebanon, UAE and Egypt each get their own
  products, prices and currency, selected by IP with a manual switcher.
- **Fast.** Pages are statically generated per country and revalidated on demand
  when the owner edits the catalog.

---

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000 → redirects to /jo
```

The app runs **without any configuration** — when Supabase env vars are absent it
serves bundled seed data so you can browse the whole storefront immediately. Wire
up Supabase (below) to use a real database, image uploads and the admin.

> Package manager is **pnpm**. Node 20+.

---

## How multi-country works

Public pages live under `/[country]` (`/jo`, `/lb`, `/ae`, `/eg`). The
[`proxy.ts`](proxy.ts) edge layer detects the visitor's country by IP and
redirects bare paths to the right prefix; a `country` cookie + the header
switcher override it.

Each country's catalog is independent via the **`product_country`** join table
(`product_id + country_code`, with `price` and `is_available`):

| Country | Currency | Seeded products |
| --- | --- | --- |
| Jordan `jo` (default) | JOD `د.ا` | all 7 |
| Lebanon `lb` | USD `$` | all 7 |
| UAE `ae` | AED `د.إ` | 4 (no Sparkly Tints) |
| Egypt `eg` | EGP `ج.م` | 5 (no Sparkly “Love”) |

A product appears in a country only when a `product_country` row exists there
with `is_available = true`. Add a country in [`lib/countries.ts`](lib/countries.ts)
(the single source of truth used by the proxy and `generateStaticParams`) and the
`countries` table.

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-guarded) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only.** Used by the seed script |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata |
| `MOCK_COUNTRY` | Optional. Forces a country in local dev (geo is empty locally) |

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com). Note the URL, anon
   key, service-role key and DB password.
2. **Auth → Providers → Email:** enable. **Auth → Settings:** turn **off** “Allow
   new users to sign up” (admin-only).
3. **Auth → Users → Add user:** create the owner with an email + password. This is
   the only account that can sign in to `/admin`.
4. Apply the schema. Either run the SQL in
   [`supabase/migrations`](supabase/migrations) via the SQL editor, or with the CLI:

   ```bash
   pnpm dlx supabase link --project-ref <your-ref>
   pnpm dlx supabase db push
   ```

   This creates the tables, RLS policies and the public `product-images` bucket.
5. Add your env vars to `.env.local`, then seed the catalog:

   ```bash
   pnpm seed
   ```

6. `pnpm dev`, open `/admin`, and sign in with the owner account.

---

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm seed` | Seed Supabase with the catalog (needs service-role key) |

---

## Project structure

```
app/
  [country]/        Public storefront (static per country)
    page.tsx          Home
    shop/             Catalog grid + category filter
    product/[slug]/   Product detail
    our-story · faq · return-cancellations · privacy-policy
  admin/            Auth-gated dashboard (not country-scoped)
    login/            Owner sign-in
    (panel)/          Dashboard, products, categories, countries
    actions.ts        Server actions + on-demand revalidation
components/
  ui/               shadcn-style primitives
  site/             Storefront components (header, cart, switcher, …)
  admin/            Admin components
lib/
  countries.ts      Supported countries (source of truth)
  supabase/         Browser / server / admin / public clients
  data/             Queries, seed data, cache tags
  cart/             Zustand store + WhatsApp checkout
proxy.ts            Geo detection + country redirect (Next 16 middleware)
supabase/migrations Schema, RLS, storage policies
scripts/seed.ts     Catalog seed
```

---

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel (auto-detected as Next.js).
2. Add the env vars for **Production, Preview and Development**.
3. Push to `main` → production deploy. Open a PR → isolated preview deploy.

Geolocation is empty locally — test it on a Vercel preview (or set `MOCK_COUNTRY`).

### Notes

- The heading font is **Fraunces** (a free stand-in for the brand's proprietary
  *Mattone*); body is **Kanit**, matching the live store. Swap in licensed Mattone
  via `next/font/local` if you have the files.
- Product images are placeholder SVGs in `public/products` — replace them with
  real photos through the admin (uploads to Supabase Storage).
- LB/AE/EG prices and all WhatsApp numbers are placeholders; set the real values in
  the admin **Countries** and per-product pricing.
