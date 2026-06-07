import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });

  const rawProducts = await prisma.product.findMany({
    where: { available: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = rawProducts.map((p: any) => ({
    ...p,
    variants: Array.isArray(p.variants) ? p.variants : [],
  }));

  return <CatalogClient products={products} locale={locale} />;
}
