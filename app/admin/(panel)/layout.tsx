import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AdminShell } from "@/components/admin/admin-shell";
import { Forbidden } from "@/components/admin/forbidden";

// Every admin page is server-rendered per request (auth-gated, never cached).
export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Supabase → no auth possible; bounce to login (which explains setup).
  if (!isSupabaseConfigured()) redirect("/admin/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Require an admin profile (profiles.is_admin). If the profiles table isn't
  // present yet (migration not run), `error` is set and we fall back to
  // allowing any authenticated user, matching the pre-hardening behaviour.
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!error && profile && profile.is_admin !== true) {
    return <Forbidden email={user.email} />;
  }

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
