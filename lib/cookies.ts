/** Client-side cookie helpers (browser only). */

export function setBrowserCookie(
  name: string,
  value: string,
  maxAgeSeconds: number
) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}
