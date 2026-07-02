import Link from "next/link";
import { Package, Tags, Globe, Plus, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAdminCategories,
  getAdminCountries,
  getAdminOrders,
  getAdminProducts,
} from "@/lib/data/admin-queries";

export default async function AdminDashboard() {
  const [products, categories, countries, orders] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminCountries(),
    getAdminOrders(),
  ]);

  const activeProducts = products.filter((p) => p.is_active).length;
  const newOrders = orders.filter((o) => o.status === "new").length;

  const stats = [
    {
      label: "Orders",
      value: orders.length,
      sub: `${newOrders} new`,
      icon: Receipt,
      href: "/admin/orders",
    },
    {
      label: "Products",
      value: products.length,
      sub: `${activeProducts} active`,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: categories.length,
      sub: `${categories.filter((c) => c.is_active).length} active`,
      icon: Tags,
      href: "/admin/categories",
    },
    {
      label: "Countries",
      value: countries.length,
      sub: `${countries.filter((c) => c.is_active).length} active`,
      icon: Globe,
      href: "/admin/countries",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="text-muted">Manage your catalog and storefront.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-brand/40">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-1 font-display text-3xl">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.sub}</p>
                </div>
                <div className="grid size-12 place-items-center rounded-full bg-accent-soft text-brand">
                  <stat.icon className="size-6" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
