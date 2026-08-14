"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { BadgeCheck, Truck, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import ProductRow from "@/components/ProductRow";
import ScentJourney from "@/components/quiz/ScentJourney";
import type { Product } from "@/lib/types";

const FILTERS = ["designer", "niche", "arabian"] as const;
type Filter = typeof FILTERS[number];
const FILTER_KEY = "pp_catalog_filter";

export default function CatalogClient({ products, locale }: { products: Product[]; locale: string }) {
  const t = useTranslations();
  // Designer decants are the category we lead with for a first-time visitor;
  // a returning one gets whatever they last looked at (restored below).
  const [filter, setFilter] = useState<Filter>("designer");
  const [quizOpen, setQuizOpen] = useState(false);

  /**
   * The journey no longer opens by itself.
   *
   * As a full-screen modal it sat above the header and locked page scroll, so
   * for the first seconds of every visit the navigation appeared dead and the
   * page would not move — it read as a broken site rather than an invitation.
   * It is still one click away from the hero and from its own section below.
   *
   * To bring the greeting back, restore the timer that set quizOpen after a
   * short delay, guarded by a sessionStorage flag so it fires once per visit.
   */

  // Restore the last-viewed category so returning from a product lands in the same section
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FILTER_KEY);
      if (saved && (FILTERS as readonly string[]).includes(saved)) setFilter(saved as Filter);
    } catch {
      /* ignore */
    }
  }, []);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    try {
      sessionStorage.setItem(FILTER_KEY, f);
    } catch {
      /* ignore */
    }
  };

  const filtered = products.filter(p => p.category === filter);

  // Best sellers (admin-flagged via ★) and newest arrivals
  const bestsellers = products.filter(p => p.featured && p.available).slice(0, 12);
  const newArrivals = [...products]
    .filter(p => p.available)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[88vh] md:h-[85vh] flex items-center justify-center overflow-hidden">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setQuizOpen(true)}
              className="inline-flex items-center gap-2.5 bg-[#C9A84C] text-[#0D0B08] px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-all duration-300"
            >
              <Sparkles size={15} />
              {t("quiz.launchCta")}
            </button>
            <a
              href="#catalog"
              className="inline-flex items-center gap-3 border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-all duration-300"
            >
              {t("hero.cta")}
              <span className="text-lg">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* Scent journey invitation */}
      <section className="py-14 px-6 border-b border-[#2A2418] bg-gradient-to-b from-[#12100C] to-[#0D0B08]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-[#C9A84C]/40" />
            <Sparkles size={16} className="text-[#C9A84C]" />
            <div className="h-px w-10 bg-[#C9A84C]/40" />
          </div>
          <h2
            className="text-2xl md:text-4xl text-gradient-gold mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {t("quiz.launchTitle")}
          </h2>
          <p className="text-[#F5ECD7]/50 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-7">
            {t("quiz.launchSubtitle")}
          </p>
          <button
            onClick={() => setQuizOpen(true)}
            className="inline-flex items-center gap-2.5 bg-[#C9A84C] text-[#0D0B08] px-7 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-all duration-300"
          >
            <Sparkles size={15} />
            {t("quiz.launchCta")}
          </button>
        </div>
      </section>

      {/* Best sellers + New arrivals — first thing after the hero */}
      <ProductRow title={t("sections.bestsellers")} products={bestsellers} />
      <ProductRow title={t("sections.newArrivals")} products={newArrivals} />

      {/* Catalog */}
      {/* scroll-mt clears the fixed header, which otherwise sits over the
          heading when the nav links jump to these sections */}
      <section id="catalog" className="scroll-mt-24 py-24 px-6">
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
                onClick={() => changeFilter(f)}
                className={`flex-shrink-0 text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-300 ${
                  filter === f
                    ? "bg-[#C9A84C] text-[#0D0B08] border-[#C9A84C]"
                    : "border-[#2A2418] text-[#F5ECD7]/50 hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
                }`}
              >
                {t(`catalog.${f}`)}
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
        className="scroll-mt-24 py-24 px-6 border-t border-[#2A2418]"
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

      {/* Trust badges */}
      <section className="py-16 px-6 border-t border-[#2A2418]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10 text-center">
          <div className="flex flex-col items-center">
            <BadgeCheck size={40} className="text-[#C9A84C] mb-4" strokeWidth={1.5} />
            <h3 className="text-[#F5ECD7] text-lg mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
              {t("trust.originalTitle")}
            </h3>
            <p className="text-[#F5ECD7]/50 text-sm max-w-xs leading-relaxed">{t("trust.originalText")}</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck size={40} className="text-[#C9A84C] mb-4" strokeWidth={1.5} />
            <h3 className="text-[#F5ECD7] text-lg mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
              {t("trust.deliveryTitle")}
            </h3>
            <p className="text-[#F5ECD7]/50 text-sm max-w-xs leading-relaxed">{t("trust.deliveryText")}</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 py-24 px-6 border-t border-[#2A2418]">
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

      <ScentJourney products={products} open={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  );
}
