import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Slugs of everything currently in the catalogue, read at build time.
 *
 * Needed because the old platform and this site both use /product/<slug>. A
 * locale-less URL for a product we still sell must reach that product, not the
 * homepage — so the real slugs get their own redirect ahead of the catch-all.
 *
 * Falls back to an empty list if the database is unreachable during the build;
 * the catch-all still keeps those URLs off a 404.
 */
async function currentProductSlugs(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
    const rows = await prisma.product.findMany({ select: { slug: true } });
    await prisma.$disconnect();
    return rows.map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    // Old e-commerce platform's URL structure (pre-migration).
    //
    // Products we still stock go to their own page — that keeps whatever link
    // equity the old URL earned and lands the visitor on the thing they were
    // actually looking for. Each pair below was checked by hand; anything
    // ambiguous (e.g. "Khamrah" vs "Khamrah Waha") was deliberately left out
    // and falls through to the catch-all rather than risk the wrong perfume.
    const oldProductPages: [string, string][] = [
      ["uniseks-parfyum-lattafa-khamrah-100ml", "lattafa-khamrah-100ml"],
      ["damski-parfyum-lattafa-yara-100ml", "lattafa-yara-100ml"],
      ["majki-parfyum-lattafa-asad-100ml", "lattafa-asad-100ml"],
      ["damski-parfyum-lattafa-al-nashama-100ml", "lattafa-al-nashama-100ml"],
      ["majki-parfyum-lattafa-hayaati-100ml", "lattafa-hayaati-100ml"],
      ["lattafa-hayaati-hayaati-florence", "lattafa-hayaati-florence-100ml"],
      ["uniseks-parfyum-lattafa-hayaati-florence-100ml", "lattafa-hayaati-florence-100ml"],
      ["uniseks-parfyum-lattafa-confidential-private-gold-100ml", "lattafa-confidential-private-gold-100ml"],
      ["majki-parfyum-lattafa-the-kingdom-100ml", "lattafa-the-kingdom-100ml"],
      ["damski-parfyum-damski-parfyum-lattafa-haya-100ml", "lattafa-haya-100ml"],
      ["majki-parfyum-lattafa-honor-glory-100ml", "lattafa-badee-al-oud-honor-glory-100ml"],
      ["uniseks-parfyum-lattafa-ana-abiyedh", "lattafa-ana-abiyedh-60ml"],
      ["majki-parfyum-armaf-odyssey-wild-one-gold-edition-100ml", "armaf-odyssey-wild-one-gold-edition-60ml"],
      ["damski-parfyum-armaf-le-parfait-azure-100ml", "armaf-le-parfait-azure-100ml"],
    ];

    // The old platform's category URLs map cleanly onto the new landing pages
    // — including the gender splits, which are all Arabian perfumes. These were
    // indexed for years, so pointing them at the matching category recovers far
    // more than dropping them on the homepage would.
    const oldCategories: [string, string][] = [
      ["arabski-parfyumi", "arabski-parfyumi"],
      ["damski-arabski-parfyumi", "arabski-parfyumi"],
      ["majki-arabski-parfyumi", "arabski-parfyumi"],
      ["uniseks-arabski-parfyumi", "arabski-parfyumi"],
    ];

    // Everything else from the old platform lands on the homepage.
    const oldPrefixes = ["product", "vendor", "category", "selection", "auth", "page", "blog"];
    const oldExact = ["/vendors", "/contacts", "/blog", "/cdn-cgi/l/email-protection"];

    const liveSlugs = await currentProductSlugs();

    return [
      // Specific rules must come first — the catch-all below would swallow them.
      ...oldProductPages.map(([from, to]) => ({
        source: `/product/${from}`,
        destination: `/bg/product/${to}`,
        permanent: true,
      })),
      // A product we still sell, reached without a locale prefix.
      ...liveSlugs.map((slug) => ({
        source: `/product/${slug}`,
        destination: `/bg/product/${slug}`,
        permanent: true,
      })),
      ...oldCategories.map(([from, to]) => ({
        source: `/category/${from}`,
        destination: `/bg/category/${to}`,
        permanent: true,
      })),
      ...oldPrefixes.map((path) => ({
        source: `/${path}/:rest*`,
        destination: "/bg",
        permanent: true,
      })),
      ...oldExact.map((source) => ({
        source,
        destination: "/bg",
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
