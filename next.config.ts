import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
    // Old e-commerce platform's URL structure (pre-migration) — send stale
    // crawled/bookmarked links to the new homepage instead of 404ing.
    const oldPlatformPaths = ["product", "vendor", "category", "selection", "auth"];
    return oldPlatformPaths.map((path) => ({
      source: `/${path}/:rest*`,
      destination: "/bg",
      permanent: true,
    }));
  },
};

export default withNextIntl(nextConfig);
