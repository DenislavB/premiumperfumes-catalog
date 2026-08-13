"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function ProductRow({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // A mouse wheel scrolls vertically, so without these arrows the cards past
  // the fold were simply unreachable on a desktop.
  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, products.length]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * Math.max(240, el.clientWidth * 0.8),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  if (products.length === 0) return null;

  const arrow =
    "hidden md:flex items-center justify-center w-9 h-9 border border-[#2A2418] text-[#F5ECD7]/50 transition-colors hover:border-[#C9A84C]/60 hover:text-[#C9A84C] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-[#2A2418] disabled:hover:text-[#F5ECD7]/50";

  return (
    <section className="py-14 px-6 border-b border-[#2A2418]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/40 to-transparent" />
          <div className="flex gap-2">
            <button type="button" onClick={() => nudge(-1)} disabled={!canLeft} aria-label="Назад" className={arrow}>
              <ChevronLeft size={17} />
            </button>
            <button type="button" onClick={() => nudge(1)} disabled={!canRight} aria-label="Напред" className={arrow}>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll row — the scrollbar stays visible so it is obvious
            there is more to the right. */}
        <div
          ref={trackRef}
          className="row-scroll flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 snap-x"
        >
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
