import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://premiumperfumes.bg/sitemap.xml",
    host: "https://premiumperfumes.bg",
  };
}
