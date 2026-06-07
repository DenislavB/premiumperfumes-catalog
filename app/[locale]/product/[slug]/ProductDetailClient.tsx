"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import RequestModal from "@/components/RequestModal";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  nameBg: string;
  description: string;
  descriptionBg: string;
  brand: string;
  volume: string;
  gender: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  images: string[];
  notes: string;
  notesBg: string;
  inPromotion: boolean;
  discountPct: number | null;
  featured: boolean;
  available: boolean;
};

export default function ProductDetailClient({ product, locale }: { product: Product; locale: string }) {
  const t = useTranslations();
  const [imgIdx, setImgIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const name = product.name; // Always English
  const description = locale === "bg" ? product.descriptionBg : product.description;
  const isOutOfStock = !product.available;

  const genderLabel = product.gender === "Men"
    ? (locale === "bg" ? "Мъже" : "Men")
    : product.gender === "Women"
    ? (locale === "bg" ? "Жени" : "Women")
    : (locale === "bg" ? "Унисекс" : "Unisex");

  return (
    <>
      <div className="pt-20 md:pt-24 pb-20 px-4 md:px-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase mb-10 transition-colors"
          >
            <ArrowLeft size={14} />
            {t("product.backBtn")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Images */}
            <div>
              <div className="relative aspect-[3/4] bg-[#161410] border border-[#2A2418] overflow-hidden mb-4">
                {product.images.length > 0 ? (
                  <img src={product.images[imgIdx]} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#F5ECD7]/10 text-8xl">◈</div>
                )}
                {product.images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#0D0B08]/70 p-1.5 text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0D0B08]/70 p-1.5 text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {product.inPromotion && product.discountPct && (
                  <div className="absolute top-4 left-4 bg-[#C9A84C] text-[#0D0B08] text-sm font-bold px-3 py-1">
                    -{product.discountPct}%
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-20 border overflow-hidden transition-all ${i === imgIdx ? "border-[#C9A84C]" : "border-[#2A2418] opacity-50"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-3">{product.brand}</p>
              <h1 className="text-4xl text-[#F5ECD7] leading-tight mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                {name}
              </h1>
              <p className="text-[#F5ECD7]/40 text-sm mb-8">{product.volume} · {genderLabel}</p>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl text-[#C9A84C] font-semibold">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[#F5ECD7]/30 text-lg line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              {product.inPromotion && product.discountPct && (
                <p className="text-[#C9A84C]/70 text-xs tracking-wider mb-6">
                  ★ {t("product.save", { pct: product.discountPct })}
                </p>
              )}

              <div className="h-px bg-[#2A2418] my-6" />

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  [t("product.brand"), product.brand],
                  [t("product.volume"), product.volume],
                  [t("product.gender"), genderLabel],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[#F5ECD7]/30 text-xs tracking-wider uppercase mb-1">{label}</p>
                    <p className="text-[#F5ECD7] text-sm">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[#F5ECD7]/30 text-xs tracking-wider uppercase mb-1">{t("product.quantity")}</p>
                  <p className={`text-sm ${isOutOfStock ? "text-[#F5ECD7]/40" : "text-emerald-400"}`}>
                    {isOutOfStock
                      ? (locale === "bg" ? "Изчерпан" : "Out of stock")
                      : (locale === "bg" ? "В наличност" : "In stock")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => !isOutOfStock && setShowModal(true)}
                disabled={isOutOfStock}
                className="w-full py-4 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-8"
              >
                {isOutOfStock ? t("catalog.outOfStock") : t("product.requestBtn")}
              </button>

              <div className="h-px bg-[#2A2418] mb-6" />
              <h3 className="text-xs text-[#C9A84C] tracking-[0.4em] uppercase mb-4">{t("product.description")}</h3>
              <p className="text-[#F5ECD7]/60 leading-relaxed">{description}</p>

              {(product.notes || product.notesBg) && (() => {
                const displayNotes = locale === "bg"
                  ? (product.notesBg || product.notes)
                  : (product.notes || product.notesBg);
                return (
                  <div className="mt-6">
                    <h3 className="text-xs text-[#C9A84C] tracking-[0.4em] uppercase mb-3">
                      {locale === "bg" ? "Нотки на аромата" : "Fragrance Notes"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {displayNotes.split(",").map((note, i) => (
                        <span key={i} className="text-xs border border-[#C9A84C]/30 text-[#F5ECD7]/60 px-3 py-1 hover:border-[#C9A84C]/60 transition-colors">
                          {note.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {showModal && <RequestModal item={product} onClose={() => setShowModal(false)} />}
    </>
  );
}
