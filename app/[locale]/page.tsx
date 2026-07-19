import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";
import { COMPANY } from "@/lib/legalContent";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const bg = locale === "bg";
  return {
    title: bg
      ? "Арабски, дизайнерски и нишови парфюми и отливки"
      : "Arabian, designer and niche perfumes & decants",
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        bg: `${BASE}/bg`,
        en: `${BASE}/en`,
        "x-default": `${BASE}/bg`,
      },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const rawProducts = await prisma.product.findMany({
    where: { available: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = rawProducts.map((p: any) => ({
    ...p,
    variants: Array.isArray(p.variants) ? p.variants : [],
  }));

  // Organization / LocalBusiness structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Premium Perfumes",
    image: `${BASE}/opengraph-image`,
    "@id": BASE,
    url: BASE,
    telephone: "",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "бул. „Цар Освободител“ 91",
      addressLocality: "Кюстендил",
      addressCountry: "BG",
    },
    legalName: COMPANY.name,
    taxID: COMPANY.eik,
    sameAs: [BASE],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CatalogClient products={products} locale={locale} />
    </>
  );
}
