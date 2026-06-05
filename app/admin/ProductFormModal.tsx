"use client";

import { useState } from "react";
import { X, Plus, Minus, Search } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  nameBg: string;
  brand: string;
  volume: string;
  gender: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  images: string[];
  inPromotion: boolean;
  discountPct: number | null;
  featured: boolean;
  available: boolean;
  description: string;
  descriptionBg: string;
  notes: string;
  notesBg: string;
};

const empty = {
  name: "", nameBg: "", brand: "", volume: "", gender: "Unisex",
  price: "", originalPrice: "", quantity: "0",
  description: "", descriptionBg: "", notes: "", notesBg: "",
  images: [] as string[],
  featured: false, inPromotion: false, discountPct: "", available: true,
};

export default function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState(
    product
      ? {
          name: product.name, nameBg: product.nameBg, brand: product.brand,
          volume: product.volume, gender: product.gender,
          price: String(product.price), originalPrice: String(product.originalPrice ?? ""),
          quantity: String(product.quantity),
          description: product.description, descriptionBg: product.descriptionBg,
          notes: product.notes || "",
          notesBg: product.notesBg || "",
          images: product.images,
          featured: product.featured, inPromotion: product.inPromotion,
          discountPct: String(product.discountPct ?? ""), available: product.available,
        }
      : empty
  );

  const [imgUrl, setImgUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-search state
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

  const f = (key: keyof typeof form, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const autoSearch = async () => {
    if (!form.name || !form.brand) {
      setSearchMsg("✗ Въведете първо Наименование и Производител.");
      return;
    }
    setSearching(true);
    setSearchMsg("");
    setSuggestedImages([]);
    try {
      const res = await fetch("/api/fragrantica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, brand: form.brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка");

      if (data.description) f("description", data.description);
      if (data.descriptionBg) f("descriptionBg", data.descriptionBg);
      if (data.gender) f("gender", data.gender);
      if (data.notes) f("notes", data.notes);
      if (data.notesBg) f("notesBg", data.notesBg);
      if (data.images?.length > 0) {
        setSuggestedImages(data.images);
        setSearchMsg(`✓ Описанията на EN и BG са попълнени! Изберете снимки по-долу.`);
      } else {
        setSearchMsg("✓ Описанията на EN и BG са попълнени автоматично! Добавете снимки ръчно.");
      }
    } catch (err) {
      setSearchMsg(`✗ ${String(err)}`);
    }
    setSearching(false);
  };

  const addImage = () => {
    if (imgUrl.trim()) {
      f("images", [...(form.images as string[]), imgUrl.trim()]);
      setImgUrl("");
    }
  };

  const toggleSuggestedImage = (imgSrc: string) => {
    const current = form.images as string[];
    if (current.includes(imgSrc)) {
      f("images", current.filter(u => u !== imgSrc));
    } else {
      f("images", [...current, imgSrc]);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      onSaved(saved);
    } catch (err) {
      setError(String(err));
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-[#0D0B08]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161410] border-l border-[#2A2418] w-full max-w-2xl h-full overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#161410] border-b border-[#2A2418] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>
            {isEdit ? "Редактиране на продукт" : "Нов продукт"}
          </h2>
          <button onClick={onClose} className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="p-6">
          <div className="grid grid-cols-2 gap-4">

            {/* Step 1: Basic info first */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Наименование (EN) *</label>
              <input required value={form.name} onChange={e => f("name", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" placeholder="напр. Oud For Glory" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Наименование (BG) *</label>
              <input required value={form.nameBg} onChange={e => f("nameBg", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" placeholder="напр. Уд за слава" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Производител *</label>
              <input required value={form.brand} onChange={e => f("brand", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" placeholder="напр. Lattafa" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Обем *</label>
              <input required value={form.volume} onChange={e => f("volume", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" placeholder="напр. 100ml" />
            </div>

            {/* Auto-search button */}
            <div className="col-span-2">
              <button
                type="button"
                onClick={autoSearch}
                disabled={searching || !form.name || !form.brand}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#C9A84C]/50 text-[#C9A84C] text-xs font-bold tracking-widest uppercase hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-40"
              >
                <Search size={14} />
                {searching ? "Търсене..." : "Търси информация и снимки автоматично"}
              </button>
              {searchMsg && (
                <p className={`text-xs mt-2 ${searchMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
                  {searchMsg}
                </p>
              )}
            </div>

            {/* Suggested images */}
            {suggestedImages.length > 0 && (
              <div className="col-span-2 p-4 bg-[#0D0B08]/40 border border-[#2A2418]">
                <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-3">
                  Изберете снимки (кликнете за добавяне/премахване)
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedImages.map((src, i) => {
                    const selected = (form.images as string[]).includes(src);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleSuggestedImage(src)}
                        className={`relative w-20 h-24 border-2 overflow-hidden transition-all ${
                          selected ? "border-[#C9A84C]" : "border-[#2A2418] opacity-50 hover:opacity-90"
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {selected && (
                          <div className="absolute inset-0 bg-[#C9A84C]/30 flex items-center justify-center">
                            <span className="text-white text-xl font-bold drop-shadow">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gender */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">За</label>
              <select value={form.gender} onChange={e => f("gender", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none">
                <option value="Men">Мъже</option>
                <option value="Women">Жени</option>
                <option value="Unisex">Унисекс</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Количество</label>
              <input type="number" min="0" value={form.quantity} onChange={e => f("quantity", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Prices */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Цена (лв.) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => f("price", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Стара цена (зачертана)</label>
              <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => f("originalPrice", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Descriptions */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Описание (EN)</label>
              <textarea rows={4} value={form.description} onChange={e => f("description", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Описание (BG)</label>
              <textarea rows={4} value={form.descriptionBg} onChange={e => f("descriptionBg", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none resize-none" />
            </div>

            {/* Notes EN */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">
                Нотки на аромата (EN)
                <span className="ml-2 text-[#F5ECD7]/20 normal-case tracking-normal">(попълва се автоматично)</span>
              </label>
              <input
                value={form.notes as string}
                onChange={e => f("notes", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-none"
                placeholder="rose, oud, amber, musk, sandalwood"
              />
            </div>

            {/* Notes BG */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">
                Нотки на аромата (BG)
                <span className="ml-2 text-[#F5ECD7]/20 normal-case tracking-normal">(попълва се автоматично)</span>
              </label>
              <input
                value={form.notesBg as string}
                onChange={e => f("notesBg", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-none"
                placeholder="роза, уд, амбра, мускус, сандалово дърво"
              />
            </div>

            {/* Manual image URL */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Добави снимка по URL</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imgUrl}
                  onChange={e => setImgUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-sm rounded-none"
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImage())}
                />
                <button type="button" onClick={addImage} className="bg-[#C9A84C]/20 text-[#C9A84C] px-3 py-2 hover:bg-[#C9A84C]/30 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {(form.images as string[]).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.images as string[]).map((url, i) => (
                    <div key={i} className="relative group w-16 h-20 bg-[#0D0B08] border border-[#2A2418] overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => f("images", (form.images as string[]).filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-red-500/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="col-span-2 flex flex-wrap gap-6">
              {[
                { key: "featured", label: "Препоръчан" },
                { key: "inPromotion", label: "В промоция" },
                { key: "available", label: "Наличен" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as "featured" | "inPromotion" | "available"] as boolean}
                    onChange={e => f(key as "featured" | "inPromotion" | "available", e.target.checked)}
                    className="w-4 h-4 accent-[#C9A84C]"
                  />
                  <span className="text-sm text-[#F5ECD7]/70">{label}</span>
                </label>
              ))}
              {form.inPromotion && (
                <div>
                  <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Отстъпка %</label>
                  <input type="number" min="1" max="99" value={form.discountPct} onChange={e => f("discountPct", e.target.value)} className="w-24 px-3 py-2 text-sm rounded-none" />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mt-4">{error}</p>}

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-[#2A2418] text-[#F5ECD7]/50 text-xs tracking-widest uppercase hover:border-[#F5ECD7]/20 transition-colors">
              Откажи
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50">
              {saving ? "Запазване..." : isEdit ? "Запази промените" : "Създай продукт"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
