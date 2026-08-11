"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowLeft, ArrowRight, Sparkles, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import {
  STEPS, FAMILIES, OCCASIONS, SEASONS, VIBES, INTENSITIES, TARGETS,
  EMPTY_ANSWERS, recommend, decantVariantOf,
  type QuizAnswers, type StepKey, type FamilyKey,
  type Occasion, type Season, type Vibe, type Intensity, type Target,
} from "@/lib/quiz";
import { getVisitorId, newSessionId } from "@/lib/visitor";
import { playCue, haptic, goldDust, goldShower, isMuted, setMuted } from "@/lib/feedback";
import QuizArt, { MixingArt } from "./QuizArt";
import type { Product } from "@/lib/types";

const FAMILY_ICON: Record<FamilyKey, string> = {
  citrus: "🍋", floral: "🌸", gourmand: "🍯", fruity: "🍑", woody: "🪵",
  spicy: "🌶", fresh: "💧", amber: "🔥", leather: "🖤", musk: "🤍",
};

/** Counts the match percentage up from zero — the small payoff on reveal. */
function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced) {
      setN(to);
      return;
    }
    const DURATION = 900;
    let raf = 0;
    let start = 0;

    const timer = setTimeout(() => {
      const tick = (t: number) => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / DURATION);
        // ease-out so it decelerates into the final number
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    // rAF is paused while a tab is hidden — make sure the real number still
    // lands rather than leaving the customer looking at "0%".
    const safety = setTimeout(() => setN(to), delay + DURATION + 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(safety);
      cancelAnimationFrame(raf);
    };
  }, [to, delay, reduced]);

  return <>{n}</>;
}

