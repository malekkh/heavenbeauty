import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupportedCountry } from "@/lib/countries";
import { getCheckoutCountries } from "@/lib/data/queries";
import { CheckoutForm } from "@/components/site/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!isSupportedCountry(country)) notFound();

  const countries = await getCheckoutCountries();
  const initial = countries.find((c) => c.code === country.toLowerCase());
  if (!initial) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-muted">
        Fill in your details and place your order. We&apos;ll confirm delivery
        with you on WhatsApp.
      </p>
      <div className="mt-8">
        <CheckoutForm countries={countries} initialCountryCode={initial.code} />
      </div>
    </div>
  );
}
