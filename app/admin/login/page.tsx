import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();

  // Already signed in → straight to the dashboard.
  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/admin");
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Heaven Beauty</h1>
          <p className="mt-1 text-sm text-muted">Admin dashboard</p>
        </div>
        <LoginForm configured={configured} />
      </div>
    </div>
  );
}
