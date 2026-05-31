"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, CheckCircle, Clock, Phone } from "lucide-react";
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
};

type Request = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#161410] border-r border-[#2A2418] flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-[#2A2418]">
          <p className="text-[#C9A84C] text-sm tracking-widest uppercase font-medium" style={{ fontFamily: "var(--font-playfair)" }}>
            Premium Perfumes
          </p>
          <p className="text-[#F5ECD7]/30 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {[
            { key: "products" as Tab, label: "Products", icon: Package },
            { key: "requests" as Tab, label: "Requests", icon: ShoppingBag, badge: newRequests },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center justify-between px-3 py-2.5 text-sm tracking-wide transition-colors rounded-sm ${
                tab === key
                  ? "bg-[#C9A84C]/15 text-[#C9A84C]"
                  : "text-[#F5ECD7]/50 hover:text-[#F5ECD7] hover:bg-[#F5ECD7]/5"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} />
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
            className="flex items-center gap-2 text-sm text-[#F5ECD7]/30 hover:text-red-400 transition-colors px-3 py-2"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {tab === "products" && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Products</h1>
                <p className="text-[#F5ECD7]/30 text-sm mt-1">{products.length} items in catalog</p>
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="flex items-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors"
              >
                <Plus size={14} />
                Add Product
              </button>
            </div>

            <div className="bg-[#161410] border border-[#2A2418] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2418]">
                    {["Product", "Brand", "Price", "Stock", "Status", "Actions"].map(h => (
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
                      <td className="px-4 py-3 text-[#F5ECD7]/60 text-sm">{product.quantity}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailable(product)}
                          className={`text-xs px-2.5 py-1 border transition-colors ${
                            product.available
                              ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          {product.available ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditProduct(product)}
                            className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors p-1"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-[#F5ECD7]/40 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">No products yet.</div>
              )}
            </div>
          </div>
        )}

        {tab === "requests" && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Purchase Requests</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">{requests.length} total requests</p>
            </div>

            <div className="flex flex-col gap-4">
              {requests.map(req => {
                const items = req.items as { name: string; nameBg: string; volume: string; price: number }[];
                return (
                  <div key={req.id} className="bg-[#161410] border border-[#2A2418] p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-[#F5ECD7] font-medium">{req.name}</p>
                        <p className="text-[#F5ECD7]/50 text-sm mt-0.5">{req.email}</p>
                        {req.phone && (
                          <p className="text-[#F5ECD7]/40 text-sm flex items-center gap-1 mt-0.5">
                            <Phone size={12} />
                            {req.phone}
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
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="fulfilled">Fulfilled</option>
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4 pt-4 border-t border-[#2A2418]">
                      <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-2">Items</p>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-[#F5ECD7]/70">{item.name} — {item.volume}</span>
                          <span className="text-[#C9A84C]">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    {req.message && (
                      <div className="mt-3 pt-3 border-t border-[#2A2418]">
                        <p className="text-xs text-[#F5ECD7]/30 tracking-wider uppercase mb-1">Note</p>
                        <p className="text-[#F5ECD7]/60 text-sm">{req.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">No requests yet.</div>
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
