"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, Phone, Menu, X, MapPin, Mail, Ticket, Star, Gift, Archive, Send, Sparkles } from "lucide-react";
import ProductFormModal from "./ProductFormModal";

// Format a number as a compact price (no currency, drop trailing .00)
function num(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// Date + time, e.g. "11.06.2026, 14:30"
function dateTime(d: string) {
  return new Date(d).toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Short category label + color for the admin product list
function categoryTag(category: string) {
  if (category === "designer") return { label: "Дизайнерски", className: "text-[#E8D5A3] border-[#E8D5A3]/30" };
  if (category === "niche") return { label: "Нишови", className: "text-[#9A7A2E] border-[#9A7A2E]/40" };
  return { label: "Арабски", className: "text-[#C9A84C] border-[#C9A84C]/30" };
}

// Variant price summary, sorted low→high. Returns { prices, sizes }
function priceSummary(product: { price: number; variants?: { size: string; price: number }[] }) {
  const v = product.variants;
  if (!v || v.length === 0) {
    return { prices: `${num(product.price)} €`, sizes: "" };
  }
  const sorted = [...v].sort((a, b) => a.price - b.price);
  return {
    prices: sorted.map(x => num(x.price)).join(" / ") + " €",
    sizes: sorted.map(x => x.size).join(" / "),
  };
}

type Product = {
  id: string;
  slug: string;
  name: string;
  nameBg: string;
  brand: string;
  category: string;
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
  promoCode: string | null;
  discount: number | null;
  status: string;
  archived: boolean;
  createdAt: string;
};

type Message = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

type PromoCode = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  note: string | null;
  minOrder: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
};

type SpinEntry = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  prize: string;
  code: string | null;
  marketing: boolean;
  createdAt: string;
};

type QuizSession = {
  id: string;
  visitorId: string;
  locale: string;
  completed: boolean;
  lastStep: string;
  favorite: string | null;
  favoriteHit: string | null;
  families: string[];
  occasion: string | null;
  season: string | null;
  vibe: string | null;
  intensity: string | null;
  target: string | null;
  recommended: { id: string; name: string; brand: string; match: number }[];
  requestId: string | null;
  convertedAt: string | null;
  createdAt: string;
};

/** Bulgarian labels for the quiz answer keys stored in the database. */
const QUIZ_LABELS: Record<string, string> = {
  // scent families
  citrus: "Цитрусови", floral: "Цветни", gourmand: "Сладки", fruity: "Плодови",
  woody: "Дървесни", spicy: "Подправки", fresh: "Свежи", amber: "Амброви",
  leather: "Кожа и тютюн", musk: "Мускусни",
  // occasion
  day: "За всеки ден", night: "За вечерта", work: "За работа", special: "Специален повод",
  // season
  spring: "Пролет", summer: "Лято", autumn: "Есен", winter: "Зима",
  // vibe
  elegant: "Елегантен", seductive: "Съблазнителен", clean: "Свеж и чист",
  bold: "Забележим", cozy: "Уютен",
  // intensity
  subtle: "Дискретна", balanced: "Балансирана", strong: "Силна",
  // target
  women: "За жена", men: "За мъж", unisex: "Унисекс",
  // steps (used by the drop-off panel)
  favorite: "Любим парфюм", families: "Аромати", occasion: "Повод",
  season: "Сезон", vibe: "Впечатление", intensity: "Сила", target: "За кого",
};

