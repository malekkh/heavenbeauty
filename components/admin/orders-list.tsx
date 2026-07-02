"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MapPin, Phone, Receipt } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/admin/actions";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotifyOutcome, Order } from "@/lib/types";

const STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand text-brand-foreground",
  confirmed: "bg-accent-soft text-foreground",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
        <Receipt className="size-10 text-muted" />
        <p className="text-muted">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const fmt = (n: number) => formatMoney(n, order.country_code);
  const ref = order.id.slice(0, 8).toUpperCase();
  // Deterministic (locale-independent) so server and client render identically.
  const when = order.created_at.slice(0, 16).replace("T", " ");
  const subtotal = Number(order.subtotal) || 0;
  const delivery = Number(order.delivery) || 0;

  function onStatus(status: string) {
    if (status === order.status) return;
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, status);
        toast.success(`Order ${ref} → ${status}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg">#{ref}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                STATUS_STYLES[order.status] ?? "bg-foreground/5 text-muted"
              )}
            >
              {cap(order.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {when} · {order.country_code.toUpperCase()}
          </p>
        </div>
        <div className="w-full sm:w-44">
          <Select value={order.status} onValueChange={onStatus} disabled={pending}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {cap(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 py-4 sm:grid-cols-2">
        {/* Customer */}
        <div className="space-y-1.5 text-sm">
          <p className="font-medium">{order.customer_name}</p>
          <p className="flex items-center gap-2 text-muted">
            <Phone className="size-3.5 shrink-0" />
            <a href={`tel:${order.customer_phone}`} className="hover:text-brand">
              {order.customer_phone}
            </a>
          </p>
          <p className="flex items-center gap-2 text-muted">
            <Mail className="size-3.5 shrink-0" />
            <a
              href={`mailto:${order.customer_email}`}
              className="break-all hover:text-brand"
            >
              {order.customer_email}
            </a>
          </p>
          <p className="flex items-start gap-2 text-muted">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {order.address}, {order.city}
            </span>
          </p>
          {order.notes ? (
            <p className="text-muted">
              <span className="font-medium text-foreground">Notes:</span>{" "}
              {order.notes}
            </p>
          ) : null}
        </div>

        {/* Items + totals */}
        <div className="space-y-2 text-sm">
          <ul className="space-y-1">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex justify-between gap-3"
              >
                <span className="min-w-0">
                  {item.name}
                  <span className="text-muted"> × {item.qty}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {fmt(Number(item.price) * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-border pt-2">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="tabular-nums">{fmt(delivery)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{fmt(subtotal + delivery)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <NotifyBadge label="WhatsApp" outcome={order.notify_status?.owner_whatsapp} />
        <NotifyBadge label="Owner email" outcome={order.notify_status?.owner_email} />
        <NotifyBadge
          label="Customer email"
          outcome={order.notify_status?.customer_email}
        />
      </div>
    </div>
  );
}

function NotifyBadge({
  label,
  outcome,
}: {
  label: string;
  outcome?: NotifyOutcome;
}) {
  const status = outcome?.status ?? "—";
  const style =
    status === "sent"
      ? "bg-green-100 text-green-700"
      : status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-foreground/5 text-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        style
      )}
      title={outcome?.error ?? undefined}
    >
      {label}: {status}
    </span>
  );
}
