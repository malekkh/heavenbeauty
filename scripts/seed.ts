/**
 * Bootstrap the `countries` table from the supported-countries config.
 *
 *   pnpm seed
 *
 * This seeds ONLY the countries (currency + WhatsApp config for the 4
 * supported regions) — there is no dummy product data. Products, categories,
 * prices, images and availability are managed entirely from the admin
 * dashboard and stored in Supabase.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Idempotent: re-running upserts by country code.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { COUNTRIES } from "../lib/countries";

config({ path: ".env.local" });
config();

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

const countryRows = COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
  currency_code: c.currency_code,
  currency_symbol: c.currency_symbol,
  whatsapp_number: c.whatsapp_number,
  is_default: c.is_default,
  is_active: c.is_active,
  sort_order: c.sort_order,
}));

async function main() {
  console.log("Seeding supported countries…");
  const { error } = await supabase
    .from("countries")
    .upsert(countryRows, { onConflict: "code" });
  if (error) throw new Error(`Failed to seed countries: ${error.message}`);
  console.log(`  ✓ countries: ${countryRows.length} rows`);
  console.log("✓ Done. Manage products and pricing from /admin.");
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
