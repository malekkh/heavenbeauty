import { z } from "zod";
import { SUPPORTED_COUNTRY_CODES } from "@/lib/countries";

/**
 * Checkout validation shared by the client form and the server action, so the
 * browser and `placeOrder` enforce exactly the same rules. No payments and no
 * account — just the details needed to fulfil and follow up on WhatsApp.
 */

const trimmed = z.string().trim();

/** The details the customer types into the form. */
export const checkoutFormSchema = z.object({
  customer_name: trimmed.min(1, "Enter your name").max(120),
  customer_phone: trimmed
    .min(6, "Enter a valid phone number")
    .max(30)
    .regex(/^[+\d][\d\s()-]*$/, "Enter a valid phone number"),
  customer_email: trimmed.email("Enter a valid email").max(160),
  address: trimmed.min(1, "Enter your delivery address").max(300),
  city: trimmed.min(1, "Enter your city").max(120),
  notes: trimmed.max(1000).optional().or(z.literal("")),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** A cart line submitted with the order. Prices are re-verified server-side. */
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1).max(200),
  qty: z.number().int().positive().max(999),
  price: z.number().nonnegative(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

/** Full payload accepted by the `placeOrder` server action. */
export const placeOrderSchema = checkoutFormSchema.extend({
  country_code: z
    .string()
    .toLowerCase()
    .refine((c) => SUPPORTED_COUNTRY_CODES.includes(c), "Unsupported country"),
  items: z.array(orderItemSchema).min(1, "Your cart is empty"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
