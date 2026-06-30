import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Heaven Beauty collects, uses and protects your information.",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect the details you share when you place an order over WhatsApp — such as your name, delivery address and phone number — solely to fulfil and deliver your order.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process orders, arrange delivery, and respond to your enquiries. We do not sell your personal information to third parties.",
  },
  {
    title: "Browsing & Cookies",
    body: "We store a small cookie to remember your selected country so we can show the right products, prices and currency. No customer account is created and we do not track you across other sites.",
  },
  {
    title: "Data Sharing",
    body: "We only share what is necessary with delivery partners to get your order to you. We never share your details for marketing without your consent.",
  },
  {
    title: "Contact Us",
    body: `For any privacy questions or requests, contact us at ${SITE.email}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <header>
        <h1 className="font-display text-5xl sm:text-6xl">Privacy Policy</h1>
        <p className="mt-3 text-muted">
          Your privacy matters to us. This policy explains what we collect and
          why.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-2xl">{s.title}</h2>
            <p className="mt-2 text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
