"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { PRIZES } from "@/lib/prizes";

const SEG = 360 / PRIZES.length;

export default function SpinWheel({ onClose }: { onClose?: () => void }) {
  const locale = useLocale();
  const bg = locale === "bg";
  const [phase, setPhase] = useState<"ready" | "spinning" | "won" | "claimed">("ready");
  const [rotation, setRotation] = useState(0);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", marketing: false });
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<{ prize: string; code: string | null } | null>(null);
  const [error, setError] = useState("");
  const spinning = useRef(false);

  const conic = `conic-gradient(${PRIZES.map((p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(", ")})`;

  const spin = async () => {
    if (spinning.current) return;
    spinning.current = true;
    setPhase("spinning");
    setError("");
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "spin" }),
      });
      const data = await res.json();
      const idx = data.prizeIndex as number;
      setPrizeIndex(idx);
      // Rotate so the center of segment idx lands at the top pointer
      const target = 360 * 6 - (idx * SEG + SEG / 2);
      setRotation(target);
      setTimeout(() => {
        setPhase("won");
        spinning.current = false;
      }, 4200);
    } catch {
      setError(bg ? "Грешка. Опитайте отново." : "Error. Try again.");
      setPhase("ready");
      spinning.current = false;
    }
  };

  const claim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError(bg ? "Моля, въведете име и имейл." : "Please enter your name and email.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", prizeIndex, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setResult({ prize: data.prize, code: data.code });
      setPhase("claimed");
    } catch {
      setError(bg ? "Грешка. Опитайте отново." : "Error. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Wheel */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 mb-10">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20"
          style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "22px solid #C9A84C" }} />

        {/* Disc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-[#C9A84C] shadow-2xl"
          style={{
            background: conic,
            transform: `rotate(${rotation}deg)`,
            transition: phase === "spinning" ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          {PRIZES.map((p, i) => {
            const center = i * SEG + SEG / 2;
            const light = p.color === "#E8D5A3" || p.color === "#C9A84C";
            return (
              <div
                key={i}
                className="absolute top-0 left-1/2 h-1/2 origin-bottom pointer-events-none"
                style={{ transform: `translateX(-50%) rotate(${center}deg)` }}
              >
                <span
                  className="block text-[11px] md:text-sm font-bold whitespace-nowrap mt-5 md:mt-7"
                  style={{ color: light ? "#0D0B08" : "#E8D5A3" }}
                >
                  {p.short}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0D0B08] border-2 border-[#C9A84C] z-10 flex items-center justify-center">
          <span className="text-[#C9A84C] text-lg">✦</span>
        </div>
      </div>

      {/* Controls / result */}
      {phase === "ready" && (
        <button onClick={spin} className="px-10 py-4 bg-[#C9A84C] text-[#0D0B08] text-sm font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors">
          {bg ? "Завърти колелото" : "Spin the wheel"}
        </button>
      )}
      {phase === "spinning" && (
        <p className="text-[#C9A84C] text-sm tracking-widest uppercase animate-pulse">{bg ? "Върти се..." : "Spinning..."}</p>
      )}

      {phase === "won" && prizeIndex !== null && (
        <div className="w-full max-w-sm text-center">
          <p className="text-[#F5ECD7]/60 text-sm mb-1">{bg ? "Спечелихте" : "You won"}</p>
          <p className="text-2xl text-gradient-gold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            {bg ? PRIZES[prizeIndex].label : PRIZES[prizeIndex].labelEn}
          </p>
          <p className="text-[#F5ECD7]/50 text-xs mb-4">{bg ? "Оставете данни за контакт, за да получите наградата си." : "Leave your contact details to claim your prize."}</p>
          <form onSubmit={claim} className="flex flex-col gap-3 text-left">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={bg ? "Име *" : "Name *"} className="w-full px-3 py-2.5 text-sm rounded-none" />
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={bg ? "Имейл *" : "Email *"} className="w-full px-3 py-2.5 text-sm rounded-none" />
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={bg ? "Телефон (по желание)" : "Phone (optional)"} className="w-full px-3 py-2.5 text-sm rounded-none" />
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#C9A84C] flex-shrink-0" />
              <span className="text-xs text-[#F5ECD7]/50 leading-relaxed">
                {bg ? "Съгласен съм с " : "I agree to the "}
                <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline">{bg ? "Политиката за поверителност" : "Privacy Policy"}</a>.
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={form.marketing} onChange={e => setForm(f => ({ ...f, marketing: e.target.checked }))} className="w-4 h-4 mt-0.5 accent-[#C9A84C] flex-shrink-0" />
              <span className="text-xs text-[#F5ECD7]/50 leading-relaxed">
                {bg ? "Искам да получавам промоционални съобщения (по желание)." : "I want to receive promotional messages (optional)."}
              </span>
            </label>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="w-full py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors">
              {bg ? "Вземи наградата" : "Claim prize"}
            </button>
          </form>
        </div>
      )}

      {phase === "claimed" && result && (
        <div className="w-full max-w-sm text-center">
          <div className="text-3xl mb-3 text-[#C9A84C]">🎉</div>
          <p className="text-[#F5ECD7] mb-2">{bg ? "Поздравления!" : "Congratulations!"}</p>
          {result.code ? (
            <>
              <p className="text-[#F5ECD7]/50 text-sm mb-3">{bg ? "Вашият промокод:" : "Your promo code:"}</p>
              <div className="text-2xl font-bold tracking-[0.3em] text-[#C9A84C] border border-[#C9A84C]/40 py-3 mb-3">{result.code}</div>
              <p className="text-[#F5ECD7]/40 text-xs">{bg ? "Въведете го при заявка за покупка. Валиден 30 дни." : "Enter it when sending a purchase request. Valid 30 days."}</p>
            </>
          ) : (
            <p className="text-[#F5ECD7]/50 text-sm">{bg ? `Спечелихте: ${result.prize}. Споменете го при заявка и ще го приложим.` : `You won: ${result.prize}. Mention it with your order and we'll apply it.`}</p>
          )}
          {onClose && (
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors">
              {bg ? "Разгледай каталога" : "Browse the catalog"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
