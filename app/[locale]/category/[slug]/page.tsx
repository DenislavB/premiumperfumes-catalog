import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_SLUGS, CATEGORY_COPY, SLUG_TO_CATEGORY } from "@/lib/categories";

const BASE = "https://premiumperfumes.bg";

/** Pre-render all three categories in both languages. */
export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).flatMap(slug =>
    ["bg", "en"].map(locale => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const key = SLUG_TO_CATEGORY[slug];
  if (!key) return { title: "Категория" };

  const copy = CATEGORY_COPY[locale === "en" ? "en" : "bg"][key];
  const url = `${BASE}/${locale}/category/${slug}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: {
        bg: `${BASE}/bg/category/${slug}`,
        en: `${BASE}/en/category/${slug}`,
        "x-default": `${BASE}/bg/category/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
      url,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const key = SLUG_TO_CATEGORY[slug];
  if (!key) notFound();

  const bg = locale !== "en";
  const copy = CATEGORY_COPY[bg ? "bg" : "en"][key];

  const raw = await prisma.product.findMany({
    where: { category: key, available: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = raw.map((p: any) => ({ ...p, variants: Array.isArray(p.variants) ? p.variants : [] }));

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: bg ? "Начало" : "Home", item: `${BASE}/${locale}` },
      { "@type": "ListItem", position: 2, name: copy.heading, item: `${BASE}/${locale}/category/${slug}` },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.heading,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/${locale}/product/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <section className="pt-28 pb-12 px-6 border-b border-[#2A2418]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="text-xs text-[#F5ECD7]/35 mb-6">
            <Link href={`/${locale}`} className="hover:text-[#C9A84C] transition-colors">
              {bg ? "Начало" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#F5ECD7]/60">{copy.heading}</span>
          </nav>

          <h1
            className="text-3xl md:text-5xl text-gradient-gold leading-tight mb-5"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {copy.heading}
          </h1>
          <p className="text-[#F5ECD7]/55 text-sm md:text-base leading-relaxed max-w-3xl">{copy.intro}</p>

          {brands.length > 0 && (
            <p className="text-[#F5ECD7]/30 text-xs mt-5">
              {bg ? "Марки в тази категория: " : "Brands in this category: "}
              <span className="text-[#F5ECD7]/50">{brands.join(" · ")}</span>
            </p>
          )}
        </div>
      </section>

      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{bg ? "Продукти" : "Products"}</h2>
          {products.length === 0 ? (
            <p className="text-center text-[#F5ECD7]/30 py-16">
              {bg ? "Няма продукти в тази категория." : "No products in this category."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Sideways links so each category page passes signal to the others */}
          <div className="mt-14 pt-8 border-t border-[#2A2418]">
            <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-4">
              {bg ? "Разгледай още" : "Browse more"}
            </p>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(CATEGORY_SLUGS) as (keyof typeof CATEGORY_SLUGS)[])
                .filter(k => k !== key)
                .map(k => (
                  <Link
                    key={k}
                    href={`/${locale}/category/${CATEGORY_SLUGS[k]}`}
                    className="border border-[#2A2418] text-[#F5ECD7]/60 px-5 py-2.5 text-xs tracking-widest uppercase hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors"
                  >
                    {CATEGORY_COPY[bg ? "bg" : "en"][k].heading}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
