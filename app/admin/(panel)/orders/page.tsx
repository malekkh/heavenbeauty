import { OrdersList } from "@/components/admin/orders-list";
import { getAdminOrders } from "@/lib/data/admin-queries";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-muted">
          {orders.length} total
          {newCount > 0 ? ` · ${newCount} new` : ""} · newest first
        </p>
      </div>
      <OrdersList orders={orders} />
    </div>
  );
}
