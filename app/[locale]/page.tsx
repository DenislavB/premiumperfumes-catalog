import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });

  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return <CatalogClient products={products} locale={locale} />;
}
