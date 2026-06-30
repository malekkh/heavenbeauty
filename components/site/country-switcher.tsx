"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COUNTRIES, COUNTRY_COOKIE } from "@/lib/countries";
import { setBrowserCookie } from "@/lib/cookies";
import type { Country } from "@/lib/types";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Country switcher. Persists the choice to the `country` cookie (so the proxy
 * respects it on later visits) and navigates to the same page under the new
 * country prefix.
 */
export function CountrySwitcher({
  current,
  countries,
}: {
  current: string;
  countries: Country[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const flagFor = (code: string) =>
    COUNTRIES.find((c) => c.code === code)?.flag ?? "🌍";

  const activeName =
    countries.find((c) => c.code === current)?.name ?? current.toUpperCase();

  const switchTo = (code: string) => {
    if (code === current) return;
    setBrowserCookie(COUNTRY_COOKIE, code, ONE_YEAR);

    // Swap the leading country segment, preserving the rest of the path.
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && COUNTRIES.some((c) => c.code === segments[0])) {
      segments[0] = code;
    } else {
      segments.unshift(code);
    }
    router.push("/" + segments.join("/"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
        <span className="text-base leading-none">{flagFor(current)}</span>
        <span className="hidden sm:inline">{activeName}</span>
        <ChevronDown className="size-4 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {countries.map((c) => (
          <DropdownMenuItem
            key={c.code}
            selected={c.code === current}
            onSelect={() => switchTo(c.code)}
          >
            <span className="text-base leading-none">{flagFor(c.code)}</span>
            <span>{c.name}</span>
            <span className="ml-auto text-xs text-muted">
              {c.currency_code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
