/**
 * Whether Supabase is wired up. When the env vars are absent (e.g. local
 * dev before the project is created, or CI build with no secrets) the data
 * layer transparently falls back to bundled seed data so `pnpm dev` and
 * `pnpm build` stay green and the storefront is fully browsable.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
