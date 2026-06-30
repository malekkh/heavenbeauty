import { COUNTRIES } from "../countries";
import type {
  Category,
  Country,
  Product,
  ProductCountry,
  ProductImage,
} from "../types";

/**
 * Canonical seed content, mirrored from the live store (jor.myheavenbeauty.com).
 *
 * Two jobs:
 *  1. `scripts/seed.ts` writes these exact rows into Supabase.
 *  2. The data layer (lib/data/queries) serves them directly when Supabase
 *     isn't configured, so the site is fully browsable offline.
 *
 * IDs are fixed (not random) so seeding is idempotent and the offline
 * fallback is deterministic across builds.
 */

// Country rows are derived from the single-source-of-truth config.
export const SEED_COUNTRIES: Country[] = COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
  currency_code: c.currency_code,
  currency_symbol: c.currency_symbol,
  whatsapp_number: c.whatsapp_number,
  is_default: c.is_default,
  is_active: c.is_active,
  sort_order: c.sort_order,
}));

const CAT = {
  heavenly: "c0000000-0000-4000-8000-000000000001",
  sparkly: "c0000000-0000-4000-8000-000000000002",
  devotion: "c0000000-0000-4000-8000-000000000003",
};

export const SEED_CATEGORIES: Category[] = [
  {
    id: CAT.heavenly,
    slug: "heavenly-tints",
    name: "Heavenly Tints",
    sort_order: 1,
    is_active: true,
  },
  {
    id: CAT.sparkly,
    slug: "sparkly-tints",
    name: "Sparkly Tints",
    sort_order: 2,
    is_active: true,
  },
  {
    id: CAT.devotion,
    slug: "devotion",
    name: "Devotion",
    sort_order: 3,
    is_active: true,
  },
];

const P = {
  heavenlyKind: "a0000000-0000-4000-8000-000000000001",
  heavenlyPure: "a0000000-0000-4000-8000-000000000002",
  heavenlyLove: "a0000000-0000-4000-8000-000000000003",
  sparklyKind: "a0000000-0000-4000-8000-000000000004",
  sparklyPure: "a0000000-0000-4000-8000-000000000005",
  sparklyLove: "a0000000-0000-4000-8000-000000000006",
  devotion: "a0000000-0000-4000-8000-000000000007",
};

const NOW = "2026-01-01T00:00:00.000Z";

export const SEED_PRODUCTS: Product[] = [
  {
    id: P.heavenlyKind,
    slug: "heavenly-tint-kind",
    name: "Heavenly Tint — Kind",
    description:
      "A soft, buildable tint for lips and cheeks. Kind is a warm everyday rose that melts into the skin for a natural, effortless flush.",
    category_id: CAT.heavenly,
    sort_order: 1,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.heavenlyPure,
    slug: "heavenly-tint-pure",
    name: "Heavenly Tint — Pure",
    description:
      "The first of its kind. Pure is a soft, light pink created to enhance your natural beauty, blending seamlessly for a fresh, radiant glow.",
    category_id: CAT.heavenly,
    sort_order: 2,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.heavenlyLove,
    slug: "heavenly-tint-love",
    name: "Heavenly Tint — Love",
    description:
      "A romantic deeper rose. Love delivers a radiant, lit-from-within wash of color that stays comfortable and lightweight all day.",
    category_id: CAT.heavenly,
    sort_order: 3,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.sparklyKind,
    slug: "sparkly-tint-kind",
    name: "Sparkly Tint — Kind",
    description:
      "Kind with a whisper of shimmer. A luminous everyday rose that catches the light for a soft, glassy finish on lips and cheeks.",
    category_id: CAT.sparkly,
    sort_order: 1,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.sparklyPure,
    slug: "sparkly-tint-pure",
    name: "Sparkly Tint — Pure",
    description:
      "Pure, elevated with a fine pearl. A light pink glow with subtle sparkle for a dewy, radiant look that feels effortless.",
    category_id: CAT.sparkly,
    sort_order: 2,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.sparklyLove,
    slug: "sparkly-tint-love",
    name: "Sparkly Tint — Love",
    description:
      "Love with luminous shimmer. A deeper rose that shines for a bold yet weightless flush of radiant color.",
    category_id: CAT.sparkly,
    sort_order: 3,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: P.devotion,
    slug: "devotion-sculpt-and-blush",
    name: "Devotion — Sculpt & Blush",
    description:
      "A two-in-one to sculpt and flush. Devotion defines and warms the face with a soft, blendable finish that adapts to every tone.",
    category_id: CAT.devotion,
    sort_order: 1,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  },
];

export const SEED_PRODUCT_IMAGES: ProductImage[] = SEED_PRODUCTS.map(
  (p, i) => ({
    id: `b0000000-0000-4000-8000-00000000000${i + 1}`,
    product_id: p.id,
    // Placeholder artwork shipped in /public/products. Owner replaces these
    // with real photos (uploaded to Supabase Storage) from the admin.
    url: `/products/${p.slug}.svg`,
    alt: p.name,
    sort_order: 1,
  })
);

/**
 * Per-country price + availability. This is the table that makes each
 * country show a DIFFERENT catalog at a DIFFERENT price:
 *
 *  - Jordan  (jo): all 7 products  — 21.00 JOD (live price)
 *  - Lebanon (lb): all 7 products  — 14.99 USD
 *  - UAE     (ae): 4 products      — sparkly tints not carried here
 *  - Egypt   (eg): 5 products      — sparkly "Love" not carried here
 *
 * A product appears in a country only when a row exists here AND
 * is_available = true. Prices below the live JO figure are placeholders the
 * owner refines in the admin.
 */
const PRICEBOOK: Record<string, number> = {
  jo: 21.0,
  lb: 14.99,
  ae: 110.0,
  eg: 1450.0,
};

// Which products each country carries. Omission == not sold there.
const AVAILABILITY: Record<string, string[]> = {
  jo: SEED_PRODUCTS.map((p) => p.id),
  lb: SEED_PRODUCTS.map((p) => p.id),
  ae: [P.heavenlyKind, P.heavenlyPure, P.heavenlyLove, P.devotion],
  eg: [
    P.heavenlyKind,
    P.heavenlyPure,
    P.heavenlyLove,
    P.sparklyKind,
    P.sparklyPure,
  ],
};

export const SEED_PRODUCT_COUNTRY: ProductCountry[] = COUNTRIES.flatMap(
  (country) => {
    const carried = AVAILABILITY[country.code] ?? [];
    return carried.map((productId) => ({
      product_id: productId,
      country_code: country.code,
      price: PRICEBOOK[country.code] ?? 0,
      is_available: true,
    }));
  }
);
