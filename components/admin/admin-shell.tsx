import Link from "next/link";
import Image from "next/image";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { signOut } from "@/app/admin/actions";
import { DEFAULT_COUNTRY } from "@/lib/countries";

export function AdminShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <Link href="/admin" className="px-3 py-2" aria-label="Heaven Beauty admin">
          <Image
            src="/logo.png"
            alt="Heaven Beauty"
            width={150}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        <p className="mb-6 px-3 text-xs text-muted">Admin</p>
        <AdminNav />
        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <Link
            href={`/${DEFAULT_COUNTRY}`}
            target="_blank"
            className="flex items-center gap-2 px-3 text-sm text-muted hover:text-brand"
          >
            <ExternalLink className="size-4" /> View site
          </Link>
          {email ? (
            <p className="truncate px-3 text-xs text-muted">{email}</p>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-foreground/5"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <Link href="/admin" aria-label="Heaven Beauty admin">
            <Image
              src="/logo.png"
              alt="Heaven Beauty"
              width={130}
              height={35}
              className="h-7 w-auto"
            />
          </Link>
          <form action={signOut}>
            <button type="submit" aria-label="Sign out">
              <LogOut className="size-5" />
            </button>
          </form>
        </div>
        <div className="md:hidden">
          <div className="border-b border-border bg-surface px-4 py-2">
            <AdminNav />
          </div>
        </div>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
