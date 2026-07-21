"use client";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function ProductRow({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 px-6 border-b border-[#2A2418]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/40 to-transparent" />
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-3 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide snap-x">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-44 sm:w-52 md:w-56 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
