"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import PromoSection from "@/components/PromoSection";
import SpinWheelOverlay from "@/components/SpinWheelOverlay";
import type { Product } from "@/lib/types";

const FILTERS = ["all", "Men", "Women", "Unisex", "featured", "promotions"] as const;
type Filter = typeof FILTERS[number];

export default function CatalogClient({ products, locale }: { products: Product[]; locale: string }) {
  const t = useTranslations();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = products.filter(p => {
    if (filter === "all") return true;
    if (filter === "featured") return p.featured;
    if (filter === "promotions") return p.inPromotion;
    return p.gender === filter;
  });

  return (
    <>
      <SpinWheelOverlay />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0B08] via-[#1A1410] to-[#0D0B08]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/5 blur-3xl" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">premiumperfumes.bg</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>
          <h1
            className="text-4xl md:text-7xl text-gradient-gold leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t("hero.tagline")}
          </h1>
          <p className="text-[#F5ECD7]/60 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 px-2">
            {t("hero.subtitle")}
          </p>
          <a
            href="#catalog"
            className="inline-flex items-center gap-3 border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-all duration-300"
          >
            {t("hero.cta")}
            <span className="text-lg">↓</span>
          </a>
        </div>
      </section>

      {/* Promo / Featured */}
      <PromoSection products={products} />

      {/* Catalog */}
      <section id="catalog" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="h-px w-12 bg-[#C9A84C]/40" />
              <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">◈</span>
              <div className="h-px w-12 bg-[#C9A84C]/40" />
            </div>
            <h2
              className="text-4xl text-[#F5ECD7]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {t("catalog.title")}
            </h2>
          </div>

          {/* Filters */}
          <div className="flex overflow-x-auto md:flex-wrap md:justify-center gap-2 mb-12 pb-1 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-300 ${
                  filter === f
                    ? "bg-[#C9A84C] text-[#0D0B08] border-[#C9A84C]"
                    : "border-[#2A2418] text-[#F5ECD7]/50 hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
                }`}
              >
                {f === "all" ? t("catalog.all")
                  : f === "Men" ? t("catalog.men")
                  : f === "Women" ? t("catalog.women")
                  : f === "Unisex" ? t("catalog.unisex")
                  : f === "featured" ? t("catalog.featured")
                  : t("catalog.promotions")}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-[#F5ECD7]/30 py-20">{t("catalog.noProducts")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 px-6 border-t border-[#2A2418]"
        style={{ background: "linear-gradient(180deg, #0D0B08 0%, #1A1410 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-[#C9A84C]/40" />
            <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">◈</span>
            <div className="h-px w-12 bg-[#C9A84C]/40" />
          </div>
          <h2
            className="text-4xl text-gradient-gold mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t("about.title")}
          </h2>
          <p className="text-[#F5ECD7]/60 text-lg leading-relaxed">{t("about.text")}</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Omaya+бул.+Цар+Освободител+91+Кюстендил"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-3 text-sm tracking-widest hover:bg-[#C9A84C]/10 transition-colors"
          >
            📍 Omaya · гр. Кюстендил, бул. „Цар Освободител" 91
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 border-t border-[#2A2418]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-[#C9A84C]/40" />
              <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">◈</span>
              <div className="h-px w-12 bg-[#C9A84C]/40" />
            </div>
            <h2
              className="text-4xl text-[#F5ECD7] mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {t("nav.contact")}
            </h2>
            <p className="text-[#F5ECD7]/50">{t("contactForm.subtitle")}</p>
            <a
              href="mailto:info@premiumperfumes.bg"
              className="inline-block mt-4 text-[#C9A84C] text-sm tracking-wider hover:text-[#E8D5A3] transition-colors"
            >
              ✉ info@premiumperfumes.bg
            </a>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