/** A labelled bar list for one quiz question. */
function QuizBreakdown({
  title, rows, total, multi,
}: {
  title: string;
  rows: [string, number][];
  total: number;
  multi?: boolean;
}) {
  const max = rows[0]?.[1] || 1;
  return (
    <div className="bg-[#161410] border border-[#2A2418] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase">{title}</p>
        {multi && <span className="text-[#F5ECD7]/20 text-[10px]">няколко отговора</span>}
      </div>
      {rows.length === 0 ? (
        <p className="text-[#F5ECD7]/20 text-sm py-3">Няма данни.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {rows.map(([key, n]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#F5ECD7]/70">{QUIZ_LABELS[key] || key}</span>
                <span className="text-[#F5ECD7]/40">
                  {n}
                  {total > 0 && <span className="text-[#F5ECD7]/20"> · {Math.round((n / total) * 100)}%</span>}
                </span>
              </div>
              <div className="h-1.5 bg-[#0D0B08] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3]"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Tab = "products" | "requests" | "messages" | "promos" | "spins" | "email";

export default function AdminDashboardClient({
  products: initialProducts,
  requests: initialRequests,
  messages: initialMessages,
  promoCodes: initialPromos,
  spinEntries: initialSpins,
  quizSessions: initialQuiz,
}: {
  products: Product[];
  requests: Request[];
  messages: Message[];
  promoCodes: PromoCode[];
  spinEntries: SpinEntry[];
  quizSessions: QuizSession[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState(initialProducts);
  const [requests, setRequests] = useState(initialRequests);
  const [messages, setMessages] = useState(initialMessages);
  const [promos, setPromos] = useState(initialPromos);
  const [spins] = useState(initialSpins);
  const [quiz] = useState(initialQuiz);

  /* ---- Scent Journey analytics ---- */
  const quizStats = useMemo(() => {
    const started = quiz.length;
    const done = quiz.filter(q => q.completed);
    const converted = quiz.filter(q => q.convertedAt);

    const tally = (values: (string | null)[]) => {
      const m = new Map<string, number>();
      for (const v of values) if (v) m.set(v, (m.get(v) || 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    };

    return {
      started,
      completed: done.length,
      completionRate: started ? Math.round((done.length / started) * 100) : 0,
      converted: converted.length,
      conversionRate: done.length ? Math.round((converted.length / done.length) * 100) : 0,
      dropOff: tally(quiz.filter(q => !q.completed).map(q => q.lastStep)),
      families: tally(done.flatMap(q => (Array.isArray(q.families) ? q.families : []))),
      occasion: tally(done.map(q => q.occasion)),
      season: tally(done.map(q => q.season)),
      vibe: tally(done.map(q => q.vibe)),
      intensity: tally(done.map(q => q.intensity)),
      target: tally(done.map(q => q.target)),
      favourites: tally(done.map(q => q.favorite?.trim() || null)),
      topSuggested: tally(
        done.flatMap(q => (Array.isArray(q.recommended) ? q.recommended.map(r => `${r.brand} — ${r.name}`) : []))
      ).slice(0, 8),
    };
  }, [quiz]);
  const [newPromo, setNewPromo] = useState({ code: "", discountType: "percent", discountValue: "", minOrder: "", startsAt: "", expiresAt: "", usageLimit: "", source: "standard" });
  const [promoError, setPromoError] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Email compose
  const [compose, setCompose] = useState({ to: "", subject: "", message: "" });
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const replyTo = (email: string | null, subject: string) => {
    if (!email) return;
    setCompose({ to: email, subject, message: "" });
    setEmailStatus("idle");
    setEmailError("");
    setTab("email");
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus("sending");
    setEmailError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compose),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Грешка");
      }
      setEmailStatus("sent");
      setCompose({ to: "", subject: "", message: "" });
    } catch (err) {
      setEmailStatus("error");
      setEmailError(err instanceof Error ? err.message : "Грешка");
    }
  };
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

  const featuredCount = products.filter(p => p.featured).length;

  const toggleFeatured = async (product: Product) => {
    // Limit: max 12 best-sellers (shown in the "Най-продавани" row)
    if (!product.featured && featuredCount >= 12) {
      alert("Можете да изберете максимум 12 „Най-продавани“ парфюма. Премахнете един, за да добавите нов.");
      return;
    }
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !product.featured }),
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

  const archiveRequest = async (id: string, archived: boolean) => {
    await fetch(`/api/purchase-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setRequests(rs => rs.map(r => r.id === id ? { ...r, archived } : r));
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

  const markMessageRead = async (id: string, read: boolean) => {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setMessages(ms => ms.map(m => m.id === id ? { ...m, read } : m));
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Изтриване на съобщението?")) return;
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    setMessages(ms => ms.filter(m => m.id !== id));
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const res = await fetch("/api/promocodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPromo),
    });
    if (res.ok) {
      const created = await res.json();
      setPromos(ps => [created, ...ps]);
      setNewPromo({ code: "", discountType: "percent", discountValue: "", minOrder: "", startsAt: "", expiresAt: "", usageLimit: "", source: "standard" });
    } else {
      const err = await res.json();
      setPromoError(err.error || "Грешка");
    }
  };

  const togglePromo = async (promo: PromoCode) => {
    const res = await fetch(`/api/promocodes/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPromos(ps => ps.map(p => p.id === updated.id ? updated : p));
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Изтриване на промокода?")) return;
    await fetch(`/api/promocodes/${id}`, { method: "DELETE" });
    setPromos(ps => ps.filter(p => p.id !== id));
  };

  const newRequests = requests.filter(r => r.status === "new" && !r.archived).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  const navItems = [
    { key: "products" as Tab, label: "Продукти", icon: Package },
    { key: "requests" as Tab, label: "Заявки", icon: ShoppingBag, badge: newRequests },
    { key: "messages" as Tab, label: "Съобщения", icon: Mail, badge: unreadMessages },
    { key: "promos" as Tab, label: "Промокодове", icon: Ticket },
    { key: "spins" as Tab, label: "Игри", icon: Gift },
    { key: "email" as Tab, label: "Изпрати имейл", icon: Send },
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
            {tab === "products" ? "Продукти" : tab === "requests" ? "Заявки" : tab === "messages" ? "Съобщения" : tab === "promos" ? "Промокодове" : tab === "spins" ? "Игри" : "Изпрати имейл"}
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
                <p className="text-[#F5ECD7]/30 text-sm mt-1">
                  {products.length} продукта в каталога
                  <span className="ml-3 text-[#C9A84C]/70">★ Най-продавани: {featuredCount}/12</span>
                </p>
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
                    <p className="text-[#C9A84C] text-xs">{priceSummary(product).prices}<span className="text-[#F5ECD7]/30"> · {priceSummary(product).sizes}</span></p>
                    <p className="text-[#F5ECD7]/30 text-xs flex items-center gap-1.5">
                      {product.brand}
                      <span className={`border px-1 py-px text-[10px] ${categoryTag(product.category).className}`}>
                        {categoryTag(product.category).label}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => toggleAvailable(product)}
                      className={`text-xs px-2 py-0.5 border ${product.available ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}
                    >
                      {product.available ? "Активен" : "Скрит"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFeatured(product)}
                        title={product.featured ? "Премахни от „Най-продавани“" : "Добави в „Най-продавани“"}
                        className={product.featured ? "text-[#C9A84C]" : "text-[#F5ECD7]/40 hover:text-[#C9A84C]"}
                      >
                        <Star size={14} fill={product.featured ? "#C9A84C" : "none"} />
                      </button>
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
                      <td className="px-4 py-3 text-[#F5ECD7]/60 text-sm">
                        <div className="flex items-center gap-1.5">
                          {product.brand}
                          <span className={`border px-1 py-px text-[10px] ${categoryTag(product.category).className}`}>
                            {categoryTag(product.category).label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const s = priceSummary(product);
                          return (
                            <div>
                              <span className="text-[#C9A84C] text-sm font-medium">{s.prices}</span>
                              {s.sizes && <span className="block text-[#F5ECD7]/30 text-xs">{s.sizes}</span>}
                            </div>
                          );
                        })()}
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
                          <button
                            onClick={() => toggleFeatured(product)}
                            title={product.featured ? "Премахни от „Най-продавани“" : "Добави в „Най-продавани“"}
                            className={`transition-colors p-1 ${product.featured ? "text-[#C9A84C]" : "text-[#F5ECD7]/40 hover:text-[#C9A84C]"}`}
                          >
                            <Star size={14} fill={product.featured ? "#C9A84C" : "none"} />
                          </button>
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
            <div className="flex items-center justify-between mb-6 md:mb-8 gap-4 flex-wrap">
              <div className="hidden md:block">
                <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Заявки за покупка</h1>
                <p className="text-[#F5ECD7]/30 text-sm mt-1">
                  {requests.filter(r => !r.archived).length} активни · {requests.filter(r => r.archived).length} архивирани
                </p>
              </div>
              <button
                onClick={() => setShowArchived(v => !v)}
                className={`text-xs tracking-widest uppercase px-4 py-2 border transition-colors ${
                  showArchived
                    ? "bg-[#C9A84C] text-[#0D0B08] border-[#C9A84C]"
                    : "border-[#2A2418] text-[#F5ECD7]/50 hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
                }`}
              >
                {showArchived ? "← Активни заявки" : "Архивирани"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {requests.filter(r => showArchived ? r.archived : !r.archived).map(req => {
                const items = req.items as { name: string; nameBg: string; volume: string; price: number; qty?: number }[];
                const itemsTotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
                const statusBorder = req.status === "new"
                  ? "border-l-yellow-400/70"
                  : req.status === "contacted"
                  ? "border-l-blue-400/70"
                  : "border-l-emerald-400/70";
                return (
                  <div key={req.id} className={`bg-[#161410] border border-[#2A2418] border-l-4 ${statusBorder} p-4 md:p-6`}>
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
                          <p className="text-[#F5ECD7]/50 text-sm mt-0.5 flex items-center gap-2">
                            {req.email}
                            <button onClick={() => replyTo(req.email, "Относно Вашата заявка — Premium Perfumes")} className="text-[#C9A84C]/70 hover:text-[#C9A84C] text-xs underline">
                              имейл
                            </button>
                          </p>
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
                          {dateTime(req.createdAt)}
                        </span>
                        <select
                          value={req.status}
                          onChange={e => updateRequestStatus(req.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-none border font-medium ${
                            req.status === "new"
                              ? "border-yellow-400/40 text-yellow-300"
                              : req.status === "contacted"
                              ? "border-blue-400/40 text-blue-300"
                              : "border-emerald-400/40 text-emerald-300"
                          }`}
                        >
                          <option value="new">Нова</option>
                          <option value="contacted">Свързахме се</option>
                          <option value="fulfilled">Изпълнена</option>
                        </select>
                        <button
                          onClick={() => archiveRequest(req.id, !req.archived)}
                          title={req.archived ? "Възстанови" : "Архивирай"}
                          className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors p-1"
                        >
                          <Archive size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2A2418]">
                      <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-2">Артикули</p>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-[#F5ECD7]/70">{item.name} — {item.volume}{(item.qty || 1) > 1 ? ` × ${item.qty}` : ""}</span>
                          <span className="text-[#C9A84C]">{formatPrice(item.price * (item.qty || 1))}</span>
                        </div>
                      ))}
                      {req.promoCode && req.discount != null ? (
                        <>
                          <div className="flex justify-between text-sm py-1 text-emerald-400">
                            <span>Промокод: {req.promoCode}</span>
                            <span>− {formatPrice(req.discount)}</span>
                          </div>
                          <div className="flex justify-between text-sm py-1 mt-1 pt-2 border-t border-[#2A2418] font-semibold">
                            <span className="text-[#F5ECD7]">Крайна цена</span>
                            <span className="text-[#C9A84C]">{formatPrice(itemsTotal - req.discount)}</span>
                          </div>
                        </>
                      ) : items.length > 1 && (
                        <div className="flex justify-between text-sm py-1 mt-1 pt-2 border-t border-[#2A2418] font-semibold">
                          <span className="text-[#F5ECD7]">Общо</span>
                          <span className="text-[#C9A84C]">{formatPrice(itemsTotal)}</span>
                        </div>
                      )}
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
              {requests.filter(r => showArchived ? r.archived : !r.archived).length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">
                  {showArchived ? "Няма архивирани заявки." : "Няма активни заявки."}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Съобщения от контактната форма</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">{messages.length} съобщения</p>
            </div>

            <div className="flex flex-col gap-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`border p-4 md:p-6 transition-colors ${
                    msg.read ? "bg-[#161410] border-[#2A2418]" : "bg-[#1A1510] border-[#C9A84C]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[#F5ECD7] font-medium flex items-center gap-2">
                        {msg.name}
                        {!msg.read && <span className="text-[#0D0B08] bg-[#C9A84C] text-[10px] font-bold px-1.5 py-0.5 tracking-wider">НОВО</span>}
                      </p>
                      {msg.email && <p className="text-[#C9A84C] text-sm mt-0.5">{msg.email}</p>}
                      {msg.phone && (
                        <p className="text-[#F5ECD7]/50 text-sm flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {msg.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#F5ECD7]/30 text-xs">
                        {dateTime(msg.createdAt)}
                      </span>
                      {msg.email && (
                        <button
                          onClick={() => replyTo(msg.email, "Re: Вашето запитване до Premium Perfumes")}
                          className="text-xs px-2.5 py-1 border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                        >
                          Отговори
                        </button>
                      )}
                      <button
                        onClick={() => markMessageRead(msg.id, !msg.read)}
                        className="text-xs px-2.5 py-1 border border-[#2A2418] text-[#F5ECD7]/50 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors"
                      >
                        {msg.read ? "Маркирай като ново" : "Маркирай прочетено"}
                      </button>
                      <button onClick={() => deleteMessage(msg.id)} className="text-[#F5ECD7]/40 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2A2418]">
                    <p className="text-[#F5ECD7]/70 text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">Няма съобщения все още.</div>
              )}
            </div>
          </div>
        )}

        {tab === "promos" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Промокодове</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">{promos.length} кода</p>
            </div>

            {/* Create form */}
            <form onSubmit={createPromo} className="bg-[#161410] border border-[#C9A84C]/20 p-5 mb-6">
              <p className="text-xs text-[#C9A84C] tracking-widest uppercase mb-4">Нов промокод</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Код *</label>
                  <input required value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="ЛЯТО10" className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Тип отстъпка</label>
                  <select value={newPromo.discountType} onChange={e => setNewPromo(p => ({ ...p, discountType: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-none">
                    <option value="percent">Процент (%)</option>
                    <option value="fixed">Фиксирана (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Стойност *</label>
                  <input required type="number" step="0.01" min="0" value={newPromo.discountValue} onChange={e => setNewPromo(p => ({ ...p, discountValue: e.target.value }))} placeholder={newPromo.discountType === "percent" ? "10" : "5"} className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Мин. поръчка (€)</label>
                  <input type="number" step="0.01" min="0" value={newPromo.minOrder} onChange={e => setNewPromo(p => ({ ...p, minOrder: e.target.value }))} placeholder="по желание" className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Валиден от</label>
                  <input type="date" value={newPromo.startsAt} onChange={e => setNewPromo(p => ({ ...p, startsAt: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Валиден до</label>
                  <input type="date" value={newPromo.expiresAt} onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Лимит употреби</label>
                  <input type="number" min="1" value={newPromo.usageLimit} onChange={e => setNewPromo(p => ({ ...p, usageLimit: e.target.value }))} placeholder="неогр." className="w-full px-3 py-2 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Кампания</label>
                  <select value={newPromo.source} onChange={e => setNewPromo(p => ({ ...p, source: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-none">
                    <option value="standard">Обикновен код</option>
                    <option value="quiz">Ароматно пътешествие</option>
                  </select>
                </div>
              </div>
              <p className="text-[#F5ECD7]/25 text-xs mt-3 leading-relaxed">
                „Ароматно пътешествие" се прилага автоматично на всеки, който завърши въпросника — докато е активен и в срок.
              </p>
              {promoError && <p className="text-red-400 text-xs mt-3">{promoError}</p>}
              <button type="submit" className="mt-4 flex items-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-4 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors">
                <Plus size={14} /> Създай код
              </button>
            </form>

            {/* Codes list */}
            <div className="flex flex-col gap-3">
              {promos.map(promo => {
                const expired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
                const exhausted = promo.usageLimit !== null && promo.usageCount >= promo.usageLimit;
                return (
                  <div key={promo.id} className="bg-[#161410] border border-[#2A2418] p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <span className="text-[#C9A84C] font-bold text-lg tracking-wider">{promo.code}</span>
                      <span className="text-[#F5ECD7]/70 text-sm">
                        {promo.discountType === "freebie"
                          ? (promo.note || "Подарък")
                          : promo.discountType === "percent"
                          ? `-${promo.discountValue}%`
                          : `-${promo.discountValue.toFixed(2)} €`}
                      </span>
                      {promo.minOrder !== null && (
                        <span className="text-[#F5ECD7]/30 text-xs">мин. {promo.minOrder.toFixed(2)} €</span>
                      )}
                      {promo.expiresAt && (
                        <span className={`text-xs ${expired ? "text-red-400" : "text-[#F5ECD7]/30"}`}>
                          до {new Date(promo.expiresAt).toLocaleDateString("bg-BG")}
                        </span>
                      )}
                      <span className="text-[#F5ECD7]/30 text-xs">
                        употреби: {promo.usageCount}{promo.usageLimit !== null ? ` / ${promo.usageLimit}` : ""}
                      </span>
                      <span className="text-[#F5ECD7]/30 text-xs">създаден: {dateTime(promo.createdAt)}</span>
                      {(expired || exhausted) && (
                        <span className="text-red-400/70 text-xs border border-red-500/30 px-1.5 py-0.5">
                          {expired ? "изтекъл" : "изчерпан"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePromo(promo)}
                        className={`text-xs px-2.5 py-1 border transition-colors ${
                          promo.active
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        {promo.active ? "Активен" : "Изключен"}
                      </button>
                      <button onClick={() => deletePromo(promo.id)} className="text-[#F5ECD7]/40 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {promos.length === 0 && (
                <div className="text-center py-16 text-[#F5ECD7]/20">Няма промокодове все още.</div>
              )}
            </div>
          </div>
        )}

        {tab === "spins" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Игри и въпросници</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">Ароматно пътешествие · архив на колелото</p>
            </div>

            {/* ===== Scent Journey ===== */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles size={17} className="text-[#C9A84C]" />
                <h2 className="text-lg text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Ароматно пътешествие
                </h2>
                <div className="flex-1 h-px bg-[#2A2418]" />
              </div>

              {/* headline numbers */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Започнали", value: quizStats.started, hint: "отворили въпросника" },
                  { label: "Завършили", value: quizStats.completed, hint: `${quizStats.completionRate}% от започналите` },
                  { label: "Поръчали", value: quizStats.converted, hint: `${quizStats.conversionRate}% от завършилите` },
                  {
                    label: "Най-търсено",
                    value: quizStats.families[0] ? QUIZ_LABELS[quizStats.families[0][0]] || quizStats.families[0][0] : "—",
                    hint: quizStats.families[0] ? `${quizStats.families[0][1]} пъти` : "няма данни",
                    small: true,
                  },
                ].map(c => (
                  <div key={c.label} className="bg-[#161410] border border-[#2A2418] p-4">
                    <p className="text-[#F5ECD7]/30 text-[10px] tracking-widest uppercase mb-2">{c.label}</p>
                    <p className={`text-[#C9A84C] ${c.small ? "text-lg" : "text-3xl"} font-semibold leading-tight`}>{c.value}</p>
                    <p className="text-[#F5ECD7]/25 text-xs mt-1">{c.hint}</p>
                  </div>
                ))}
              </div>

              {quizStats.started === 0 ? (
                <div className="bg-[#161410] border border-[#2A2418] text-center py-14 text-[#F5ECD7]/20">
                  Още никой не е минал през въпросника.
                </div>
              ) : (
                <>
                  {/* answer breakdowns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
                    <QuizBreakdown title="Предпочитани аромати" rows={quizStats.families} total={quizStats.completed} multi />
                    <QuizBreakdown title="Кога ще го носят" rows={quizStats.occasion} total={quizStats.completed} />
                    <QuizBreakdown title="Сезон" rows={quizStats.season} total={quizStats.completed} />
                    <QuizBreakdown title="Желано впечатление" rows={quizStats.vibe} total={quizStats.completed} />
                    <QuizBreakdown title="Сила на аромата" rows={quizStats.intensity} total={quizStats.completed} />
                    <QuizBreakdown title="За кого" rows={quizStats.target} total={quizStats.completed} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
                    {/* most suggested products */}
                    <div className="bg-[#161410] border border-[#2A2418] p-4">
                      <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase mb-3">Най-често предлагани</p>
                      {quizStats.topSuggested.length === 0 ? (
                        <p className="text-[#F5ECD7]/20 text-sm py-4">Няма данни.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {quizStats.topSuggested.map(([name, n]) => (
                            <div key={name} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-[#F5ECD7]/70 truncate">{name}</span>
                              <span className="text-[#C9A84C] flex-shrink-0">{n}×</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* free-text favourites — direct demand signal */}
                    <div className="bg-[#161410] border border-[#2A2418] p-4">
                      <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase mb-1">Посочени любими парфюми</p>
                      <p className="text-[#F5ECD7]/25 text-xs mb-3">Какво търсят клиентите — идеи какво да заредите.</p>
                      {quizStats.favourites.length === 0 ? (
                        <p className="text-[#F5ECD7]/20 text-sm py-4">Никой не е попълнил това поле.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {quizStats.favourites.slice(0, 24).map(([name, n]) => (
                            <span key={name} className="text-xs px-2 py-1 border border-[#2A2418] text-[#F5ECD7]/60">
                              {name}{n > 1 && <span className="text-[#C9A84C]"> ×{n}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* where people give up */}
                  {quizStats.dropOff.length > 0 && (
                    <div className="bg-[#161410] border border-[#2A2418] p-4 mb-6">
                      <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase mb-1">Къде се отказват</p>
                      <p className="text-[#F5ECD7]/25 text-xs mb-3">Последният въпрос, който са видели преди да затворят.</p>
                      <div className="flex flex-wrap gap-2">
                        {quizStats.dropOff.map(([step, n]) => (
                          <span key={step} className="text-xs px-2.5 py-1.5 border border-[#2A2418] text-[#F5ECD7]/60">
                            {QUIZ_LABELS[step] || step} <span className="text-[#C9A84C]">{n}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* recent runs */}
                  <div className="bg-[#161410] border border-[#2A2418] overflow-x-auto">
                    <table className="w-full min-w-[820px]">
                      <thead>
                        <tr className="border-b border-[#2A2418]">
                          {["Дата", "Статус", "Любим парфюм", "Отговори", "Предложени", "Поръчка"].map(h => (
                            <th key={h} className="text-left text-xs text-[#F5ECD7]/30 tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quiz.slice(0, 60).map(q => (
                          <tr key={q.id} className="border-b border-[#2A2418]/50 hover:bg-[#1A1612] transition-colors align-top">
                            <td className="px-4 py-3 text-[#F5ECD7]/30 text-xs whitespace-nowrap">{dateTime(q.createdAt)}</td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                              {q.completed
                                ? <span className="text-emerald-400">Завършен</span>
                                : <span className="text-[#F5ECD7]/30">Спрял на „{QUIZ_LABELS[q.lastStep] || q.lastStep}"</span>}
                            </td>
                            <td className="px-4 py-3 text-[#F5ECD7]/60 text-xs max-w-[160px]">
                              {q.favorite || "—"}
                              {q.favoriteHit && <div className="text-[#C9A84C]/60 mt-0.5">≈ {q.favoriteHit}</div>}
                            </td>
                            <td className="px-4 py-3 text-[#F5ECD7]/50 text-xs max-w-[240px]">
                              {[
                                ...(Array.isArray(q.families) ? q.families : []),
                                q.occasion, q.season, q.vibe, q.intensity, q.target,
                              ].filter(Boolean).map(k => QUIZ_LABELS[k as string] || k).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-[#F5ECD7]/50 text-xs max-w-[220px]">
                              {Array.isArray(q.recommended) && q.recommended.length > 0
                                ? q.recommended.map(r => <div key={r.id}>{r.brand} — {r.name}</div>)
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                              {q.convertedAt
                                ? <span className="text-emerald-400">✓ Да</span>
                                : <span className="text-[#F5ECD7]/20">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* ===== Wheel archive ===== */}
            <div className="flex items-center gap-3 mb-5">
              <Gift size={17} className="text-[#F5ECD7]/40" />
              <h2 className="text-lg text-[#F5ECD7]/70" style={{ fontFamily: "var(--font-playfair)" }}>
                Колело на късмета (архив)
              </h2>
              <div className="flex-1 h-px bg-[#2A2418]" />
            </div>
            <p className="text-[#F5ECD7]/30 text-sm mb-4">
              {spins.length} участници · {spins.filter(s => s.marketing).length} съгласни за маркетинг
            </p>

            <div className="bg-[#161410] border border-[#2A2418] overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#2A2418]">
                    {["Име", "Контакт", "Награда", "Код", "Маркетинг", "Дата"].map(h => (
                      <th key={h} className="text-left text-xs text-[#F5ECD7]/30 tracking-widest uppercase px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spins.map(s => (
                    <tr key={s.id} className="border-b border-[#2A2418]/50 hover:bg-[#1A1612] transition-colors">
                      <td className="px-4 py-3 text-[#F5ECD7] text-sm">{s.name || "—"}</td>
                      <td className="px-4 py-3 text-[#F5ECD7]/60 text-sm">
                        {s.email && <div>{s.email}</div>}
                        {s.phone && <div className="text-[#C9A84C]">{s.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-[#F5ECD7]/70 text-sm">{s.prize}</td>
                      <td className="px-4 py-3 text-[#C9A84C] text-sm font-medium">{s.code || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {s.marketing ? <span className="text-emerald-400">✓ Да</span> : <span className="text-[#F5ECD7]/30">Не</span>}
                      </td>
                      <td className="px-4 py-3 text-[#F5ECD7]/30 text-xs">{dateTime(s.createdAt)}</td>
                    </tr>
                  ))}
                  {spins.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-16 text-[#F5ECD7]/20">Няма участници все още.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "email" && (
          <div className="p-4 md:p-8">
            <div className="hidden md:block mb-8">
              <h1 className="text-2xl text-[#F5ECD7]" style={{ fontFamily: "var(--font-playfair)" }}>Изпрати имейл</h1>
              <p className="text-[#F5ECD7]/30 text-sm mt-1">От info@premiumperfumes.bg</p>
            </div>

            {emailStatus === "sent" ? (
              <div className="max-w-xl bg-[#161410] border border-emerald-500/30 p-8 text-center">
                <div className="text-3xl mb-3 text-emerald-400">✓</div>
                <p className="text-[#F5ECD7]">Имейлът е изпратен успешно.</p>
                <button onClick={() => setEmailStatus("idle")} className="mt-5 text-xs tracking-widest uppercase border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-2 hover:bg-[#C9A84C]/10 transition-colors">
                  Нов имейл
                </button>
              </div>
            ) : (
              <form onSubmit={sendEmail} className="max-w-xl bg-[#161410] border border-[#2A2418] p-5 md:p-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">До (имейл) *</label>
                  <input required type="email" value={compose.to} onChange={e => setCompose(c => ({ ...c, to: e.target.value }))} placeholder="получател@example.com" className="w-full px-3 py-2.5 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Тема *</label>
                  <input required value={compose.subject} onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
                </div>
                <div>
                  <label className="text-xs text-[#C9A84C]/70 tracking-widest uppercase block mb-1.5 font-semibold">Съобщение *</label>
                  <textarea required rows={10} value={compose.message} onChange={e => setCompose(c => ({ ...c, message: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none resize-y" />
                  <p className="text-[#F5ECD7]/30 text-xs mt-1.5">Изпраща се с фирмен дизайн (лого и контакти).</p>
                </div>
                {emailStatus === "error" && <p className="text-red-400 text-xs">{emailError}</p>}
                <button type="submit" disabled={emailStatus === "sending"} className="flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0D0B08] px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50">
                  <Send size={14} />
                  {emailStatus === "sending" ? "Изпращане..." : "Изпрати"}
                </button>
              </form>
            )}
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
