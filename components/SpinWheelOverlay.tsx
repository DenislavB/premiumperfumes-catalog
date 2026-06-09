"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import SpinWheel from "./SpinWheel";

const KEY = "pp_spin_seen_v1";

export default function SpinWheelOverlay() {
  const locale = useLocale();
  const bg = locale === "bg";
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-[#0D0B08]/97 backdrop-blur-md">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

      <button
        onClick={close}
        aria-label="close"
        className="fixed top-4 right-4 z-10 text-[#F5ECD7]/50 hover:text-[#C9A84C] transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative min-h-full flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">✦</span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#C9A84C]" />
        </div>
        <h2 className="text-3xl md:text-4xl text-gradient-gold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
          {bg ? "Завъртете и спечелете" : "Spin & Win"}
        </h2>
        <p className="text-[#F5ECD7]/60 mb-10 max-w-md">
          {bg
            ? "Добре дошли в premiumperfumes.bg! Завъртете колелото и спечелете отстъпка или подарък за първата си поръчка."
            : "Welcome to premiumperfumes.bg! Spin the wheel and win a discount or gift for your first order."}
        </p>

        <SpinWheel onClose={close} />

        <button onClick={close} className="mt-8 text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
          {bg ? "Пропусни и разгледай" : "Skip and browse"}
        </button>
      </div>
    </div>
  );
}
