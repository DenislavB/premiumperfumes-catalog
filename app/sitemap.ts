import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUGS } from "@/lib/categories";

const BASE = "https://premiumperfumes.bg";
const LOCALES = ["bg", "en"];
const STATIC = ["", "/privacy", "/cookies", "/terms", "/returns"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Out-of-stock products stay in the sitemap on purpose. Their pages return
  // 200 and are marked OutOfStock in structured data; dropping them would let
  // Google de-index rankings that have to be rebuilt from scratch every time a
  // bottle sells out and is restocked.
  let products: { slug: string; updatedAt: Date; available: boolean }[] = [];
  try {
    products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true, available: true },
    });
  } catch {
    products = [];
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: path === "" ? "daily" : "monthly",
        priority: path === "" ? 1 : 0.4,
      });
    }

    // Category landing pages rank for the head terms, so they sit just under
    // the homepage in priority.
    for (const slug of Object.values(CATEGORY_SLUGS)) {
      entries.push({
        url: `${BASE}/${locale}/category/${slug}`,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }

    for (const p of products) {
      entries.push({
        url: `${BASE}/${locale}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: p.available ? "weekly" : "monthly",
        priority: p.available ? 0.8 : 0.4,
      });
    }
  }

  return entries;
}
