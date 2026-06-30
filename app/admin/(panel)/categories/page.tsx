import { CategoriesManager } from "@/components/admin/categories-manager";
import { getAdminCategories } from "@/lib/data/admin-queries";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Categories</h1>
        <p className="text-muted">
          Organize products into collections shown across the storefront.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
