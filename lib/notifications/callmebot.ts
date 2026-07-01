import "server-only";

/**
 * Owner WhatsApp alert via CallMeBot (text-only). The owner registers their
 * number once with CallMeBot to obtain the API key; messages are then sent by
 * a simple authenticated GET. SERVER ONLY — CALLMEBOT_API_KEY must never reach
 * the browser.
 *
 * Throws on any failure so the caller can record the outcome; it must never
 * take down the order (the caller wraps this in its own try/catch).
 */
export async function sendOwnerWhatsApp(args: {
  /** Recipient (owner) number, E.164 digits, no "+". */
  phone: string;
  text: string;
}): Promise<void> {
  const apikey = process.env.CALLMEBOT_API_KEY;
  if (!apikey) throw new Error("CALLMEBOT_API_KEY is not set");

  const phone = args.phone.replace(/[^\d]/g, "");
  if (!phone) throw new Error("Owner WhatsApp number is empty");

  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${encodeURIComponent(phone)}` +
    `&apikey=${encodeURIComponent(apikey)}` +
    `&text=${encodeURIComponent(args.text)}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `CallMeBot responded ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`
    );
  }
}
