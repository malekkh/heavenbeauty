import { ShieldX } from "lucide-react";
import { signOut } from "@/app/admin/actions";

/** Shown to a signed-in user whose profile isn't marked `is_admin`. */
export function Forbidden({ email }: { email?: string | null }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent-soft text-brand">
          <ShieldX className="size-6" />
        </div>
        <h1 className="font-display text-2xl">Not authorized</h1>
        <p className="mt-2 text-sm text-muted">
          {email ? <span className="font-medium">{email}</span> : "This account"}{" "}
          isn&apos;t an admin. Ask the owner to grant access, or sign in with an
          admin account.
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ink-foreground hover:bg-brand hover:text-brand-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
