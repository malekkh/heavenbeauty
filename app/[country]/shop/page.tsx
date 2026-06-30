import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopFilters } from "@/components/site/shop-filters";
import { ProductCard } from "@/components/site/product-card";
import { getCatalogProducts, getCategories } from "@/lib/data/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the full Heaven Beauty collection of tints and glow.",
};

export default async function ShopPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [products, categories] = await Promise.all([
    getCatalogProducts({ country }),
    getCategories(),
  ]);

  // Only offer filter chips for categories that actually have products here.
  const present = new Set(products.map((p) => p.category?.slug));
  const availableCategories = categories
    .filter((c) => present.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl">Shop</h1>
        <p className="mt-2 text-muted">
          {products.length} product{products.length === 1 ? "" : "s"} available
          in your region.
        </p>
      </header>

      <Suspense fallback={<div className="mb-8 h-10" />}>
        <ShopFilters categories={availableCategories} />
      </Suspense>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted">
          No products are available in your region yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              data-shop-item
              data-category={product.category?.slug ?? ""}
            >
              <ProductCard product={product} countryCode={country} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
