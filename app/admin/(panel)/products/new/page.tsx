import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/components/admin/product-form";
import {
  getAdminCategories,
  getAdminCountries,
} from "@/lib/data/admin-queries";

export default async function NewProductPage() {
  const [categories, countries] = await Promise.all([
    getAdminCategories(),
    getAdminCountries(),
  ]);

  const initial: ProductFormInitial = {
    slug: "",
    name: "",
    description: "",
    category_id: "",
    sort_order: 0,
    is_active: true,
    images: [],
    pricing: countries.map((c) => ({
      country_code: c.code,
      price: 0,
      is_available: false,
    })),
  };

  return (
    <div className="max-w-5xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft className="size-4" /> Products
      </Link>
      <h1 className="mb-8 font-display text-3xl">New product</h1>
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
