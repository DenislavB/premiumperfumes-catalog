"use client";

import { useState } from "react";
import { X, Plus, Minus, Download } from "lucide-react";

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
};

const empty = {
  name: "", nameBg: "", brand: "", volume: "", gender: "Unisex",
  price: "", originalPrice: "", quantity: "0",
  description: "", descriptionBg: "",
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
          images: product.images,
          featured: product.featured, inPromotion: product.inPromotion,
          discountPct: String(product.discountPct ?? ""), available: product.available,
        }
      : empty
  );
  const [imgUrl, setImgUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fragrantica import
  const [fragUrl, setFragUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  const f = (key: keyof typeof form, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const importFromFragrantica = async () => {
    if (!fragUrl.trim()) return;
    setImporting(true);
    setImportMsg("");
    try {
      const res = await fetch("/api/fragrantica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fragUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import");

      // Auto-fill fields
      if (data.name) f("name", data.name);
      if (data.brand) f("brand", data.brand);
      if (data.description) f("description", data.description);
      if (data.gender) f("gender", data.gender);
      if (data.image) {
        setForm(prev => ({
          ...prev,
          ...(data.name && { name: data.name }),
          ...(data.brand && { brand: data.brand }),
          ...(data.description && { description: data.description }),
          ...(data.gender && { gender: data.gender }),
          images: data.image ? [...prev.images, data.image].filter((v, i, a) => a.indexOf(v) === i) : prev.images,
        }));
      }
      setImportMsg("✓ Imported successfully! Review and fill in the remaining fields.");
    } catch (err) {
      setImportMsg(`✗ ${String(err)}`);
    }
    setImporting(false);
  };

  const addImage = () => {
    if (imgUrl.trim()) {
      f("images", [...(form.images as string[]), imgUrl.trim()]);
      setImgUrl("");
    }
  };
  const removeImage = (i: number) =>
    f("images", (form.images as string[]).filter((_, idx) => idx !== i));

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
        <div className="sticky top-0 bg-[#161410] border-b border-[#2A2418] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="p-6">

          {/* Fragrantica Import */}
          <div className="mb-6 p-4 border border-[#C9A84C]/20 bg-[#C9A84C]/5">
            <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-3 flex items-center gap-2">
              <Download size={12} />
              Import from Fragrantica
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={fragUrl}
                onChange={e => setFragUrl(e.target.value)}
                placeholder="https://www.fragrantica.com/perfume/..."
                className="flex-1 px-3 py-2 text-sm rounded-none"
              />
              <button
                type="button"
                onClick={importFromFragrantica}
                disabled={importing || !fragUrl.trim()}
                className="bg-[#C9A84C] text-[#0D0B08] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-40"
              >
                {importing ? "..." : "Import"}
              </button>
            </div>
            {importMsg && (
              <p className={`text-xs mt-2 ${importMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
                {importMsg}
              </p>
            )}
            <p className="text-[#F5ECD7]/30 text-xs mt-2">
              Paste a Fragrantica product page URL to auto-fill name, brand, description, gender and image.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Names */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Name (EN) *</label>
              <input required value={form.name} onChange={e => f("name", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Name (BG) *</label>
              <input required value={form.nameBg} onChange={e => f("nameBg", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Brand / Volume */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Brand *</label>
              <input required value={form.brand} onChange={e => f("brand", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Volume (e.g. 100ml) *</label>
              <input required value={form.volume} onChange={e => f("volume", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => f("gender", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none">
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={e => f("quantity", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Prices */}
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Price (BGN) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => f("price", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Original Price (for strikethrough)</label>
              <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => f("originalPrice", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none" />
            </div>

            {/* Descriptions */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Description (EN)</label>
              <textarea rows={4} value={form.description} onChange={e => f("description", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Description (BG)</label>
              <textarea rows={4} value={form.descriptionBg} onChange={e => f("descriptionBg", e.target.value)} className="w-full px-3 py-2 text-sm rounded-none resize-none" />
            </div>

            {/* Images */}
            <div className="col-span-2">
              <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Images (URLs)</label>
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
                        onClick={() => removeImage(i)}
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
            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "featured", label: "Featured" },
                { key: "inPromotion", label: "In Promotion" },
                { key: "available", label: "Available" },
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
                  <label className="text-xs text-[#F5ECD7]/40 tracking-widest uppercase block mb-1.5">Discount %</label>
                  <input
                    type="number" min="1" max="99"
                    value={form.discountPct}
                    onChange={e => f("discountPct", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-none"
                  />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mt-4">{error}</p>}

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-[#2A2418] text-[#F5ECD7]/50 text-xs tracking-widest uppercase hover:border-[#F5ECD7]/20 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
