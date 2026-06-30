import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProduct } from "@/lib/types";
import { ProductCard } from "./product-card";

/**
 * Horizontal product rail per category. CSS scroll-snap, no JS — the row
 * scrolls on touch/trackpad and wraps to a grid feel on wider screens.
 */
export function ProductCarousel({
  title,
  products,
  countryCode,
  viewAllHref,
  priority = false,
}: {
  title: string;
  products: CatalogProduct[];
  countryCode: string;
  viewAllHref?: string;
  priority?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-[72vw] shrink-0 snap-start sm:w-auto"
          >
            <ProductCard
              product={product}
              countryCode={countryCode}
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
