import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CatalogProduct, Category, Country } from "@/lib/types";
import { REVALIDATE_SECONDS, TAGS } from "./tags";

/*
 * Public catalog reads — always from Supabase. Reads are wrapped in
 * `unstable_cache` (ISR) and invalidated on demand by the admin. When the
 * env isn't configured (e.g. a build with no secrets) these return empty
 * rather than crashing; wire up the env vars to get real data.
 */

/* ------------------------------------------------------------------ *
 * Countries
 * ------------------------------------------------------------------ */

export async function getActiveCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured()) return [];
  return getActiveCountriesCached();
}

const getActiveCountriesCached = unstable_cache(
  async (): Promise<Country[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("countries")
      .select(
        "code, name, currency_code, currency_symbol, whatsapp_number, delivery_rate, is_default, is_active, sort_order"
      )
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Country[];
  },
  ["active-countries"],
  { tags: [TAGS.countries], revalidate: REVALIDATE_SECONDS }
);

export async function getCountryByCode(
  code: string
): Promise<Country | null> {
  const countries = await getActiveCountries();
  return countries.find((c) => c.code === code.toLowerCase()) ?? null;
}

/**
 * Active countries, each with their active governorates — for the checkout
 * country/governorate selectors. RLS returns only active governorates.
 */
export async function getCheckoutCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured()) return [];
  return getCheckoutCountriesCached();
}

const getCheckoutCountriesCached = unstable_cache(
  async (): Promise<Country[]> => {
    const supabase = createPublicClient();
    const withGov = await supabase
      .from("countries")
      .select(
        "code, name, currency_code, currency_symbol, whatsapp_number, delivery_rate, is_default, is_active, sort_order, governorates(id, country_code, name, delivery_rate, sort_order, is_active)"
      )
      .eq("is_active", true)
      .order("sort_order");

    // Resilience for the deploy window before the governorates migration is
    // applied: fall back to countries with no governorates rather than failing.
    if (withGov.error) {
      const base = await supabase
        .from("countries")
        .select(
          "code, name, currency_code, currency_symbol, whatsapp_number, delivery_rate, is_default, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order");
      if (base.error) throw base.error;
      return ((base.data ?? []) as unknown as Country[]).map((c) => ({
        ...c,
        governorates: [],
      }));
    }

    return ((withGov.data ?? []) as unknown as Country[]).map((c) => ({
      ...c,
      governorates: (c.governorates ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  },
  ["checkout-countries"],
  { tags: [TAGS.countries], revalidate: REVALIDATE_SECONDS }
);

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  return getCategoriesCached();
}

const getCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
  ["categories"],
  { tags: [TAGS.categories], revalidate: REVALIDATE_SECONDS }
);

/* ------------------------------------------------------------------ *
 * Catalog (per-country products)
 * ------------------------------------------------------------------ */

type RawCatalogRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  category: { id: string; slug: string; name: string } | null;
  images: { url: string; alt: string | null; sort_order: number }[] | null;
  pricing: { price: number; is_available: boolean }[] | null;
};

function mapRow(row: RawCatalogRow): CatalogProduct | null {
  const pricing = row.pricing?.[0];
  if (!pricing) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    images: (row.images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ url: img.url, alt: img.alt })),
    price: pricing.price,
    is_available: pricing.is_available,
    sort_order: row.sort_order,
  };
}

const CATALOG_SELECT = `
  id, slug, name, description, sort_order,
  category:categories(id, slug, name),
  images:product_images(url, alt, sort_order),
  pricing:product_country!inner(price, is_available)
`;

export async function getCatalogProducts(opts: {
  country: string;
  categorySlug?: string;
}): Promise<CatalogProduct[]> {
  const country = opts.country.toLowerCase();
  if (!isSupabaseConfigured()) return [];
  const products = await getCatalogProductsCached(country);
  return opts.categorySlug
    ? products.filter((p) => p.category?.slug === opts.categorySlug)
    : products;
}

const getCatalogProductsCached = unstable_cache(
  async (country: string): Promise<CatalogProduct[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(CATALOG_SELECT)
      .eq("is_active", true)
      .eq("pricing.country_code", country)
      .eq("pricing.is_available", true)
      .order("sort_order");
    if (error) throw error;
    return ((data ?? []) as unknown as RawCatalogRow[])
      .map(mapRow)
      .filter((x): x is CatalogProduct => x !== null);
  },
  ["catalog-products"],
  { revalidate: REVALIDATE_SECONDS, tags: [TAGS.products] }
);

export async function getCatalogProductBySlug(opts: {
  country: string;
  slug: string;
}): Promise<CatalogProduct | null> {
  const country = opts.country.toLowerCase();
  if (!isSupabaseConfigured()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(CATALOG_SELECT)
    .eq("is_active", true)
    .eq("slug", opts.slug)
    .eq("pricing.country_code", country)
    .eq("pricing.is_available", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as RawCatalogRow) : null;
}

/** Slugs available in a country — drives `generateStaticParams`. */
export async function getCountryProductSlugs(
  country: string
): Promise<string[]> {
  const products = await getCatalogProducts({ country });
  return products.map((p) => p.slug);
}

/** Group a country's catalog by category, preserving category order. */
export async function getCatalogByCategory(country: string): Promise<
  { category: Category; products: CatalogProduct[] }[]
> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getCatalogProducts({ country }),
  ]);
  return categories
    .map((category) => ({
      category,
      products: products.filter((p) => p.category?.id === category.id),
    }))
    .filter((group) => group.products.length > 0);
}
