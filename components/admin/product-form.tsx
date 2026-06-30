"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { saveProduct, type ProductInput } from "@/app/admin/actions";

interface FormImage {
  url: string;
  alt: string | null;
  sort_order: number;
}
interface FormPricing {
  country_code: string;
  price: number;
  is_available: boolean;
}

export interface ProductFormInitial {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  sort_order: number;
  is_active: boolean;
  images: FormImage[];
  pricing: FormPricing[];
}

export function ProductForm({
  initial,
  categories,
  countries,
}: {
  initial: ProductFormInitial;
  categories: { id: string; name: string }[];
  countries: {
    code: string;
    name: string;
    currency_code: string;
    currency_symbol: string;
  }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInitial>(initial);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof ProductFormInitial>(
    key: K,
    value: ProductFormInitial[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugEdited ? f.slug : slugify(name),
    }));
  }

  function setPricing(code: string, patch: Partial<FormPricing>) {
    setForm((f) => ({
      ...f,
      pricing: f.pricing.map((p) =>
        p.country_code === code ? { ...p, ...patch } : p
      ),
    }));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${form.slug || crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      setForm((f) => ({
        ...f,
        images: [
          ...f.images,
          { url: data.publicUrl, alt: f.name, sort_order: f.images.length + 1 },
        ],
      }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i.url !== url) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const input: ProductInput = {
        id: form.id,
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        images: form.images,
        pricing: form.pricing.map((p) => ({
          country_code: p.country_code,
          price: Number(p.price) || 0,
          is_available: p.is_available,
        })),
      };
      await saveProduct(input);
      toast.success("Product saved");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", slugify(e.target.value));
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </section>

        {/* Images */}
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <Label>Images</Label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-accent-soft">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {form.images.length === 0 ? (
            <p className="text-sm text-muted">No images yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((img) => (
                <div
                  key={img.url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.url)}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted">
            Images are stored in the public <code>product-images</code> bucket.
          </p>
        </section>

        {/* Per-country pricing */}
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <Label>Pricing &amp; availability by country</Label>
          <div className="space-y-3">
            {form.pricing.map((p) => {
              const country = countries.find((c) => c.code === p.country_code);
              return (
                <div
                  key={p.country_code}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">{country?.name}</p>
                    <p className="text-xs text-muted">
                      {country?.currency_code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">
                      {country?.currency_symbol}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={p.price}
                      onChange={(e) =>
                        setPricing(p.country_code, {
                          price: Number(e.target.value),
                        })
                      }
                      className="w-28"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={p.is_available}
                      onChange={(e) =>
                        setPricing(p.country_code, {
                          is_available: e.target.checked,
                        })
                      }
                      className="size-4 accent-[var(--brand)]"
                    />
                    Available
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category_id || "none"}
              onValueChange={(v) => set("category_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">Sort order</Label>
            <Input
              id="sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="size-4 accent-[var(--brand)]"
            />
            Active (visible on storefront)
          </label>
        </section>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving || uploading} className="flex-1">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
