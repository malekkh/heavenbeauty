import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getCountryConfig } from "@/lib/countries";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in a country's currency. Pure string formatting so it works
 * the same on the server (RSC) and the client (cart) without locale drift.
 */
export function formatMoney(
  amount: number,
  countryCode: string,
  opts?: { symbol?: string; decimals?: number; position?: "before" | "after" }
): string {
  const config = getCountryConfig(countryCode);
  const symbol = opts?.symbol ?? config?.currency_symbol ?? "$";
  const decimals = opts?.decimals ?? config?.decimals ?? 2;
  const position = opts?.position ?? config?.symbol_position ?? "before";

  const value = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return position === "before" ? `${symbol}${value}` : `${value} ${symbol}`;
}

/** Slugify a product/category name for URLs and storage keys. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
