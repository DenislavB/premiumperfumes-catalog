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

    // Everything else from the old platform lands on the homepage.
    const oldPrefixes = ["product", "vendor", "category", "selection", "auth", "page", "blog"];
    const oldExact = ["/vendors", "/contacts", "/blog", "/cdn-cgi/l/email-protection"];

    return [
      // Specific rules must come first — the catch-all below would swallow them.
      ...oldProductPages.map(([from, to]) => ({
        source: `/product/${from}`,
        destination: `/bg/product/${to}`,
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
