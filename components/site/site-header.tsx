import Link from "next/link";
import type { Country } from "@/lib/types";
import { CartSheet } from "./cart-sheet";
import { CountrySwitcher } from "./country-switcher";
import { SearchDialog, type SearchItem } from "./search-dialog";
import { MobileNav } from "./mobile-nav";

/**
 * Sticky storefront header. Server component composing the interactive
 * (client) bits: search, country switcher and cart.
 */
export function SiteHeader({
  country,
  countries,
  searchItems,
}: {
  country: Country;
  countries: Country[];
  searchItems: SearchItem[];
}) {
  const base = `/${country.code}`;
  const links = [
    { label: "Home", href: base },
    { label: "Shop", href: `${base}/shop` },
    { label: "Our Story", href: `${base}/our-story` },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <MobileNav links={links} />
          <Link
            href={base}
            className="font-display text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Heaven Beauty
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SearchDialog items={searchItems} countryCode={country.code} />
          <CountrySwitcher current={country.code} countries={countries} />
          <CartSheet country={country} />
        </div>
      </div>
    </header>
  );
}
