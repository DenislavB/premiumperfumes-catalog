import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://premiumperfumes.bg"),
  title: {
    default: "Premium Perfumes — Дизайнерски, нишови и арабски парфюми",
    template: "%s | Premium Perfumes",
  },
  description:
    "Отливки от дизайнерски и нишови парфюми и оригинални арабски аромати. Versace, Prada, Amouage, Lattafa и още. Магазин Omaya, гр. Кюстендил. Доставка със Speedy и Еконт.",
  keywords: [
    "отливки парфюми", "дизайнерски парфюми", "нишови парфюми", "арабски парфюми",
    "Versace", "Prada", "Amouage", "Lattafa", "Armaf",
    "парфюми Кюстендил", "оригинални парфюми", "Omaya",
    "perfume decants", "designer perfumes", "niche fragrances", "arabic perfumes",
  ],
  applicationName: "Premium Perfumes",
  openGraph: {
    type: "website",
    siteName: "Premium Perfumes",
    title: "Premium Perfumes — Дизайнерски, нишови и арабски парфюми",
    description: "Отливки от дизайнерски и нишови парфюми и оригинални арабски аромати. Магазин Omaya, гр. Кюстендил.",
    url: "https://premiumperfumes.bg",
    locale: "bg_BG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Perfumes — Дизайнерски, нишови и арабски парфюми",
    description: "Отливки от дизайнерски и нишови парфюми и оригинални арабски аромати.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0D0B08] text-[#F5ECD7]">
        {children}
      </body>
    </html>
  );
}
