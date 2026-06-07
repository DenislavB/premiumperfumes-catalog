import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const serialized = {
    ...product,
    variants: Array.isArray(product.variants) ? product.variants : [],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductDetailClient product={serialized as any} locale={locale} />;
}