export default function ScentJourney({
  products,
  open,
  onClose,
}: {
  products: Product[];
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("quiz");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const { add } = useCart();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(EMPTY_ANSWERS);
  const [finished, setFinished] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const [sound, setSound] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => setSound(!isMuted()), []);

  /** Sound + haptics + a burst of dust from wherever the click landed. */
  const feedback = useCallback((cue: Parameters<typeof playCue>[0], e?: React.MouseEvent, dust = 14) => {
    playCue(cue);
    haptic(cue === "reveal" ? 18 : 8);
    if (e) goldDust(e.clientX, e.clientY, dust);
  }, []);

  const isLast = stepIndex === STEPS.length - 1;

  const results = useMemo(
    () => (finished ? recommend(products, answers, 3) : []),
    [finished, products, answers]
  );

  // --- anonymous usage tracking (see lib/visitor.ts) ---
  const sessionRef = useRef<string>("");
  const trackedRef = useRef(false);

  const track = useCallback(
    (payload: { completed?: boolean; lastStep?: StepKey; answers?: QuizAnswers; recommended?: unknown[] }) => {
      if (!sessionRef.current) return;
      const body = JSON.stringify({
        sessionId: sessionRef.current,
        visitorId: getVisitorId(),
        locale,
        ...payload,
      });
      try {
        // keepalive so the record still lands if the tab is closing
        fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
          .catch(() => {});
      } catch {
        /* analytics must never break the journey */
      }
    },
    [locale]
  );

  const reset = useCallback(() => {
    setStepIndex(0);
    setAnswers(EMPTY_ANSWERS);
    setFinished(false);
    setRevealing(false);
    setAdded([]);
    sessionRef.current = newSessionId();
    trackedRef.current = false;
  }, []);

  // Start a new tracked session each time the journey is opened
  useEffect(() => {
    if (!open) return;
    if (!sessionRef.current) sessionRef.current = newSessionId();
    track({ lastStep: "families", completed: false });
  }, [open, track]);

  // Record the finished journey with the answers and what we suggested
  useEffect(() => {
    if (!finished || results.length === 0 || trackedRef.current) return;
    trackedRef.current = true;
    track({
      completed: true,
      lastStep: "target",
      answers,
      recommended: results.map(r => ({
        id: r.product.id,
        name: r.product.name,
        brand: r.product.brand,
        match: r.match,
      })),
    });
  }, [finished, results, answers, track]);

  // Lock background scroll while the journey is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const step: StepKey = STEPS[stepIndex];

  /** Closing before the reveal still records how far they got. */
  const closeJourney = useCallback(() => {
    if (!finished && !trackedRef.current) {
      track({ completed: false, lastStep: step, answers });
    }
    onClose();
  }, [finished, step, answers, track, onClose]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeJourney();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeJourney]);

  if (!open) return null;

  const canAdvance = (() => {
    switch (step) {
      case "families": return answers.families.length > 0;
      case "occasion": return !!answers.occasion;
      case "season": return !!answers.season;
      case "vibe": return !!answers.vibe;
      case "intensity": return !!answers.intensity;
      case "target": return !!answers.target;
    }
  })();

  const next = (e?: React.MouseEvent) => {
    if (!canAdvance) return;
    if (isLast) {
      feedback("reveal", e, 26);
      setRevealing(true);
      // short "mixing your scent" beat before the reveal
      setTimeout(() => {
        setFinished(true);
        setRevealing(false);
        goldShower();
      }, 1400);
    } else {
      feedback("advance", e, 16);
      setFlash(true);
      setTimeout(() => setFlash(false), 620);
      setStepIndex(i => i + 1);
    }
  };

  const back = (e?: React.MouseEvent) => {
    feedback("back", e, 8);
    setStepIndex(i => Math.max(0, i - 1));
  };

  /* ---------- option pickers ---------- */

  const pick = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers(a => ({ ...a, [key]: value }));
  };

  const toggleFamily = (f: FamilyKey) => {
    setAnswers(a => ({
      ...a,
      families: a.families.includes(f) ? a.families.filter(x => x !== f) : [...a.families, f],
    }));
  };

  const toggleSound = () => {
    const willBeMuted = sound; // it is on right now, so pressing mutes it
    setMuted(willBeMuted);
    setSound(!willBeMuted);
    if (!willBeMuted) playCue("select"); // just switched back on — confirm audibly
  };

  const addDecant = (r: (typeof results)[number]) => {
    const p = r.product;
    const variants = Array.isArray(p.variants) ? p.variants : [];
    // Same helper the displayed price uses, so the two can never diverge
    const decant = decantVariantOf(p) ?? variants[0];
    add({
      productId: p.id,
      name: p.name,
      nameBg: p.nameBg,
      brand: p.brand,
      slug: p.slug,
      image: p.images[0] || "",
      size: decant?.size ?? p.volume,
      price: decant?.price ?? p.price,
      variants,
    });
    setAdded(prev => [...prev, p.id]);
  };

  /* ---------- shared option button ---------- */

  const OptionButton = ({
    active, onClick, label, hint, icon,
  }: {
    active: boolean; onClick: () => void; label: string; hint?: string; icon?: string;
  }) => (
    <button
      type="button"
      onClick={e => {
        // dust only when picking, a quieter tick when un-picking
        feedback(active ? "deselect" : "select", e, active ? 0 : 12);
        onClick();
      }}
      aria-label={label}
      aria-pressed={active}
      className={`group relative text-left px-4 py-3.5 border transition-all duration-300 active:scale-[0.97] ${
        active
          ? "border-[#C9A84C] bg-[#C9A84C]/10 shadow-[0_0_22px_-6px_rgba(201,168,76,0.6)]"
          : "border-[#2A2418] hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/[0.04]"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon && (
          <span className={`text-xl leading-none transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-105"}`}>
            {icon}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className={`block text-sm ${active ? "text-[#C9A84C]" : "text-[#F5ECD7]/85"}`}>{label}</span>
          {hint && <span className="block text-[#F5ECD7]/35 text-xs mt-0.5 leading-snug">{hint}</span>}
        </span>
        {active && <span className="qa-pop text-[#C9A84C] text-sm">✓</span>}
      </span>
    </button>
  );

  /* ---------- step body ---------- */

  const renderStep = () => {
    switch (step) {
      case "families":
        return (
          <div className="qa-slide grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FAMILIES.map(f => (
              <OptionButton
                key={f}
                icon={FAMILY_ICON[f]}
                active={answers.families.includes(f)}
                onClick={() => toggleFamily(f)}
                label={t(`families.${f}.label`)}
                hint={t(`families.${f}.hint`)}
              />
            ))}
          </div>
        );

      case "occasion":
        return (
          <div className="qa-slide grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {OCCASIONS.map(o => (
              <OptionButton
                key={o}
                active={answers.occasion === o}
                onClick={() => pick("occasion", o as Occasion)}
                label={t(`occasions.${o}.label`)}
                hint={t(`occasions.${o}.hint`)}
              />
            ))}
          </div>
        );

      case "season":
        return (
          <div className="qa-slide grid grid-cols-2 gap-2.5">
            {SEASONS.map(s => (
              <OptionButton
                key={s}
                active={answers.season === s}
                onClick={() => pick("season", s as Season)}
                label={t(`seasons.${s}.label`)}
                hint={t(`seasons.${s}.hint`)}
              />
            ))}
          </div>
        );

      case "vibe":
        return (
          <div className="qa-slide grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VIBES.map(v => (
              <OptionButton
                key={v}
                active={answers.vibe === v}
                onClick={() => pick("vibe", v as Vibe)}
                label={t(`vibes.${v}.label`)}
                hint={t(`vibes.${v}.hint`)}
              />
            ))}
          </div>
        );

      case "intensity":
        return (
          <div className="qa-slide grid grid-cols-1 gap-2.5">
            {INTENSITIES.map(i => (
              <OptionButton
                key={i}
                active={answers.intensity === i}
                onClick={() => pick("intensity", i as Intensity)}
                label={t(`intensities.${i}.label`)}
                hint={t(`intensities.${i}.hint`)}
              />
            ))}
          </div>
        );

      case "target":
        return (
          <div className="qa-slide grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TARGETS.map(g => (
              <OptionButton
                key={g}
                active={answers.target === g}
                onClick={() => pick("target", g as Target)}
                label={t(`targets.${g}`)}
              />
            ))}
          </div>
        );
    }
  };

  const progress = finished ? 100 : ((stepIndex + (canAdvance ? 1 : 0)) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0D0B08]/97 backdrop-blur-md">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.06]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)",
        backgroundSize: "30px 30px",
      }} />
      <div className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] max-w-full rounded-full bg-[#C9A84C]/5 blur-3xl" />

      {/* progress */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#2A2418] z-10">
        <div
          className={`h-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3] transition-all duration-700 ease-out ${flash ? "qa-progress-flash" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="fixed top-4 right-4 z-20 flex items-center gap-1">
        <button
          onClick={toggleSound}
          aria-label={sound ? "Изключи звука" : "Включи звука"}
          title={sound ? "Изключи звука" : "Включи звука"}
          className="text-[#F5ECD7]/30 hover:text-[#C9A84C] transition-colors p-2"
        >
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={closeJourney}
          aria-label={t("close")}
          className="text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors p-2"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative min-h-full flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-2xl">

          {/* ---------- mixing interstitial ---------- */}
          {revealing && (
            <div className="text-center qa-enter">
              <MixingArt />
              <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mt-6">{t("mixing")}</p>
            </div>
          )}

          {/* ---------- questions ---------- */}
          {!finished && !revealing && (
            <>
              <div className="text-center mb-1">
                <span className="text-[#C9A84C]/60 text-xs tracking-[0.4em] uppercase">
                  {String(stepIndex + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
              </div>

              <QuizArt step={step} />

              <div className="text-center mt-4 mb-8 qa-slide">
                <h2
                  className="text-2xl md:text-4xl text-gradient-gold leading-tight px-2"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {t(`steps.${step}.title`)}
                </h2>
                <p className="text-[#F5ECD7]/45 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                  {t(`steps.${step}.subtitle`)}
                </p>
              </div>

              {renderStep()}

              <div className="flex items-center gap-3 mt-9">
                <button
                  type="button"
                  onClick={back}
                  disabled={stepIndex === 0}
                  className="flex items-center gap-2 px-4 py-3 border border-[#2A2418] text-[#F5ECD7]/50 text-xs tracking-widest uppercase transition-all hover:border-[#F5ECD7]/25 active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={14} /> {t("back")}
                </button>

                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance}
                  className={`group flex-1 flex items-center justify-center gap-2 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase transition-all hover:bg-[#E8D5A3] active:scale-[0.98] disabled:opacity-25 disabled:cursor-not-allowed ${
                    canAdvance ? "shadow-[0_0_26px_-8px_rgba(201,168,76,0.9)]" : ""
                  }`}
                >
                  {isLast ? t("reveal") : t("next")}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

            </>
          )}

          {/* ---------- results ---------- */}
          {finished && (
            <div>
              <div className="text-center mb-10 qa-enter">
                <div className="flex items-center justify-center gap-3 mb-5">
                  <div className="h-px w-12 bg-[#C9A84C]/40" />
                  <Sparkles size={16} className="text-[#C9A84C]" />
                  <div className="h-px w-12 bg-[#C9A84C]/40" />
                </div>
                <h2
                  className="text-3xl md:text-5xl text-gradient-gold leading-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {t("results.title")}
                </h2>
                <p className="text-[#F5ECD7]/45 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                  {t("results.subtitle")}
                </p>
              </div>

              {results.length === 0 ? (
                <p className="text-center text-[#F5ECD7]/40 py-12">{t("results.empty")}</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.map((r, i) => (
                    <div
                      key={r.product.id}
                      className={`qa-reveal relative flex gap-4 p-4 bg-[#161410] border transition-colors ${
                        i === 0 ? "border-[#C9A84C]/50 qa-halo" : "border-[#2A2418] hover:border-[#C9A84C]/40"
                      }`}
                      style={{ animationDelay: `${i * 0.22}s` }}
                    >
                      {/* rank */}
                      <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>

                      <Link
                        href={`/${locale}/product/${r.product.slug}`}
                        onClick={onClose}
                        className="relative w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0 bg-[#1A1612] overflow-hidden"
                      >
                        {r.product.images[0] ? (
                          <Image
                            src={r.product.images[0]}
                            alt={r.product.name}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">◈</div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[#C9A84C] text-[10px] tracking-widest uppercase truncate">
                            {r.product.brand}
                          </p>
                          <span className="relative overflow-hidden flex-shrink-0 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] tracking-wider px-2 py-0.5">
                            <span className="qa-shine absolute inset-0" />
                            <CountUp to={r.match} delay={i * 220 + 260} />% {t("results.match")}
                          </span>
                        </div>

                        <Link href={`/${locale}/product/${r.product.slug}`} onClick={onClose}>
                          <h3
                            className="text-[#F5ECD7] text-base leading-snug hover:text-[#C9A84C] transition-colors line-clamp-2"
                            style={{ fontFamily: "var(--font-playfair)" }}
                          >
                            {r.product.name}
                          </h3>
                        </Link>

                        {r.reasons.length > 0 && (
                          <p className="text-[#F5ECD7]/40 text-xs mt-1.5 leading-relaxed">
                            {t("results.because")}{" "}
                            <span className="text-[#F5ECD7]/65">
                              {r.reasons.map(f => t(`families.${f}.label`).toLowerCase()).join(", ")}
                            </span>
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-auto pt-3">
                          {r.decantPrice !== null && (
                            <span className="text-[#C9A84C] text-lg font-semibold">
                              {formatPrice(r.decantPrice)}
                            </span>
                          )}
                          <span className="text-[#F5ECD7]/30 text-[10px] tracking-wider uppercase">
                            {t("results.decant")}
                          </span>
                          <button
                            type="button"
                            onClick={e => {
                              if (added.includes(r.product.id)) return;
                              feedback("add", e, 18);
                              addDecant(r);
                            }}
                            disabled={added.includes(r.product.id)}
                            className="ml-auto text-[10px] tracking-widest uppercase px-3 py-2 border border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D0B08] transition-all active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#C9A84C]"
                          >
                            {added.includes(r.product.id) ? t("results.added") : tc("addToCart")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-9">
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-5 py-3 border border-[#2A2418] text-[#F5ECD7]/50 text-xs tracking-widest uppercase hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-colors"
                >
                  <RotateCcw size={14} /> {t("results.again")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors"
                >
                  {t("results.browse")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
