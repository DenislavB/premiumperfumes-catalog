"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, total, count, open, setOpen, setQty, remove, setSize } = useCart();
  const [checkout, setCheckout] = useState(false);

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-[90] bg-[#0D0B08]/70 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md z-[95] bg-[#161410] border-l border-[#C9A84C]/30 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2418]">
          <h2 className="text-lg text-gradient-gold" style={{ fontFamily: "var(--font-playfair)" }}>
            {t("title")} {count > 0 && <span className="text-[#F5ECD7]/40 text-sm">({count})</span>}
          </h2>
          <button onClick={() => setOpen(false)} className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[#F5ECD7]/30 mb-6">{t("empty")}</p>
            <button onClick={() => setOpen(false)} className="text-xs tracking-widest uppercase border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-2.5 hover:bg-[#C9A84C]/10 transition-colors">
              {t("continue")}
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {items.map(item => {
                const hasChoices = item.variants && item.variants.length > 1;
                return (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3 border-b border-[#2A2418]/60 pb-4">
                    <div className="w-16 h-20 bg-[#0D0B08] flex-shrink-0 overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#F5ECD7]/10">◈</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase">{item.brand}</p>
                      <p className="text-[#F5ECD7] text-sm leading-snug">{item.name}</p>

                      {/* Size selector */}
                      {hasChoices ? (
                        <select
                          value={item.size}
                          onChange={e => {
                            const v = item.variants.find(x => x.size === e.target.value);
                            if (v) setSize(item.productId, item.size, v.size, v.price);
                          }}
                          className="mt-1 text-xs px-2 py-1 rounded-none"
                        >
                          {item.variants.map(v => (
                            <option key={v.size} value={v.size}>{v.size}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[#F5ECD7]/40 text-xs mt-0.5">{item.size}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty */}
                        <div className="flex items-center border border-[#2A2418]">
                          <button onClick={() => setQty(item.productId, item.size, item.qty - 1)} className="px-2 py-1 text-[#F5ECD7]/60 hover:text-[#C9A84C]"><Minus size={12} /></button>
                          <span className="px-2 text-sm text-[#F5ECD7] min-w-[24px] text-center">{item.qty}</span>
                          <button onClick={() => setQty(item.productId, item.size, item.qty + 1)} className="px-2 py-1 text-[#F5ECD7]/60 hover:text-[#C9A84C]"><Plus size={12} /></button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#C9A84C] text-sm font-semibold">{formatPrice(item.price * item.qty)}</span>
                          <button onClick={() => remove(item.productId, item.size)} className="text-[#F5ECD7]/30 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-[#2A2418] px-6 py-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-[#C9A84C] tracking-widest uppercase">{t("total")}</span>
                <span className="text-[#C9A84C] font-bold text-xl">{formatPrice(total)}</span>
              </div>
              <button onClick={() => { setOpen(false); setCheckout(true); }} className="w-full py-3.5 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors">
                {t("checkout")}
              </button>
            </div>
          </>
        )}
      </aside>

      {checkout && <CheckoutModal onClose={() => setCheckout(false)} />}
    </>
  );
}
