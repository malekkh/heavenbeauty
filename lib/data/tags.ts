/**
 * Cache tags for ISR + on-demand revalidation. The public catalog reads are
 * tagged with these; the admin invalidates them after a write so the cached,
 * CDN-served site updates within seconds.
 */
export const TAGS = {
  countries: "countries",
  categories: "categories",
  products: "products",
  /** Per-country catalog tag, e.g. catalog:jo */
  catalog: (country: string) => `catalog:${country}`,
  /** Per-product tag, e.g. product:heavenly-tint-kind */
  product: (slug: string) => `product:${slug}`,
};

/** Safety-net revalidation window (seconds) on top of on-demand tags. */
export const REVALIDATE_SECONDS = 3600;
