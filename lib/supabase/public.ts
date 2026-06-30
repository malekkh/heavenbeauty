import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Cookieless anon client for PUBLIC catalog reads.
 *
 * Unlike the SSR server client, this never touches cookies/headers, so it can
 * run inside `unstable_cache` and during static generation. RLS still limits
 * it to active/available rows.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
