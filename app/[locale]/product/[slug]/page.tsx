import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { CATEGORY_SLUGS, CATEGORY_COPY, type CategoryKey } from "@/lib/categories";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Продукт" };

  const bg = locale === "bg";
  // Localized title so the BG and EN pages aren't seen as duplicates by Google
  const title = bg
    ? `${product.name} — ${product.brand} | Парфюм и отливки`
    : `${product.name} — ${product.brand} | Perfume & decants`;
  const desc =
    (bg ? product.descriptionBg : product.description)?.slice(0, 160) ||
    (bg
      ? `${product.name} от ${product.brand}. Оригинален парфюм и отливки. Доставка в цяла България.`
      : `${product.name} by ${product.brand}. Original perfume and decants. Delivery across Bulgaria.`);
  const url = `${BASE}/${locale}/product/${slug}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        bg: `${BASE}/bg/product/${slug}`,
        en: `${BASE}/en/product/${slug}`,
        "x-default": `${BASE}/bg/product/${slug}`,
      },
    },
    openGraph: {
      // Next's metadata types don't allow og:type "product"; the Product JSON-LD
      // below is what Google actually reads for rich results anyway.
      type: "website",
      title,
      description: desc,
      url,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const bg = locale !== "en";
  const categoryKey = (product.category || "arabian") as CategoryKey;
  const categorySlug = CATEGORY_SLUGS[categoryKey] ?? CATEGORY_SLUGS.arabian;
  const categoryName = CATEGORY_COPY[bg ? "bg" : "en"][categoryKey]?.heading ?? "";

  // Related products keep each page from being a dead end for crawlers and
  // give the visitor somewhere to go other than back.
  const rawRelated = await prisma.product.findMany({
    where: { category: categoryKey, available: true, NOT: { id: product.id } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = rawRelated.map((p: any) => ({
    ...p,
    variants: Array.isArray(p.variants) ? p.variants : [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serialized = {
    ...product,
    variants: Array.isArray(product.variants) ? product.variants : [],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  // Product structured data (JSON-LD) for Google rich results
  const variants = Array.isArray(product.variants) ? (product.variants as { size: string; price: number }[]) : [];
  const prices = variants.length ? variants.map(v => v.price) : [product.price];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: (locale === "bg" ? product.descriptionBg : product.description) || product.name,
    image: product.images,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE}/${locale}/product/${slug}`,
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: bg ? "Начало" : "Home", item: `${BASE}/${locale}` },
      { "@type": "ListItem", position: 2, name: categoryName, item: `${BASE}/${locale}/category/${categorySlug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${BASE}/${locale}/product/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProductDetailClient
        product={serialized as any}
        locale={locale}
        categorySlug={categorySlug}
        categoryName={categoryName}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        related={related as any}
      />
    </>
  );
}
