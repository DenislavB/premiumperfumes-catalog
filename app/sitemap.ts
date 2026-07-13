import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://premiumperfumes.bg";
const LOCALES = ["bg", "en"];
const STATIC = ["", "/privacy", "/cookies", "/terms", "/returns"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { available: true },
      select: { slug: true, updatedAt: true },
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
    for (const p of products) {
      entries.push({
        url: `${BASE}/${locale}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
