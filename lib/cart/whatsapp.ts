import { formatMoney } from "@/lib/utils";
import type { CartItem } from "./store";

interface WhatsAppArgs {
  items: CartItem[];
  countryCode: string;
  whatsappNumber: string;
  /** Currency formatting overrides from the DB country row, if available. */
  currencySymbol?: string;
  /**
   * When set, the message references an order already saved on-site (its short
   * reference) and echoes the details the customer submitted, rather than
   * prompting them to type name/address into the chat.
   */
  orderRef?: string;
  customer?: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  /** Flat delivery charge to add to the items subtotal in the message. */
  delivery?: number;
}

/**
 * Build a pre-filled WhatsApp link for the current country's number.
 *
 * Two shapes:
 *  - Legacy handoff (no `orderRef`): lists items + total and prompts the
 *    customer for their details in chat. No order is persisted.
 *  - Post-checkout confirmation (`orderRef` + `customer` set): references the
 *    order already saved on-site and echoes the submitted details, so the
 *    owner can confirm delivery quickly.
 */
export function buildWhatsAppUrl({
  items,
  countryCode,
  whatsappNumber,
  currencySymbol,
  orderRef,
  customer,
  delivery = 0,
}: WhatsAppArgs): string {
  const fmt = (n: number) =>
    formatMoney(n, countryCode, currencySymbol ? { symbol: currencySymbol } : undefined);

  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}`
  );
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + delivery;

  const message =
    orderRef && customer
      ? [
          `Hi Heaven Beauty! I just placed order ${orderRef}:`,
          "",
          ...lines,
          "",
          `Subtotal: ${fmt(subtotal)}`,
          `Delivery: ${fmt(delivery)}`,
          `Total: ${fmt(total)}`,
          "",
          "My details —",
          `Name: ${customer.name}`,
          `Delivery address: ${customer.address}, ${customer.city}`,
          `Phone: ${customer.phone}`,
        ].join("\n")
      : [
          "Hi Heaven Beauty! I'd like to place an order:",
          "",
          ...lines,
          "",
          `Total: ${fmt(total)}`,
          "",
          "My details —",
          "Name:",
          "Delivery address:",
          "Phone:",
        ].join("\n");

  const digits = whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
