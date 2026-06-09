"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type EcontOffice = { id: string; name: string; city: string; address: string };
type Variant = { size: string; price: number };

type RequestItem = {
  id: string;
  name: string;
  nameBg: string;
  volume: string;
  price: number;
  variants?: Variant[];
};

export default function RequestModal({ item, onClose, initialVariant = 0 }: { item: RequestItem | null; onClose: () => void; initialVariant?: number }) {
  const t = useTranslations("request");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", courier: "", address: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [consent, setConsent] = useState(false);

  const hasVariants = !!(item?.variants && item.variants.length > 0);
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  // Econt office picker
  const [econtOffices, setEcontOffices] = useState<EcontOffice[]>([]);
  const [officeSearch, setOfficeSearch] = useState("");
  const [showOfficeList, setShowOfficeList] = useState(false);

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "ok" | "bad">("idle");
  const [promoMsg, setPromoMsg] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number; finalTotal: number; note?: string } | null>(null);

  useEffect(() => {
    if (form.courier === "Econt" && econtOffices.length === 0) {
      fetch("/api/econt-offices")
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setEcontOffices(d); })
        .catch(() => {});
    }
  }, [form.courier, econtOffices.length]);

  const filteredOffices = officeSearch.trim()
    ? econtOffices.filter(o => {
        const q = officeSearch.toLowerCase();
        return o.city.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q);
      }).slice(0, 50)
    : econtOffices.slice(0, 50);

  if (!item) return null;
  const itemName = locale === "bg" ? item.nameBg : item.name;

  const chosenSize = hasVariants ? item.variants![selectedVariant].size : item.volume;
  const chosenPrice = hasVariants ? item.variants![selectedVariant].price : item.price;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoStatus("loading");
    setPromoMsg("");
    try {
      const res = await fetch("/api/promocodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, total: chosenPrice }),
      });
      const data = await res.json();
      if (data.valid) {
        setApplied({ code: data.code, discount: data.discount, finalTotal: data.finalTotal, note: data.note });
        setPromoStatus("ok");
      } else {
        setApplied(null);
        setPromoStatus("bad");
        setPromoMsg(data.error || "Невалиден промокод");
      }
    } catch {
      setPromoStatus("bad");
      setPromoMsg("Грешка");
    }
  };

  // Re-validate when the chosen size changes (price differs)
  const removePromo = () => {
    setApplied(null);
    setPromoInput("");
    setPromoStatus("idle");
    setPromoMsg("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: [{ productId: item.id, name: item.name, nameBg: item.nameBg, volume: chosenSize, price: chosenPrice }],
          promoCode: applied?.code || null,
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
      <div className="relative bg-[#161410] border border-[#C9A84C]/30 w-full max-w-lg mx-2 md:mx-0 max-h-[90vh] overflow-y-auto" style={{ animation: "slideUp 0.3s ease-out" }}>
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
          <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-2">{t("items")}</p>

          {hasVariants && (
            <div className="mb-3">
              <p className="text-xs text-[#F5ECD7]/40 mb-1.5">{locale === "bg" ? "Изберете размер:" : "Choose size:"}</p>
              <div className="flex flex-wrap gap-2">
                {item.variants!.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedVariant(i); removePromo(); }}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      selectedVariant === i
                        ? "bg-[#C9A84C] text-[#0D0B08] border-[#C9A84C]"
                        : "border-[#2A2418] text-[#F5ECD7]/60 hover:border-[#C9A84C]/50"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[#F5ECD7] text-sm">{itemName} — {chosenSize}</span>
            <span className={`font-semibold ${applied ? "text-[#F5ECD7]/40 line-through text-sm" : "text-[#C9A84C]"}`}>
              {formatPrice(chosenPrice)}
            </span>
          </div>

          {/* Promo code */}
          <div className="mt-3 pt-3 border-t border-[#2A2418]/60">
            {applied ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    ✓ {applied.code}
                    <button type="button" onClick={removePromo} className="text-[#F5ECD7]/30 hover:text-red-400 text-xs underline">
                      {locale === "bg" ? "премахни" : "remove"}
                    </button>
                  </span>
                  {applied.note ? (
                    <span className="text-emerald-400">{applied.note}</span>
                  ) : (
                    <span className="text-emerald-400">− {formatPrice(applied.discount)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#C9A84C] tracking-widest uppercase">{t("total")}</span>
                  <span className="text-[#C9A84C] font-bold text-lg">{formatPrice(applied.finalTotal)}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder={t("promoPlaceholder")}
                    className="flex-1 px-3 py-2 text-sm rounded-none"
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoStatus === "loading" || !promoInput.trim()}
                    className="px-4 py-2 text-xs font-semibold tracking-widest uppercase border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-40"
                  >
                    {promoStatus === "loading" ? "..." : t("promoApply")}
                  </button>
                </div>
                {promoStatus === "bad" && <p className="text-red-400 text-xs mt-1.5">{promoMsg}</p>}
              </>
            )}
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
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("phone")} *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
              </div>
              <div>
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("email")}</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
              </div>
              <div>
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("courier")} *</label>
                <select
                  required
                  value={form.courier}
                  onChange={e => {
                    setForm(f => ({ ...f, courier: e.target.value, address: "" }));
                    setOfficeSearch("");
                    setShowOfficeList(false);
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-none"
                >
                  <option value="">{t("courierHint")}</option>
                  <option value="Speedy">Speedy</option>
                  <option value="Econt">Econt</option>
                </select>
              </div>

              {/* Address — Econt searchable office list, Speedy free text */}
              <div className="col-span-2 relative">
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("address")} *</label>

                {form.courier === "Econt" ? (
                  <>
                    <input
                      required
                      value={form.address || officeSearch}
                      onChange={e => {
                        setOfficeSearch(e.target.value);
                        setForm(f => ({ ...f, address: "" }));
                        setShowOfficeList(true);
                      }}
                      onFocus={() => setShowOfficeList(true)}
                      placeholder={locale === "bg" ? "Търсете по град или офис..." : "Search by city or office..."}
                      className="w-full px-3 py-2.5 text-sm rounded-none"
                    />
                    {showOfficeList && !form.address && (
                      <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#1A1612] border border-[#C9A84C]/30">
                        {econtOffices.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-[#F5ECD7]/40">{locale === "bg" ? "Зареждане..." : "Loading..."}</p>
                        ) : filteredOffices.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-[#F5ECD7]/40">{locale === "bg" ? "Няма резултати" : "No results"}</p>
                        ) : (
                          filteredOffices.map(o => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => {
                                setForm(f => ({ ...f, address: `${o.city}: ${o.name} — ${o.address}` }));
                                setShowOfficeList(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-[#F5ECD7]/80 hover:bg-[#C9A84C]/10 border-b border-[#2A2418]/50"
                            >
                              <span className="text-[#C9A84C]">{o.city}</span> · {o.name}
                              <span className="block text-[#F5ECD7]/40">{o.address}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    required
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-none"
                    placeholder={
                      form.courier === "Speedy"
                        ? (locale === "bg" ? "Град и офис на Speedy" : "City and Speedy office")
                        : (locale === "bg" ? "Първо изберете куриер" : "Choose a courier first")
                    }
                    disabled={!form.courier}
                  />
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("message")}</label>
                <textarea rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none resize-none" />
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#C9A84C] flex-shrink-0"
              />
              <span className="text-xs text-[#F5ECD7]/50 leading-relaxed">
                {locale === "bg" ? "Запознах се и съм съгласен с " : "I have read and agree to the "}
                <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline">
                  {locale === "bg" ? "Политиката за поверителност" : "Privacy Policy"}
                </a>
                {locale === "bg" ? " и " : " and "}
                <a href={`/${locale}/terms`} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline">
                  {locale === "bg" ? "Общите условия" : "Terms"}
                </a>.
              </span>
            </label>
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
