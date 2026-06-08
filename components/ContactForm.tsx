"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ContactForm() {
  const t = useTranslations("contactForm");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto text-center py-8">
        <div className="text-3xl mb-4 text-[#C9A84C]">✓</div>
        <p className="text-[#F5ECD7]">{t("success")}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-xs tracking-widest uppercase border border-[#C9A84C]/50 text-[#C9A84C] px-6 py-2 hover:bg-[#C9A84C]/10 transition-colors"
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("name")} *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
        </div>
        <div>
          <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("email")}</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
        </div>
        <div>
          <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("phone")}</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none" />
        </div>
        <p className="sm:col-span-2 text-[#F5ECD7]/30 text-xs -mt-1">{t("contactHint")}</p>
        <div className="sm:col-span-2">
          <label className="text-xs text-[#F5ECD7]/50 tracking-wider uppercase block mb-1.5">{t("message")} *</label>
          <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-none resize-none" />
        </div>
      </div>
      {status === "error" && <p className="text-red-400 text-xs">{t("error")}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-semibold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "..." : t("submit")}
      </button>
    </form>
  );
}
