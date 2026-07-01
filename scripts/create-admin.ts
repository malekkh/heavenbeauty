/**
 * Create (or update) the owner admin user in Supabase Auth.
 *
 *   pnpm exec tsx scripts/create-admin.ts <email> <password>
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Sign-ups should be disabled in the dashboard; this is how the single owner
 * account is provisioned. Idempotent: re-running updates the password.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];
const password = process.argv[3];

if (!url || !serviceKey) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!email || !password) {
  console.error("✗ Usage: tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    // If the user already exists, update the password instead.
    const already = /already|exists|registered/i.test(error.message);
    if (already) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const user = list?.users.find((u) => u.email === email);
      if (user) {
        const { error: upErr } = await supabase.auth.admin.updateUserById(
          user.id,
          { password, email_confirm: true }
        );
        if (upErr) throw new Error(upErr.message);
        console.log(`✓ Updated existing admin user: ${email}`);
        return;
      }
    }
    throw new Error(error.message);
  }
  console.log(`✓ Created admin user: ${email}`);
}

main().catch((err) => {
  console.error("✗ Failed:", err.message);
  process.exit(1);
});
