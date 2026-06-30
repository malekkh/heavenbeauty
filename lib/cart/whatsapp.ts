import { formatMoney } from "@/lib/utils";
import type { CartItem } from "./store";

interface WhatsAppArgs {
  items: CartItem[];
  countryCode: string;
  whatsappNumber: string;
  /** Currency formatting overrides from the DB country row, if available. */
  currencySymbol?: string;
}

/**
 * Build a pre-filled WhatsApp checkout link for the current country's number.
 * Lists each line item, the total, and prompts the customer for name/address.
 * No order is persisted server-side — checkout happens entirely over chat.
 */
export function buildWhatsAppUrl({
  items,
  countryCode,
  whatsappNumber,
  currencySymbol,
}: WhatsAppArgs): string {
  const fmt = (n: number) =>
    formatMoney(n, countryCode, currencySymbol ? { symbol: currencySymbol } : undefined);

  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}`
  );
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const message = [
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
