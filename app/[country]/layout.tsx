import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import type { SearchItem } from "@/components/site/search-dialog";
import { SUPPORTED_COUNTRY_CODES, isSupportedCountry } from "@/lib/countries";
import {
  getActiveCountries,
  getCatalogProducts,
  getCountryByCode,
} from "@/lib/data/queries";

// Pre-render one shell per supported country; reject anything else.
export function generateStaticParams() {
  return SUPPORTED_COUNTRY_CODES.map((country) => ({ country }));
}

export const dynamicParams = false;

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!isSupportedCountry(country)) notFound();

  const [activeCountry, countries, catalog] = await Promise.all([
    getCountryByCode(country),
    getActiveCountries(),
    getCatalogProducts({ country }),
  ]);

  if (!activeCountry) notFound();

  const searchItems: SearchItem[] = catalog.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.images[0]?.url ?? null,
    price: p.price,
    category: p.category?.name ?? null,
  }));

  return (
    <>
      <SiteHeader
        country={activeCountry}
        countries={countries}
        searchItems={searchItems}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter country={activeCountry} />
      <WhatsAppFab number={activeCountry.whatsapp_number} />
    </>
  );
}
