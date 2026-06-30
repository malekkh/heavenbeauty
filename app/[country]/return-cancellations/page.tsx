import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Cancellations",
  description: "Heaven Beauty returns, exchanges and order cancellation policy.",
};

const SECTIONS = [
  {
    title: "Returns & Exchanges",
    body: "For hygiene and safety reasons, we do not accept returns or exchanges on any products once purchased.",
  },
  {
    title: "Order Cancellations",
    body: "Orders may only be canceled within a short time after being placed. Once an order has been processed or shipped, it can no longer be canceled.",
  },
  {
    title: "Damaged or Incorrect Orders",
    body: "If you receive a damaged or incorrect item, please contact us within 48 hours of delivery. Our team will review your request and assist you accordingly.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header>
        <h1 className="font-display text-5xl sm:text-6xl">
          Returns &amp; Cancellations
        </h1>
      </header>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section
            key={s.title}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <h2 className="font-display text-2xl">{s.title}</h2>
            <p className="mt-3 text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
