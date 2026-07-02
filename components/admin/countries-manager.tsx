"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCountry, type CountryInput } from "@/app/admin/actions";
import type { Country } from "@/lib/types";

export function CountriesManager({ countries }: { countries: Country[] }) {
  return (
    <div className="space-y-4">
      {countries.map((country) => (
        <CountryCard key={country.code} country={country} />
      ))}
    </div>
  );
}

function CountryCard({ country }: { country: Country }) {
  const router = useRouter();
  const [form, setForm] = useState<CountryInput>({
    code: country.code,
    name: country.name,
    currency_code: country.currency_code,
    currency_symbol: country.currency_symbol,
    whatsapp_number: country.whatsapp_number,
    delivery_rate: country.delivery_rate,
    is_active: country.is_active,
  });
  const [pending, startTransition] = useTransition();

  function set<K extends keyof CountryInput>(key: K, value: CountryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveCountry(form);
        toast.success(`${form.name} updated`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl">
          {country.name}{" "}
          <span className="text-sm uppercase text-muted">{country.code}</span>
        </h2>
        {country.is_default ? (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-brand">
            Default
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Currency code">
          <Input
            value={form.currency_code}
            onChange={(e) => set("currency_code", e.target.value)}
          />
        </Field>
        <Field label="Currency symbol">
          <Input
            value={form.currency_symbol}
            onChange={(e) => set("currency_symbol", e.target.value)}
          />
        </Field>
        <Field label="Delivery rate">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{form.currency_symbol}</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.delivery_rate}
              onChange={(e) =>
                set("delivery_rate", Number(e.target.value))
              }
            />
          </div>
        </Field>
        <Field label="WhatsApp number">
          <Input
            value={form.whatsapp_number}
            onChange={(e) => set("whatsapp_number", e.target.value)}
            placeholder="96178835078"
          />
        </Field>
        <div className="flex items-end justify-between gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="size-4 accent-[var(--brand)]"
            />
            Active
          </label>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
