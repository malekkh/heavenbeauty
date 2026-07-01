"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/supabase/config";
import { SUPPORTED_COUNTRY_CODES } from "@/lib/countries";
import { TAGS } from "@/lib/data/tags";
import type { ProductCountry, ProductImage } from "@/lib/types";

/** Ensure Supabase is configured and the caller is the authenticated admin. */
async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase isn't configured. Add the env vars to manage the catalog."
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  // Require an admin profile. RLS also enforces this; checking here gives a
  // clear error. If the profiles table isn't present yet, allow (legacy).
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!error && profile && profile.is_admin !== true) {
    throw new Error("Your account isn't an admin.");
  }
  return { supabase, user };
}

/**
 * On-demand revalidation: invalidate the data caches and re-render the public
 * catalog pages for every country so the CDN-cached site updates in seconds.
 */
function revalidateCatalog(slug?: string) {
  // Next 16: revalidateTag takes a cache-life profile; "max" expires the
  // tagged entries immediately so the public catalog reflects the change.
  revalidateTag(TAGS.products, "max");
  revalidateTag(TAGS.categories, "max");
  revalidateTag(TAGS.countries, "max");
  for (const country of SUPPORTED_COUNTRY_CODES) {
    revalidatePath(`/${country}`);
    revalidatePath(`/${country}/shop`);
    if (slug) revalidatePath(`/${country}/product/${slug}`);
  }
}

export interface ProductInput {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  sort_order: number;
  is_active: boolean;
  images: Pick<ProductImage, "url" | "alt" | "sort_order">[];
  pricing: Pick<
    ProductCountry,
    "country_code" | "price" | "is_available"
  >[];
}

export async function saveProduct(input: ProductInput) {
  const { supabase } = await requireAdmin();

  // 1. Upsert the product row.
  const productRow = {
    ...(input.id ? { id: input.id } : {}),
    slug: input.slug,
    name: input.name,
    description: input.description,
    category_id: input.category_id,
    sort_order: input.sort_order,
    is_active: input.is_active,
  };
  const { data: product, error: productError } = await supabase
    .from("products")
    .upsert(productRow)
    .select("id, slug")
    .single();
  if (productError) throw new Error(productError.message);

  const productId = product.id as string;

  // 2. Replace images (simple + predictable).
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (input.images.length) {
    const { error: imgError } = await supabase.from("product_images").insert(
      input.images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt,
        sort_order: img.sort_order ?? i + 1,
      }))
    );
    if (imgError) throw new Error(imgError.message);
  }

  // 3. Upsert per-country pricing/availability.
  if (input.pricing.length) {
    const { error: priceError } = await supabase
      .from("product_country")
      .upsert(
        input.pricing.map((p) => ({
          product_id: productId,
          country_code: p.country_code,
          price: p.price,
          is_available: p.is_available,
        })),
        { onConflict: "product_id,country_code" }
      );
    if (priceError) throw new Error(priceError.message);
  }

  revalidateCatalog(product.slug as string);
  return { id: productId };
}

export async function deleteProduct(id: string, slug?: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog(slug);
}

export interface CategoryInput {
  id?: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export async function saveCategory(input: CategoryInput) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").upsert({
    ...(input.id ? { id: input.id } : {}),
    slug: input.slug,
    name: input.name,
    sort_order: input.sort_order,
    is_active: input.is_active,
  });
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export interface CountryInput {
  code: string;
  name: string;
  currency_code: string;
  currency_symbol: string;
  whatsapp_number: string;
  is_active: boolean;
}

export async function saveCountry(input: CountryInput) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("countries")
    .update({
      name: input.name,
      currency_code: input.currency_code,
      currency_symbol: input.currency_symbol,
      whatsapp_number: input.whatsapp_number,
      is_active: input.is_active,
    })
    .eq("code", input.code);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ *
 * Admin user management
 *
 * Existing admins can add / invite new admins and toggle access. All of
 * these first verify the caller is an admin, then use the service-role
 * client for the privileged auth operations.
 * ------------------------------------------------------------------ */

function ensureServiceRole() {
  if (!hasServiceRole()) {
    throw new Error(
      "User management needs SUPABASE_SERVICE_ROLE_KEY set on the server."
    );
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Create a new user with a password and grant them admin access. */
export async function createAdminUser(email: string, password: string) {
  await requireAdmin();
  ensureServiceRole();
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error("Enter a valid email.");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, email: cleanEmail, is_admin: true });
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/users");
}

/** Invite a new admin by email (requires SMTP configured in Supabase). */
export async function inviteAdminUser(email: string) {
  await requireAdmin();
  ensureServiceRole();
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new Error("Enter a valid email.");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(cleanEmail);
  if (error) throw new Error(error.message);

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: data.user.id, email: cleanEmail, is_admin: true });
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/users");
}

/** Grant or revoke admin access for an existing user. */
export async function setUserAdmin(userId: string, isAdmin: boolean) {
  const { user } = await requireAdmin();
  ensureServiceRole();
  if (userId === user.id && !isAdmin) {
    throw new Error("You can't remove your own admin access.");
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

/** Delete a user entirely (removes their login + profile). */
export async function deleteUser(userId: string) {
  const { user } = await requireAdmin();
  ensureServiceRole();
  if (userId === user.id) {
    throw new Error("You can't delete your own account.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}
