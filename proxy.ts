import { NextResponse, type NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  isSupportedCountry,
  resolveCountry,
} from "@/lib/countries";

/**
 * Geo routing (Next.js 16 "proxy", formerly middleware).
 *
 * Public pages live under `/[country]`. This runs at the edge before render:
 *  - If the path already starts with a supported country prefix, continue.
 *  - Otherwise resolve the country by priority and REDIRECT to `/{country}{path}`:
 *      1. `country` cookie (explicit switcher choice / prior detection)
 *      2. IP geolocation (`geolocation()` reads x-vercel-ip-country; empty locally)
 *      3. MOCK_COUNTRY env (handy for local geo testing)
 *      4. default country
 *
 * `/admin` is excluded by the matcher and gated in its own layout.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  // Already country-scoped — let it through untouched.
  if (isSupportedCountry(firstSegment)) {
    return NextResponse.next();
  }

  // 1. Cookie
  const cookieCountry = request.cookies.get(COUNTRY_COOKIE)?.value;

  // 2. Geo (empty in local dev) — 3. env mock — handled by resolveCountry fallback
  let geoCountry: string | undefined;
  try {
    geoCountry = geolocation(request).country?.toLowerCase();
  } catch {
    geoCountry = undefined;
  }

  const country = isSupportedCountry(cookieCountry)
    ? resolveCountry(cookieCountry)
    : isSupportedCountry(geoCountry)
      ? resolveCountry(geoCountry)
      : resolveCountry(process.env.MOCK_COUNTRY) /* falls back to default */ ||
        DEFAULT_COUNTRY;

  const url = request.nextUrl.clone();
  url.pathname = `/${country}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  const response = NextResponse.redirect(url);
  // Persist so the next request is stable and the switcher choice sticks.
  response.cookies.set(COUNTRY_COOKIE, country, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Run on everything except API, Next internals, files with an extension,
  // the admin area, and common metadata files.
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
