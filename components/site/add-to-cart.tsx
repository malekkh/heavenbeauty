"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";

export interface AddToCartProduct {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
}

/**
 * Add-to-cart control. Compact button for cards; with a quantity stepper on
 * the product page. Adds to the Zustand cart scoped to the active country.
 */
export function AddToCart({
  product,
  countryCode,
  withQuantity = false,
  size = "default",
}: {
  product: AddToCartProduct;
  countryCode: string;
  withQuantity?: boolean;
  size?: "default" | "sm" | "lg";
}) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const add = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
      },
      countryCode,
      withQuantity ? qty : 1
    );
    toast.success(`${product.name} added to bag`, {
      description: withQuantity && qty > 1 ? `Quantity: ${qty}` : undefined,
    });
  };

  if (!withQuantity) {
    return (
      <Button
        onClick={add}
        size={size}
        variant="brand"
        className="w-full"
        aria-label={`Add ${product.name} to bag`}
      >
        <ShoppingBag /> Add to cart
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex h-12 items-center rounded-full border border-border bg-surface">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-12 w-12 place-items-center rounded-l-full hover:bg-foreground/5"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-base font-medium tabular-nums">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="grid h-12 w-12 place-items-center rounded-r-full hover:bg-foreground/5"
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button onClick={add} size="lg" variant="brand" className="flex-1">
        <ShoppingBag /> Add to cart
      </Button>
    </div>
  );
}
