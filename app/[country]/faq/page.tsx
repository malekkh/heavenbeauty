import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Heaven Beauty orders and products.",
};

const SECTIONS = [
  {
    title: "Orders",
    items: [
      {
        q: "What if the item I want is out of stock?",
        a: "During our sale, products sell out fast! If the item you're looking for is out of stock, keep checking back — we're always updating and restocking with your faves.",
      },
      {
        q: "How do I track my order?",
        a: "When your order is shipped from our warehouse, we'll send you a confirmation with your shipment details.",
      },
      {
        q: "How do I change or cancel my order?",
        a: "We do not normally accept order cancellations or changes once an order has been processed. Reach out on WhatsApp as soon as possible and we'll do our best to help.",
      },
    ],
  },
  {
    title: "Products",
    items: [
      {
        q: "Are your products vegan and cruelty-free?",
        a: "Yes — all Heaven Beauty products are 100% vegan and cruelty-free. We never test on animals and are committed to conscious beauty.",
      },
      {
        q: "Can I use the tints on both lips and cheeks?",
        a: "Absolutely. Our tints are designed as multi-use essentials, perfect for both lips and cheeks for an effortless, natural glow.",
      },
      {
        q: "Are your tints long-lasting?",
        a: "Yes — our formulas are lightweight yet long-wearing, designed to stay fresh and radiant throughout the day.",
      },
      {
        q: "Are your products suitable for all skin types?",
        a: "Our tints are created to suit all skin types, offering buildable color that blends seamlessly into your natural complexion.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header className="text-center">
        <h1 className="font-display text-5xl sm:text-6xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-muted">
          If you have other questions we weren&apos;t able to address here, feel
          free to email us.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 font-display text-2xl text-brand">
              {section.title}
            </h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {section.items.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <span className="text-brand transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
