"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, Phone, Menu, X, MapPin } from "lucide-react";
import ProductFormModal from "./ProductFormModal";

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
  variants: { size: string; price: number }[];
};

type Request = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  courier: string | null;
  address: string | null;
  message: string | null;
  items: unknown;
  status: string;
  createdAt: string;
};

type Tab = "products" | "requests";

export default function AdminDashboardClient({
  products: initialProducts,
  requests: initialRequests,
}: {
  products: Product[];
  requests: Request[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState(initialProducts);
  const [requests, setRequests] = useState(initialRequests);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Изтриване на продукта?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  const toggleAvailable = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(ps => ps.map(p => p.id === updated.id ? updated : p));
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/purchase-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r));
  };

  const onSaved = (product: Product) => {
    setProducts(ps => {
      const idx = ps.findIndex(p => p.id === product.id);
      if (idx >= 0) return ps.map(p => p.id === product.id ? product : p);
      return [product, ...ps];
    });
    setEditProduct(null);
    setShowNewForm(false);
  };

  const newRequests = requests.filter(r => r.status === "new").length;

  const navItems = [
    { key: "products" as Tab, label: "Продукти", icon: Package },
    { key: "requests" as Tab, label: "Заявки", icon: ShoppingBag, badge: newRequests },
  ];

  return (
    <div className="flex h-screen overflow-hidden relative">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0D0B08]/70 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full z-40
        w-64 bg-[#161410] border-r border-[#2A2418] flex flex-col flex-shrink-0
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="px-6 py-5 border-b border-[#2A2418] flex items-center justify-between">
          <div>
            <p className="text-[#C9A84C] text-sm tracking-widest uppercase font-medium" style={{ fontFamily: "var(--font-playfair)" }}>
              Premium Perfumes
            </p>
            <p className="text-[#F5ECD7]/30 text-xs mt-0.5">Администрация</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#F5ECD7]/40 hover:text-[#C9A84C]">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSidebarOpen(false); }}
              className={`flex items-center justify-between px-3 py-3 text-sm tracking-wide transition-colors rounded-sm ${
                tab === key
                  ? "bg-[#C9A84C]/15 text-[#C9A84C]"
                  : "text-[#F5ECD7]/50 hover:text-[#F5ECD7] hover:bg-[#F5ECD7]/5"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} />
                {label}
              </span>
              {badge ? (
                <span className="bg-[#C9A84C] text-[#0D0B08] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#2A2418]">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-[#F5ECD7]/30 hover:text-red-400 transition-colors px-3 py-2 w-full"
          >
            <LogOut size={14} />
            Изход
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto w-full">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#2A2418] bg-[#161410] sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-[#F5ECD7]/60 hover:text-[#C9A84C]">
            <Menu size={22} />
          </button>
          <p className="text-[#C9A84C] text-sm tracking-widest uppercase" style={{ fontFamily: "var(--font-playfair)" }}>
            {tab === "products" ? "Продукти" : "Заявки"}
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className={`text-xs ${tab === "products" ? "text-[#C9A84C]" : "opacity-0 pointer-events-none"}`}
          >
            <Plus size={22} />
          </button>
        </div>

        {tab === "products" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Продукти</h1>
                <p className="text-[#F5ECD7]/30 text-sm mt-1">{products.length} продукта в каталога</p>
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors"
              >
                <Plus size={14} />
                Нов продукт
              </button>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden flex flex-col gap-3 mb-4">
              {products.map(product => (
                <div key={product.id} className="bg-[#161410] border border-[#2A2418] p-3 flex items-center gap-3">
                  <div className="w-12 h-14 bg-[#0D0B08] flex-shrink-0 overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#F5ECD7]/10">◈</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5ECD7] text-sm truncate">{product.name}</p>
                    <p className="text-[#C9A84C] text-xs">{formatPrice(product.price)}</p>
                    <p className="text-[#F5ECD7]/30 text-xs">{product.brand}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => toggleAvailable(product)}
                      className={`text-xs px-2 py-0.5 border ${product.available ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}
                    >
                      {product.available ? "Активен" : "Скрит"}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => setEditProduct(product)} className="text-[#F5ECD7]/40 hover:text-[#C9A84C]">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="text-[#F5ECD7]/40 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-10 text-[#F5ECD7]/20">Няма добавени продукти.</div>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block bg-[#161410] border border-[#2A2418] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2418]">
                    {["Продукт", "Марка", "Цена", "Статус", "Действия"].map(h => (
                      <th key={h} className="text-left text-xs text-[#F5ECD7]/30 tracking-widest uppercase px-4 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-[#2A2418]/50 hover:bg-[#1A1612] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#0D0B08] flex-shrink-0 overflow-hidden">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#F5ECD7]/10 text-sm">◈</div>
                            )}
                          </div>
                          <div>
                            <p className="text-[#F5ECD7] text-sm">{product.name}</p>
                            <p className="text-[#F5ECD7]/30 text-xs">{product.nameBg}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#F5ECD7]/60 text-sm">{product.brand}</td>
                      <td className="px-4 py-3">
                        <span className="text-[#C9A84C] text-sm font-medium">{formatPrice(product.price)}</span>
                        {product.inPromotion && product.discountPct && (
                          <span className="ml-2 text-xs bg-[#C9A84C]/20 text-[#C9A84C] px-1.5 py-0.5">-{product.discountPct}%</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailable(product)}
                          className={`text-xs px-2.5 py-1 border transition-colors ${
                            product.available
                              ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          {product.available ? "Активен" : "Скрит"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditProduct(product)} className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors p-1">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="text-[#F5ECD7]/40 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-16 text-[#F5ECD7]/20">Няма добавени продукти.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Заявки за покупка</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">{requests.length} общо заявки</p>
            </div>

            <div className="flex flex-col gap-4">
              {requests.map(req => {
                const items = req.items as { name: string; nameBg: string; volume: string; price: number }[];
                return (
                  <div key={req.id} className="bg-[#161410] border border-[#2A2418] p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[#F5ECD7] font-medium">{req.name}</p>
                        {req.phone && (
                          <p className="text-[#C9A84C] text-sm flex items-center gap-1 mt-0.5">
                            <Phone size={12} />
                            {req.phone}
                          </p>
                        )}
                        {req.email && (
                          <p className="text-[#F5ECD7]/50 text-sm mt-0.5">{req.email}</p>
                        )}
                        {(req.courier || req.address) && (
                          <p className="text-[#F5ECD7]/40 text-sm flex items-start gap-1 mt-1">
                            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                            <span>
                              {req.courier && <span className="text-[#C9A84C]">{req.courier}</span>}
                              {req.courier && req.address && " · "}
                              {req.address}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#F5ECD7]/30 text-xs">
                          {new Date(req.createdAt).toLocaleDateString("bg-BG")}
                        </span>
                        <select
                          value={req.status}
                          onChange={e => updateRequestStatus(req.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-none border-[#2A2418]"
                        >
                          <option value="new">Нова</option>
                          <option value="contacted">Свързахме се</option>
                          <option value="fulfilled">Изпълнена</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2A2418]">
                      <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-2">Артикули</p>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-[#F5ECD7]/70">{item.name} — {item.volume}</span>
                          <span className="text-[#C9A84C]">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    {req.message && (
                      <div className="mt-3 pt-3 border-t border-[#2A2418]">
                        <p className="text-xs text-[#F5ECD7]/30 tracking-wider uppercase mb-1">Бележка</p>
                        <p className="text-[#F5ECD7]/60 text-sm">{req.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">Няма заявки все още.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {(showNewForm || editProduct) && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setEditProduct(null); setShowNewForm(false); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
