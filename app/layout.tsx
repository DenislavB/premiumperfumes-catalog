import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Perfumes | Luxury Dubai Fragrances",
  description: "Discover the finest luxury perfumes from Dubai — rare oud, precious musks, and timeless Arabian fragrances.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full">
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
