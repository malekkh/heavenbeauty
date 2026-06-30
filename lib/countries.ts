/**
 * Single source of truth for supported countries.
 *
 * The same data lives in the Supabase `countries` table (so the owner can
 * toggle currency / WhatsApp number from the admin), but this file is what
 * the proxy (geo redirect) and `generateStaticParams` rely on at the edge /
 * build time, where a DB round-trip is undesirable. Keep them in sync; the
 * seed script writes these exact rows into the DB.
 */

export interface CountryConfig {
  /** ISO 3166-1 alpha-2, lowercase — used as the route prefix. */
  code: string;
  name: string;
  /** ISO 4217 code, e.g. "JOD". */
  currency_code: string;
  /** Symbol used when formatting money, e.g. "د.ا" or "$". */
  currency_symbol: string;
  /** Where the symbol sits relative to the amount. */
  symbol_position: "before" | "after";
  /** Decimal places to show for prices in this currency. */
  decimals: number;
  /** E.164 digits only (no "+"), used to build wa.me links. */
  whatsapp_number: string;
  /** Emoji flag for the country switcher. */
  flag: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "jo",
    name: "Jordan",
    currency_code: "JOD",
    currency_symbol: "د.ا",
    symbol_position: "after",
    decimals: 2,
    whatsapp_number: "96178835078",
    flag: "🇯🇴",
    is_default: true,
    is_active: true,
    sort_order: 1,
  },
  {
    code: "lb",
    name: "Lebanon",
    currency_code: "USD",
    currency_symbol: "$",
    symbol_position: "before",
    decimals: 2,
    // Placeholder — owner updates real LB WhatsApp number in admin.
    whatsapp_number: "96178835078",
    flag: "🇱🇧",
    is_default: false,
    is_active: true,
    sort_order: 2,
  },
  {
    code: "ae",
    name: "United Arab Emirates",
    currency_code: "AED",
    currency_symbol: "د.إ",
    symbol_position: "after",
    decimals: 2,
    // Placeholder — owner updates real UAE WhatsApp number in admin.
    whatsapp_number: "96178835078",
    flag: "🇦🇪",
    is_default: false,
    is_active: true,
    sort_order: 3,
  },
  {
    code: "eg",
    name: "Egypt",
    currency_code: "EGP",
    currency_symbol: "ج.م",
    symbol_position: "after",
    decimals: 2,
    // Placeholder — owner updates real EG WhatsApp number in admin.
    whatsapp_number: "96178835078",
    flag: "🇪🇬",
    is_default: false,
    is_active: true,
    sort_order: 4,
  },
];

export const DEFAULT_COUNTRY =
  COUNTRIES.find((c) => c.is_default)?.code ?? COUNTRIES[0].code;

export const SUPPORTED_COUNTRY_CODES = COUNTRIES.filter(
  (c) => c.is_active
).map((c) => c.code);

export function isSupportedCountry(code: string | undefined | null): boolean {
  if (!code) return false;
  return SUPPORTED_COUNTRY_CODES.includes(code.toLowerCase());
}

/** Static config lookup. For DB-backed data use the queries in lib/data. */
export function getCountryConfig(code: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.code === code.toLowerCase());
}

/**
 * Resolve a country code from a candidate (cookie / geo header), falling back
 * to the default when the candidate isn't a supported, active country.
 */
export function resolveCountry(candidate: string | undefined | null): string {
  const c = candidate?.toLowerCase();
  return c && isSupportedCountry(c) ? c : DEFAULT_COUNTRY;
}

/** Cookie name persisting the visitor's chosen / detected country. */
export const COUNTRY_COOKIE = "country";
