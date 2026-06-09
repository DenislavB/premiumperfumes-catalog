"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, TESTER_SIZE } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function PromoSection({ products, onRequest }: { products: Product[]; onRequest: (p: Product) => void }) {
  const t = useTranslations("catalog");
  const locale = useLocale();

  // Up to 3 featured products
  const featured = products.filter(p => p.featured && p.available).slice(0, 3);
  if (featured.length === 0) return null;

  const priceFrom = (p: Product) => {
    const full = p.variants?.filter(v => v.size !== TESTER_SIZE) ?? [];
    return full.length > 0 ? Math.min(...full.map(v => v.price)) : p.price;
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-6 border-b border-[#2A2418]">
      {/* Background: deep gradient + faint Arabian lattice */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0B08] via-[#17120A] to-[#0D0B08]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9A84C 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, #C9A84C 0 1px, transparent 1px 22px)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">✦</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>
          <h2 className="text-4xl md:text-5xl text-gradient-gold" style={{ fontFamily: "var(--font-playfair)" }}>
            {t("featured")}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {featured.map((p, i) => {
            const name = p.name;
            return (
              <div
                key={p.id}
                className="relative flex justify-center"
                style={{ animationDelay: `${i * 1.6}s` }}
              >
                {/* Arabian golden light behind */}
                <div
                  className="promo-glow absolute -inset-6 rounded-full pointer-events-none"
                  style={{ animationDelay: `${i * 1.6}s` }}
                />

                {/* Pulsing card */}
                <div
                  className="promo-pulse relative w-full max-w-sm bg-[#161410] border border-[#C9A84C]/40 overflow-hidden shadow-2xl"
                  style={{ animationDelay: `${i * 1.6}s` }}
                >
                  {/* Shimmer top edge */}
                  <div className="promo-shimmer absolute top-0 left-0 right-0 h-px" />

                  {/* Featured badge */}
                  <div className="absolute top-4 left-4 z-10 bg-[#C9A84C] text-[#0D0B08] text-[10px] font-bold px-2.5 py-1 tracking-widest uppercase">
                    ★ {t("featured")}
                  </div>

                  <Link href={`/${locale}/product/${p.slug}`}>
                    <div className="relative aspect-[3/4] bg-[#1A1612] overflow-hidden">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">◈</div>
                      )}
                      {/* gradient fade at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#161410] to-transparent" />
                    </div>
                  </Link>

                  <div className="p-6 text-center">
                    <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-2">{p.brand}</p>
                    <Link href={`/${locale}/product/${p.slug}`}>
                      <h3
                        className="text-[#F5ECD7] text-xl leading-snug hover:text-[#C9A84C] transition-colors mb-3"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {name}
                      </h3>
                    </Link>
                    <p className="text-[#C9A84C] text-lg font-semibold mb-5">
                      {locale === "bg" ? "от " : "from "}{formatPrice(priceFrom(p))}
                    </p>
                    <button
                      onClick={() => onRequest(p)}
                      className="w-full text-xs tracking-widest uppercase py-3 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D0B08] transition-all duration-300"
                    >
                      {t("requestBtn")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
