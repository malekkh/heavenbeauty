import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  CatalogProduct,
  Category,
  Country,
} from "@/lib/types";
import { REVALIDATE_SECONDS, TAGS } from "./tags";
import {
  SEED_CATEGORIES,
  SEED_COUNTRIES,
  SEED_PRODUCTS,
  SEED_PRODUCT_COUNTRY,
  SEED_PRODUCT_IMAGES,
} from "./seed-data";

/* ------------------------------------------------------------------ *
 * Countries
 * ------------------------------------------------------------------ */

export async function getActiveCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured()) {
    return SEED_COUNTRIES.filter((c) => c.is_active).sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }
  return getActiveCountriesCached();
}

const getActiveCountriesCached = unstable_cache(
  async (): Promise<Country[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("countries")
      .select(
        "code, name, currency_code, currency_symbol, whatsapp_number, is_default, is_active, sort_order"
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

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return SEED_CATEGORIES.filter((c) => c.is_active).sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }
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

/** Build the seed catalog for a country from the bundled rows. */
function seedCatalog(country: string): CatalogProduct[] {
  const code = country.toLowerCase();
  const categoriesById = new Map(SEED_CATEGORIES.map((c) => [c.id, c]));
  return SEED_PRODUCT_COUNTRY.filter(
    (pc) => pc.country_code === code && pc.is_available
  )
    .map((pc) => {
      const product = SEED_PRODUCTS.find(
        (p) => p.id === pc.product_id && p.is_active
      );
      if (!product) return null;
      const cat = product.category_id
        ? categoriesById.get(product.category_id)
        : undefined;
      const images = SEED_PRODUCT_IMAGES.filter(
        (img) => img.product_id === product.id
      )
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => ({ url: img.url, alt: img.alt }));
      const item: CatalogProduct = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        category: cat
          ? { id: cat.id, slug: cat.slug, name: cat.name }
          : null,
        images,
        price: pc.price,
        is_available: pc.is_available,
        sort_order: product.sort_order,
      };
      return item;
    })
    .filter((x): x is CatalogProduct => x !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

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
  if (!isSupabaseConfigured()) {
    const all = seedCatalog(country);
    return opts.categorySlug
      ? all.filter((p) => p.category?.slug === opts.categorySlug)
      : all;
  }
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
  if (!isSupabaseConfigured()) {
    return seedCatalog(country).find((p) => p.slug === opts.slug) ?? null;
  }
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
