/**
 * Seed the Supabase database with Heaven Beauty's catalog.
 *
 *   pnpm seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Idempotent: re-running upserts the same fixed rows. Uses the service-role
 * key (bypasses RLS) so it can write everything in one pass.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  SEED_CATEGORIES,
  SEED_COUNTRIES,
  SEED_PRODUCTS,
  SEED_PRODUCT_COUNTRY,
  SEED_PRODUCT_IMAGES,
} from "../lib/data/seed-data";

config({ path: ".env.local" });
config(); // also fall back to .env

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Add them to .env.local before seeding."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsert<T extends object>(
  table: string,
  rows: T[],
  conflict: string
) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflict });
  if (error) {
    throw new Error(`Failed to seed ${table}: ${error.message}`);
  }
  console.log(`  ✓ ${table}: ${rows.length} rows`);
}

async function main() {
  console.log("Seeding Heaven Beauty catalog…");
  // Order matters for FKs: countries + categories → products → images/pricing.
  await upsert("countries", SEED_COUNTRIES, "code");
  await upsert("categories", SEED_CATEGORIES, "id");
  await upsert("products", SEED_PRODUCTS, "id");
  await upsert("product_images", SEED_PRODUCT_IMAGES, "id");
  await upsert(
    "product_country",
    SEED_PRODUCT_COUNTRY,
    "product_id,country_code"
  );
  console.log("✓ Seed complete.");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
