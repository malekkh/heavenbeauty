"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart, selectSubtotal, type CartItem } from "@/lib/cart/store";
import { buildWhatsAppUrl } from "@/lib/cart/whatsapp";
import { checkoutFormSchema } from "@/lib/checkout/schema";
import { placeOrder } from "@/app/[country]/checkout/actions";
import { formatMoney } from "@/lib/utils";
import type { Country } from "@/lib/types";

type FormState = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  country_code: string;
  governorate: string; // governorate id ("" when none / not selected)
  city: string;
  address: string;
  postal_code: string;
  notes: string;
};

type Placed = {
  orderId: string;
  items: CartItem[];
  form: FormState;
  country: Country;
  governorateName: string;
  delivery: number;
};

export function CheckoutForm({
  countries,
  initialCountryCode,
}: {
  countries: Country[];
  initialCountryCode: string;
}) {
  const hasHydrated = useCart((s) => s.hasHydrated);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    country_code: initialCountryCode,
    governorate: "",
    city: "",
    address: "",
    postal_code: "",
    notes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [pending, startTransition] = useTransition();

  const country = useMemo(
    () =>
      countries.find((c) => c.code === form.country_code) ??
      countries.find((c) => c.code === initialCountryCode) ??
      countries[0],
    [countries, form.country_code, initialCountryCode]
  );

  if (!country) return null;

  const governorates = country.governorates ?? [];
  const hasGovernorates = governorates.length > 0;
  const selectedGov = governorates.find((g) => g.id === form.governorate);
  const delivery = hasGovernorates
    ? Number(selectedGov?.delivery_rate) || 0
    : Number(country?.delivery_rate) || 0;

  const fmt = (n: number) =>
    formatMoney(n, country.code, { symbol: country.currency_symbol });

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onCountryChange(code: string) {
    // Reset the governorate — it belongs to the previous country.
    setForm((f) => ({ ...f, country_code: code, governorate: "" }));
    setErrors((e) => ({ ...e, country_code: undefined, governorate: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = checkoutFormSchema.safeParse(form);
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key && !next[key]) next[key] = issue.message;
      }
    }
    // Governorate is required only when the country has governorates.
    if (hasGovernorates && !form.governorate) {
      next.governorate = "Select your governorate";
    }
    if (!result.success || Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    const snapshot = items;
    const govName = selectedGov?.name ?? "";
    const placedCountry = country;
    const placedDelivery = delivery;

    startTransition(async () => {
      try {
        const { orderId } = await placeOrder({
          ...result.data,
          governorate: form.governorate || undefined,
          postal_code: result.data.postal_code || undefined,
          notes: result.data.notes || undefined,
          items: snapshot.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
        });
        setPlaced({
          orderId,
          items: snapshot,
          form,
          country: placedCountry,
          governorateName: govName,
          delivery: placedDelivery,
        });
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
      countryCode: placed.country.code,
      whatsappNumber: placed.country.whatsapp_number,
      currencySymbol: placed.country.currency_symbol,
      delivery: placed.delivery,
      orderRef: ref,
      customer: {
        name: placed.form.customer_name,
        phone: placed.form.customer_phone,
        address: placed.form.address,
        city: placed.form.city,
        governorate: placed.governorateName || undefined,
        postalCode: placed.form.postal_code || undefined,
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
          <Link href={`/${placed.country.code}/shop`}>Continue shopping</Link>
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

        {/* Address — Country, Governorate (conditional), City, Address, Postal */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="country_code">Country</Label>
            <Select value={form.country_code} onValueChange={onCountryChange}>
              <SelectTrigger id="country_code">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country_code ? (
              <p className="text-xs text-red-600" role="alert">
                {errors.country_code}
              </p>
            ) : null}
          </div>

          {hasGovernorates ? (
            <div className="space-y-1.5">
              <Label htmlFor="governorate">Governorate</Label>
              <Select
                value={form.governorate}
                onValueChange={(v) => {
                  set("governorate", v);
                  setErrors((e) => ({ ...e, governorate: undefined }));
                }}
              >
                <SelectTrigger id="governorate" aria-invalid={!!errors.governorate}>
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {governorates.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.governorate ? (
                <p className="text-xs text-red-600" role="alert">
                  {errors.governorate}
                </p>
              ) : null}
            </div>
          ) : null}

          <FormField
            id="city"
            label="City"
            value={form.city}
            error={errors.city}
            onChange={(v) => set("city", v)}
            autoComplete="address-level2"
          />
          <FormField
            id="postal_code"
            label="Postal code (optional)"
            value={form.postal_code}
            error={errors.postal_code}
            onChange={(v) => set("postal_code", v)}
            autoComplete="postal-code"
          />
        </div>

        <FormField
          id="address"
          label="Delivery address"
          value={form.address}
          error={errors.address}
          onChange={(v) => set("address", v)}
          autoComplete="street-address"
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
                {fmt(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">
              Delivery
              {hasGovernorates && !selectedGov ? (
                <span className="text-xs"> (select governorate)</span>
              ) : null}
            </span>
            <span className="tabular-nums">{fmt(delivery)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-muted">Total</span>
          <span className="font-display text-xl font-semibold">
            {fmt(subtotal + delivery)}
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
