"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/config";
import { placeOrderSchema, type PlaceOrderInput } from "@/lib/checkout/schema";
import { sendOwnerWhatsApp } from "@/lib/notifications/callmebot";
import { getResend, ORDER_FROM } from "@/lib/notifications/resend";
import { OrderOwnerEmail } from "@/emails/order-owner-email";
import { OrderCustomerEmail } from "@/emails/order-customer-email";
import { formatMoney } from "@/lib/utils";
import type { NotifyOutcome, NotifyStatus, OrderItem } from "@/lib/types";

const now = () => new Date().toISOString();
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Place an on-site order.
 *
 * The database insert is the SOURCE OF TRUTH: it happens first with the
 * service-role client, and it is the only step whose failure fails the whole
 * request. The three notifications each run in isolation afterwards — one
 * failing never loses the saved order nor blocks the others — and their
 * outcomes are recorded back onto the order's `notify_status`.
 */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ orderId: string }> {
  // 1. Validate — same rules the browser enforced.
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Please check your details."
    );
  }
  const data = parsed.data;

  if (!hasServiceRole()) {
    throw new Error(
      "Checkout isn't available: SUPABASE_SERVICE_ROLE_KEY is not set on the server."
    );
  }
  const admin = createAdminClient();

  // 2. Load the country (currency + WhatsApp number to notify).
  const { data: country, error: countryError } = await admin
    .from("countries")
    .select("code, currency_code, whatsapp_number")
    .eq("code", data.country_code)
    .single();
  if (countryError || !country) {
    // Logged server-side so the real cause is visible in the platform logs —
    // production redacts thrown Server Action messages to a generic digest.
    console.error("[checkout] country lookup failed:", countryError?.message);
    throw new Error("We couldn't find that country. Please try again.");
  }

  // 3. Re-price against the DB so the stored total is authoritative, not
  //    whatever the browser sent. Missing rows fall back to the submitted
  //    price so an order is never lost over a since-deleted product.
  const { data: priceRows } = await admin
    .from("product_country")
    .select("product_id, price")
    .eq("country_code", data.country_code)
    .in(
      "product_id",
      data.items.map((i) => i.productId)
    );
  const priceMap = new Map<string, number>(
    (priceRows ?? []).map((r) => [r.product_id as string, Number(r.price)])
  );

  const items: OrderItem[] = data.items.map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    qty: i.qty,
    price: round2(priceMap.get(i.productId) ?? i.price),
  }));
  const subtotal = round2(
    items.reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  const currency = country.currency_code as string;

  // 4. Insert the order — the one step allowed to fail the request.
  const { data: order, error: insertError } = await admin
    .from("orders")
    .insert({
      country_code: data.country_code,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      address: data.address,
      city: data.city,
      notes: data.notes ? data.notes : null,
      items,
      subtotal,
      currency,
    })
    .select("id")
    .single();
  if (insertError || !order) {
    console.error("[checkout] order insert failed:", insertError?.message);
    throw new Error("We couldn't save your order. Please try again.");
  }
  const orderId = order.id as string;

  // 5. Notifications — each isolated; failures are recorded, never thrown.
  const notify: NotifyStatus = {};
  const ref = orderId.slice(0, 8).toUpperCase();
  const fmt = (n: number) => formatMoney(n, data.country_code);

  // 5a. Owner WhatsApp (CallMeBot), text-only summary.
  notify.owner_whatsapp = await run(async () => {
    const text = [
      `New order ${ref}`,
      `Name: ${data.customer_name}`,
      `Phone: ${data.customer_phone}`,
      `City: ${data.city}`,
      `Total: ${fmt(subtotal)}`,
      `Order id: ${orderId}`,
    ].join("\n");
    await sendOwnerWhatsApp({
      phone: country.whatsapp_number as string,
      text,
    });
  });

  // 5b. Owner email (Resend) — full order for fulfilment. Single fixed
  //     recipient for all countries, set via OWNER_EMAIL (server only).
  const ownerEmail = process.env.OWNER_EMAIL?.trim();
  notify.owner_email = ownerEmail
    ? await run(async () => {
        const { data: sent, error } = await getResend().emails.send({
          from: ORDER_FROM,
          to: [ownerEmail],
          subject: `New order ${ref} — ${data.customer_name} (${data.city})`,
          react: OrderOwnerEmail({
            orderId,
            countryCode: data.country_code,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerEmail: data.customer_email,
            address: data.address,
            city: data.city,
            notes: data.notes,
            items,
            subtotal,
          }),
        });
        if (error) throw new Error(error.message);
        return sent?.id;
      })
    : { status: "skipped", error: "OWNER_EMAIL is not set", at: now() };

  // 5c. Customer email (Resend) — branded confirmation.
  notify.customer_email = await run(async () => {
    const { data: sent, error } = await getResend().emails.send({
      from: ORDER_FROM,
      to: [data.customer_email],
      subject: `Your Heaven Beauty order ${ref}`,
      react: OrderCustomerEmail({
        orderId,
        countryCode: data.country_code,
        customerName: data.customer_name,
        address: data.address,
        city: data.city,
        phone: data.customer_phone,
        items,
        subtotal,
      }),
    });
    if (error) throw new Error(error.message);
    return sent?.id;
  });

  // 6. Persist notification outcomes. Best-effort — the order is already
  //    saved, so a failure here must not surface to the customer.
  try {
    await admin.from("orders").update({ notify_status: notify }).eq("id", orderId);
  } catch {
    // swallow — notify_status is diagnostic only.
  }

  return { orderId };
}

/**
 * Run one notification, converting success/throw into a NotifyOutcome. The
 * optional return value becomes the provider id (e.g. Resend message id).
 */
async function run(
  fn: () => Promise<string | undefined | void>
): Promise<NotifyOutcome> {
  try {
    const id = await fn();
    return { status: "sent", ...(id ? { id } : {}), at: now() };
  } catch (e) {
    return {
      status: "failed",
      error: e instanceof Error ? e.message : "Unknown error",
      at: now(),
    };
  }
}
