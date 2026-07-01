import "server-only";
import { Resend } from "resend";

/**
 * Resend client for transactional order emails. SERVER ONLY — RESEND_API_KEY
 * is never exposed to the browser.
 *
 * The `from` address must be on a domain you've verified in Resend (SPF/DKIM),
 * otherwise sends are rejected in production. Override with RESEND_FROM.
 */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

/** Verified sender. Change RESEND_FROM (or this default) to your domain. */
export const ORDER_FROM =
  process.env.RESEND_FROM ?? "Heaven Beauty <orders@myheavenbeauty.com>";
