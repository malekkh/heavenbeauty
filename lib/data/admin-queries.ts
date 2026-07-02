import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, hasServiceRole } from "@/lib/supabase/config";
import type { AdminProduct, Category, Country, Order } from "@/lib/types";

/**
 * Admin reads — full rows (including inactive/unavailable), from Supabase only.
 * Uses the authenticated server client so RLS grants full access. No seed
 * fallback: the store is entirely database-driven.
 */

const ADMIN_PRODUCT_SELECT = `
  id, slug, name, description, category_id, sort_order, is_active,
  created_at, updated_at,
  category:categories(id, slug, name),
  images:product_images(id, product_id, url, alt, sort_order),
  pricing:product_country(product_id, country_code, price, is_available)
`;

export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseConfigured()) return [];
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
  if (!isSupabaseConfigured()) return null;
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
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, is_active")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getAdminCountries(): Promise<Country[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countries")
    .select(
      "code, name, currency_code, currency_symbol, whatsapp_number, delivery_rate, is_default, is_active, sort_order, governorates(id, country_code, name, delivery_rate, sort_order, is_active)"
    )
    .order("sort_order");
  if (error) throw error;
  return ((data ?? []) as unknown as Country[]).map((c) => ({
    ...c,
    governorates: (c.governorates ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

/** All orders, newest first. RLS grants the authenticated admin read access. */
export async function getAdminOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, country_code, customer_name, customer_phone, customer_email, address, city, governorate, postal_code, notes, items, subtotal, delivery, currency, status, notify_status"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export interface AdminUser {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

/** All users with their admin flag. Uses the service role to see every row. */
export async function getUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured() || !hasServiceRole()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, is_admin, created_at")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}
