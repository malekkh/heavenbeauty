"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { AddToCart } from "./add-to-cart";

/**
 * Catalog product card — image, name, per-country price, add to cart.
 * Server component; only the Add button hydrates on the client.
 */
export function ProductCard({
  product,
  countryCode,
  priority = false,
}: {
  product: CatalogProduct;
  countryCode: string;
  priority?: boolean;
}) {
  const image = product.images[0]?.url ?? null;
  const href = `/${countryCode}/product/${product.slug}`;

  return (
    <div className="group flex flex-col">
      <Link
        href={href}
        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface"
      >
        {image ? (
          <Image
            src={image}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 80vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-accent-soft text-sm text-muted">
            {product.name}
          </div>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-display text-lg leading-tight">
            <Link href={href} className="hover:text-brand">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-medium text-muted">
            {formatMoney(product.price, countryCode)}
          </p>
        </div>
        <AddToCart
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            image,
            price: product.price,
          }}
          countryCode={countryCode}
        />
      </div>
    </div>
  );
}
