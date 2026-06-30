import { CountriesManager } from "@/components/admin/countries-manager";
import { getAdminCountries } from "@/lib/data/admin-queries";

export default async function AdminCountriesPage() {
  const countries = await getAdminCountries();
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Countries</h1>
        <p className="text-muted">
          Set each region&apos;s currency and WhatsApp checkout number. Per-product
          prices are edited on each product.
        </p>
      </div>
      <CountriesManager countries={countries} />
    </div>
  );
}
