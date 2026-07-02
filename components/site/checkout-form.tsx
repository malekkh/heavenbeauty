"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCart,
  selectSubtotal,
  type CartItem,
} from "@/lib/cart/store";
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp";
import { checkoutFormSchema } from "@/lib/checkout/schema";
import { placeOrder } from "@/app/[country]/checkout/actions";
import { formatMoney } from "@/lib/utils";
import type { Country } from "@/lib/types";

type FormState = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  notes: string;
};

const EMPTY: FormState = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  address: "",
  city: "",
  notes: "",
};

/** A confirmed order kept in local state so the success screen survives the
 *  cart being cleared. */
type Placed = {
  orderId: string;
  items: CartItem[];
  form: FormState;
};

export function CheckoutForm({ country }: { country: Country }) {
  const hasHydrated = useCart((s) => s.hasHydrated);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);

  // numeric columns can arrive as strings from the API — coerce once.
  const delivery = Number(country.delivery_rate) || 0;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = checkoutFormSchema.safeParse(form);
    if (!result.success) {
      const next: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    // Snapshot the cart before the async call so the success screen + WhatsApp
    // link keep working after we clear it.
    const snapshot = items;

    startTransition(async () => {
      try {
        const { orderId } = await placeOrder({
          ...result.data,
          notes: result.data.notes || undefined,
          country_code: country.code,
          items: snapshot.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
        });
        setPlaced({ orderId, items: snapshot, form });
        clear();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong."
        );
      }
    });
  }

  // -- Success -------------------------------------------------------------
  if (placed) {
    const ref = placed.orderId.slice(0, 8).toUpperCase();
    const waUrl = buildWhatsAppUrl({
      items: placed.items,
      countryCode: country.code,
      whatsappNumber: country.whatsapp_number,
      currencySymbol: country.currency_symbol,
      delivery,
      orderRef: ref,
      customer: {
        name: placed.form.customer_name,
        phone: placed.form.customer_phone,
        address: placed.form.address,
        city: placed.form.city,
      },
    });

    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-whatsapp" />
        <h2 className="mt-4 font-display text-2xl">Order placed 🤍</h2>
        <p className="mt-2 text-muted">
          Thank you! We&apos;ve emailed your confirmation. Your order reference
          is:
        </p>
        <p className="mt-3 text-lg font-semibold tracking-wide">{ref}</p>
        <p className="mt-4 text-sm text-muted">
          Continue on WhatsApp to confirm delivery and payment with our team.
        </p>
        <Button asChild variant="whatsapp" size="lg" className="mt-6 w-full">
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            Continue on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href={`/${country.code}/shop`}>Continue shopping</Link>
        </Button>
      </div>
    );
  }

  // -- Empty cart ----------------------------------------------------------
  if (hasHydrated && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-border bg-surface p-10 text-center">
        <ShoppingBag className="size-10 text-muted" />
        <p className="text-muted">Your bag is empty.</p>
        <Button asChild>
          <Link href={`/${country.code}/shop`}>Browse the shop</Link>
        </Button>
      </div>
    );
  }

  // -- Form + summary ------------------------------------------------------
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="customer_name"
            label="Full name"
            value={form.customer_name}
            error={errors.customer_name}
            onChange={(v) => set("customer_name", v)}
            autoComplete="name"
          />
          <FormField
            id="customer_phone"
            label="Phone"
            type="tel"
            value={form.customer_phone}
            error={errors.customer_phone}
            onChange={(v) => set("customer_phone", v)}
            autoComplete="tel"
          />
        </div>
        <FormField
          id="customer_email"
          label="Email"
          type="email"
          value={form.customer_email}
          error={errors.customer_email}
          onChange={(v) => set("customer_email", v)}
          autoComplete="email"
        />
        <FormField
          id="address"
          label="Delivery address"
          value={form.address}
          error={errors.address}
          onChange={(v) => set("address", v)}
          autoComplete="street-address"
        />
        <FormField
          id="city"
          label="City"
          value={form.city}
          error={errors.city}
          onChange={(v) => set("city", v)}
          autoComplete="address-level2"
        />
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Landmark, preferred delivery time, anything else…"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || (hasHydrated && items.length === 0)}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Place order
        </Button>
      </form>

      {/* Cart summary */}
      <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl">Your order</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-start justify-between gap-3 py-3 text-sm"
            >
              <span className="flex-1">
                {item.name}
                <span className="text-muted"> × {item.qty}</span>
              </span>
              <span className="font-medium tabular-nums">
                {formatMoney(item.price * item.qty, country.code)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="tabular-nums">
              {formatMoney(subtotal, country.code)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Delivery</span>
            <span className="tabular-nums">
              {formatMoney(delivery, country.code)}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-muted">Total</span>
          <span className="font-display text-xl font-semibold">
            {formatMoney(subtotal + delivery, country.code)}
          </span>
        </div>
      </aside>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: keyof FormState;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
