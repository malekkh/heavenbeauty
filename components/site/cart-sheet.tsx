"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, selectCount, selectSubtotal } from "@/lib/cart/store";
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp";
import { formatMoney } from "@/lib/utils";
import type { Country } from "@/lib/types";

/**
 * Cart trigger (with live count) + slide-over drawer. Reads the persisted
 * Zustand cart; checkout opens a pre-filled WhatsApp chat to the active
 * country's number. Hydration-safe: the count only renders post-rehydrate.
 */
export function CartSheet({ country }: { country: Country }) {
  const hasHydrated = useCart((s) => s.hasHydrated);
  const items = useCart((s) => s.items);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  const checkoutUrl =
    items.length > 0
      ? buildWhatsAppUrl({
          items,
          countryCode: country.code,
          whatsappNumber: country.whatsapp_number,
          currencySymbol: country.currency_symbol,
        })
      : "#";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Open bag${hasHydrated && count > 0 ? `, ${count} items` : ""}`}
        >
          <ShoppingBag className="size-5" />
          {hasHydrated && count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-brand-foreground">
              {count}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Your Bag{hasHydrated && count > 0 ? ` (${count})` : ""}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted" />
            <p className="text-muted">Your bag is empty.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-muted hover:text-brand"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {formatMoney(item.price, country.code)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        onClick={() =>
                          updateQty(item.productId, item.qty - 1)
                        }
                        className="grid size-8 place-items-center rounded-l-full hover:bg-foreground/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.productId, item.qty + 1)
                        }
                        className="grid size-8 place-items-center rounded-r-full hover:bg-foreground/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatMoney(item.price * item.qty, country.code)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 ? (
          <SheetFooter className="flex-col gap-3">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-xl font-semibold">
                {formatMoney(subtotal, country.code)}
              </span>
            </div>
            <Button asChild variant="whatsapp" size="lg" className="w-full">
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                Checkout on WhatsApp
              </a>
            </Button>
            <p className="text-center text-xs text-muted">
              You&apos;ll confirm your order and delivery details over chat.
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
