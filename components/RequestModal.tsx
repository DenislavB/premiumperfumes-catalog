"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
type RequestItem = {
  id: string;
  name: string;
  nameBg: string;
  volume: string;
  price: number;
};

export default function RequestModal({ item, onClose }: { item: RequestItem | null; onClose: () => void }) {
  const t = useTranslations("request");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!item) return null;
  const itemName = locale === "bg" ? item.nameBg : item.name;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: [{ productId: item.id, name: item.name, nameBg: item.nameBg, volume: item.volume, price: item.price }],
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D0B08]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161410] border border-[#C9A84C]/30 w-full max-w-lg" style={{ animation: "slideUp 0.3s ease-out" }}>
        <div className="border-b border-[#2A2418] px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg text-gradient-gold" style={{ fontFamily: "var(--font-playfair)" }}>
              {t("title")}
            </h2>
            <p className="text-[#F5ECD7]/50 text-xs mt-1">{t("subtitle")}</p>
          </div>
          <button onClick={onClose} className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#2A2418] bg-[#0D0B08]/30">
          <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-1">{t("items")}</p>
          <div className="flex justify-between items-center">
            <span className="text-[#F5ECD7] text-sm">{itemName} — {item.volume}</span>
            <span className="text-[#C9A84C] font-semibold">{formatPrice(item.price)}</span>
          </div>
        </div>

        {status === "success" ? (
          <div className="px-6 py-10 text-center">
            <div className="text-3xl mb-4 text-[#C9A84C]">✓</div>
            <p className="text-[#F5ECD7]">{t("success")}</p>
            <button onClick={onClose} className="mt-6 text-xs tracking-widest uppercase border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-2 hover:bg-[#C9A84C]/10 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("name")} *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
              </div>
              <div>
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("email")} *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
              </div>
              <div>
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("phone")}</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("message")}</label>
                <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none resize-none" />
              </div>
            </div>
            {status === "error" && <p className="text-red-400 text-xs">{t("error")}</p>}
            <button type="submit" disabled={status === "loading"} className="w-full py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-semibold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50">
              {status === "loading" ? "..." : t("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
