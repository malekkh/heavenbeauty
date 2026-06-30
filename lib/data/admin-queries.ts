import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  AdminProduct,
  Category,
  Country,
  ProductCountry,
} from "@/lib/types";
import {
  SEED_CATEGORIES,
  SEED_COUNTRIES,
  SEED_PRODUCTS,
  SEED_PRODUCT_COUNTRY,
  SEED_PRODUCT_IMAGES,
} from "./seed-data";

/**
 * Admin reads — full rows (including inactive/unavailable), unlike the public
 * queries. Uses the authenticated server client so RLS grants full access.
 * Falls back to bundled seed data when Supabase isn't configured so the admin
 * UI renders (read-only) for preview/build.
 */

const ADMIN_PRODUCT_SELECT = `
  id, slug, name, description, category_id, sort_order, is_active,
  created_at, updated_at,
  category:categories(id, slug, name),
  images:product_images(id, product_id, url, alt, sort_order),
  pricing:product_country(product_id, country_code, price, is_available)
`;

function seedAdminProducts(): AdminProduct[] {
  const categoriesById = new Map(SEED_CATEGORIES.map((c) => [c.id, c]));
  return SEED_PRODUCTS.map((p) => {
    const cat = p.category_id ? categoriesById.get(p.category_id) : undefined;
    return {
      ...p,
      category: cat
        ? { id: cat.id, slug: cat.slug, name: cat.name }
        : null,
      images: SEED_PRODUCT_IMAGES.filter((i) => i.product_id === p.id).sort(
        (a, b) => a.sort_order - b.sort_order
      ),
      pricing: SEED_PRODUCT_COUNTRY.filter((pc) => pc.product_id === p.id),
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseConfigured()) return seedAdminProducts();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as unknown as AdminProduct[];
}

export async function getAdminProduct(
  id: string
): Promise<AdminProduct | null> {
  if (!isSupabaseConfigured()) {
    return seedAdminProducts().find((p) => p.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AdminProduct) ?? null;
}

export async function getAdminCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return [...SEED_CATEGORIES].sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, is_active")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getAdminCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured()) {
    return [...SEED_COUNTRIES].sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countries")
    .select(
      "code, name, currency_code, currency_symbol, whatsapp_number, is_default, is_active, sort_order"
    )
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Country[];
}

/** Empty per-country pricing scaffold for a new/edited product. */
export function emptyPricing(
  countries: Country[],
  existing: ProductCountry[] = []
): ProductCountry[] {
  return countries.map((c) => {
    const found = existing.find((p) => p.country_code === c.code);
    return (
      found ?? {
        product_id: "",
        country_code: c.code,
        price: 0,
        is_available: false,
      }
    );
  });
}
