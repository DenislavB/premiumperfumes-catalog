"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, TESTER_SIZE } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("catalog");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const { add } = useCart();
  const name = product.name; // Always English
  const isOutOfStock = !product.available;
  const hasVariants = product.variants && product.variants.length > 0;
  // "From" price reflects the real perfume — exclude the cheap tester from the headline
  const fullSizeVariants = hasVariants
    ? product.variants.filter(v => v.size !== TESTER_SIZE)
    : [];
  const minVariantPrice = fullSizeVariants.length > 0
    ? Math.min(...fullSizeVariants.map(v => v.price))
    : product.price;

  const addToCart = () => {
    if (isOutOfStock) return;
    // Default to the first full-size variant (or base price)
    const first = fullSizeVariants[0] || product.variants?.[0];
    add({
      productId: product.id,
      name: product.name,
      nameBg: product.nameBg,
      brand: product.brand,
      slug: product.slug,
      image: product.images[0] || "",
      size: first?.size ?? product.volume,
      price: first?.price ?? product.price,
      variants: product.variants || [],
    });
  };

  return (
    <div className="group relative bg-[#161410] border border-[#2A2418] hover:border-[#C9A84C]/50 transition-all duration-500 overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.inPromotion && product.discountPct && (
          <span className="bg-[#C9A84C] text-[#0D0B08] text-xs font-semibold px-2 py-0.5 tracking-wider">
            -{product.discountPct}%
          </span>
        )}
        {product.featured && (
          <span className="bg-[#0D0B08] border border-[#C9A84C]/50 text-[#C9A84C] text-xs px-2 py-0.5 tracking-wider">
            ★
          </span>
        )}
      </div>

      <Link href={`/${locale}/product/${product.slug}`}>
        <div className="relative aspect-[3/4] bg-[#1A1612] overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">◈</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#0D0B08]/70 flex items-center justify-center">
              <span className="text-[#F5ECD7]/60 text-sm tracking-widest uppercase">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-1">{product.brand}</p>
        <Link href={`/${locale}/product/${product.slug}`}>
          <h3
            className="text-[#F5ECD7] text-base leading-snug hover:text-[#C9A84C] transition-colors mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {name}
          </h3>
        </Link>
        <p className="text-[#F5ECD7]/40 text-xs mb-2">{product.volume}</p>
        {(product.notesBg || product.notes) && (
          <p className="text-[#F5ECD7]/30 text-xs mb-3 leading-relaxed line-clamp-2">
            {locale === "bg" ? product.notesBg || product.notes : product.notes || product.notesBg}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-4">
          {hasVariants ? (
            <span className="text-[#C9A84C] text-lg font-semibold">
              {locale === "bg" ? "от " : "from "}{formatPrice(minVariantPrice)}
            </span>
          ) : (
            <>
              <span className="text-[#C9A84C] text-lg font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[#F5ECD7]/30 text-sm line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </>
          )}
        </div>

        <button
          onClick={addToCart}
          disabled={isOutOfStock}
          className="w-full text-xs tracking-widest uppercase py-2.5 border transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D0B08]"
        >
          {tc("addToCart")}
        </button>
      </div>
    </div>
  );
}
