import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/site/add-to-cart";
import { ProductGallery } from "@/components/site/product-gallery";
import { SUPPORTED_COUNTRY_CODES } from "@/lib/countries";
import {
  getCatalogProductBySlug,
  getCountryProductSlugs,
} from "@/lib/data/queries";
import { formatMoney } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { country: string; slug: string }[] = [];
  for (const country of SUPPORTED_COUNTRY_CODES) {
    const slugs = await getCountryProductSlugs(country);
    for (const slug of slugs) params.push({ country, slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}): Promise<Metadata> {
  const { country, slug } = await params;
  const product = await getCatalogProductBySlug({ country, slug });
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const product = await getCatalogProductBySlug({ country, slug });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href={`/${country}/shop`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft className="size-4" /> Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6 lg:pt-6">
          {product.category ? (
            <Badge variant="soft" className="w-fit">
              {product.category.name}
            </Badge>
          ) : null}

          <div>
            <h1 className="font-display text-4xl sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-medium text-brand">
              {formatMoney(product.price, country)}
            </p>
          </div>

          {product.description ? (
            <p className="text-lg leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}

          <div className="pt-2">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0]?.url ?? null,
                price: product.price,
              }}
              countryCode={country}
              withQuantity
            />
          </div>

          <ul className="mt-4 grid gap-2 border-t border-border pt-6 text-sm text-muted">
            <li>• 100% vegan & cruelty-free</li>
            <li>• Lightweight, buildable, long-wearing</li>
            <li>• Multi-use for lips and cheeks</li>
            <li>• Suitable for all skin types</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
