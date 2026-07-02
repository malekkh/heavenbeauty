import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";
import type { Country } from "@/lib/types";
import { SITE, FOOTER_COLUMNS } from "@/lib/site-config";

/** Storefront footer — About / Shop / Care columns + contact and socials. */
export function SiteFooter({ country }: { country: Country }) {
  const base = `/${country.code}`;
  const waDigits = country.whatsapp_number.replace(/[^\d]/g, "");
  const year = 2026;

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link
            href={base}
            aria-label={`${SITE.name} home`}
            className="inline-block"
          >
            <Image
              src="/logo.png"
              alt={SITE.name}
              width={180}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            A touch of color designed to enhance your natural glow — soft,
            radiant, and effortlessly you.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-accent-soft"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-accent-soft"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`${base}${link.href}`}
                    className="text-sm text-foreground/80 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href={`mailto:${SITE.email}`} className="hover:text-brand">
              {SITE.email}
            </a>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
