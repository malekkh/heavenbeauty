import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/components/admin/product-form";
import {
  getAdminCategories,
  getAdminCountries,
  getAdminProduct,
} from "@/lib/data/admin-queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, countries] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getAdminCountries(),
  ]);

  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    category_id: product.category_id ?? "",
    sort_order: product.sort_order,
    is_active: product.is_active,
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      sort_order: img.sort_order,
    })),
    // Seed a row for every country, prefilled with existing pricing.
    pricing: countries.map((c) => {
      const existing = product.pricing.find((p) => p.country_code === c.code);
      return {
        country_code: c.code,
        price: existing?.price ?? 0,
        is_available: existing?.is_available ?? false,
      };
    }),
  };

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft className="size-4" /> Products
      </Link>
      <h1 className="mb-8 font-display text-3xl">Edit product</h1>
      <ProductForm
        initial={initial}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        countries={countries.map((c) => ({
          code: c.code,
          name: c.name,
          currency_code: c.currency_code,
          currency_symbol: c.currency_symbol,
        }))}
      />
    </div>
  );
}
