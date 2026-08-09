"use client";

import type { StepKey } from "@/lib/quiz";

/* Deterministic pseudo-random so server and client render the same particles */
const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D5A3";

/* ------------------------------------------------------------------ *
 * 1. Favourite perfume — a bottle whose cap lifts, releasing gold dust
 * ------------------------------------------------------------------ */
function BottleScene() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="qa-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.35" />
          <stop offset="55%" stopColor={GOLD} stopOpacity="0.12" />
          <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="qa-juice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.55" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="qa-halo">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.45" />
          <stop offset="70%" stopColor={GOLD} stopOpacity="0.06" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="120" rx="70" ry="70" fill="url(#qa-halo)" className="qa-breathe" />

      {/* rising particles */}
      <g className="qa-dust">
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 78 + rnd(i + 1) * 64;
          const delay = rnd(i + 40) * 3.2;
          const size = 1 + rnd(i + 80) * 1.9;
          return (
            <circle
              key={i}
              cx={x}
              cy={96}
              r={size}
              fill={i % 3 === 0 ? GOLD_LIGHT : GOLD}
              style={{ animationDelay: `${delay}s`, animationDuration: `${3 + rnd(i + 12) * 2}s` }}
              className="qa-particle"
            />
          );
        })}
      </g>

      {/* cap, lifting */}
      <g className="qa-cap">
        <rect x="98" y="44" width="24" height="20" rx="3" fill={GOLD} opacity="0.9" />
        <rect x="101" y="48" width="18" height="3" rx="1.5" fill={GOLD_LIGHT} opacity="0.7" />
      </g>

      {/* neck + bottle */}
      <rect x="104" y="66" width="12" height="14" fill={GOLD} opacity="0.55" />
      <path
        d="M78 84 q32 -8 64 0 l6 62 q0 16 -16 16 h-44 q-16 0 -16 -16 z"
        fill="url(#qa-glass)"
        stroke={GOLD}
        strokeWidth="1.4"
        strokeOpacity="0.75"
      />
      <path d="M82 122 q28 -6 56 0 l4 24 q0 12 -12 12 h-40 q-12 0 -12 -12 z" fill="url(#qa-juice)" opacity="0.6" />
      <path d="M88 96 q4 -4 10 -5" stroke={GOLD_LIGHT} strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 2. Families — orbiting essence orbs
 * ------------------------------------------------------------------ */
function EssenceScene() {
  const orbs = [
    { r: 52, dur: 18, size: 7, op: 0.9 },
    { r: 52, dur: 18, size: 4.5, op: 0.6, offset: 120 },
    { r: 52, dur: 18, size: 5.5, op: 0.75, offset: 240 },
    { r: 32, dur: 12, size: 5, op: 0.8, reverse: true },
    { r: 32, dur: 12, size: 3.5, op: 0.55, offset: 180, reverse: true },
  ];
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="qa-core">
          <stop offset="0%" stopColor={GOLD_LIGHT} stopOpacity="0.95" />
          <stop offset="60%" stopColor={GOLD} stopOpacity="0.5" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="110" cy="100" r="52" fill="none" stroke={GOLD} strokeOpacity="0.18" strokeDasharray="2 6" />
      <circle cx="110" cy="100" r="32" fill="none" stroke={GOLD} strokeOpacity="0.14" strokeDasharray="2 5" />
      <circle cx="110" cy="100" r="26" fill="url(#qa-core)" className="qa-breathe" />

      {orbs.map((o, i) => (
        <g
          key={i}
          className={o.reverse ? "qa-orbit-rev" : "qa-orbit"}
          style={{ animationDuration: `${o.dur}s`, animationDelay: `${-(o.offset || 0) / 360 * o.dur}s`, transformOrigin: "110px 100px" }}
        >
          <circle cx={110 + o.r} cy="100" r={o.size} fill={i % 2 ? GOLD_LIGHT : GOLD} opacity={o.op} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 3. Occasion — sun arcs into moon
 * ------------------------------------------------------------------ */
function DayNightScene() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <path d="M30 140 A80 80 0 0 1 190 140" fill="none" stroke={GOLD} strokeOpacity="0.2" strokeDasharray="3 6" />
      <line x1="24" y1="140" x2="196" y2="140" stroke={GOLD} strokeOpacity="0.25" />

      {/* stars fade in as it gets late */}
      <g className="qa-stars">
        {Array.from({ length: 9 }).map((_, i) => (
          <circle
            key={i}
            cx={40 + rnd(i + 3) * 140}
            cy={35 + rnd(i + 21) * 65}
            r={rnd(i + 9) * 1.3 + 0.6}
            fill={GOLD_LIGHT}
            style={{ animationDelay: `${rnd(i + 5) * 2}s` }}
            className="qa-twinkle"
          />
        ))}
      </g>

      {/* the travelling body */}
      <g className="qa-arc">
        <circle cx="0" cy="0" r="15" fill={GOLD} opacity="0.25" />
        <circle cx="0" cy="0" r="9" fill={GOLD_LIGHT} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 4. Season — a ring of four quadrants, gently rotating
 * ------------------------------------------------------------------ */
function SeasonScene() {
  const petals = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <g className="qa-spin-slow" style={{ transformOrigin: "110px 100px" }}>
        {petals.map((_, i) => {
          const a = (i / petals.length) * Math.PI * 2;
          const x = 110 + Math.cos(a) * 58;
          const y = 100 + Math.sin(a) * 58;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="9"
              ry="3.5"
              fill={i % 3 === 0 ? GOLD_LIGHT : GOLD}
              opacity={0.25 + (i % 4) * 0.16}
              transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`}
            />
          );
        })}
      </g>
      <circle cx="110" cy="100" r="36" fill="none" stroke={GOLD} strokeOpacity="0.3" />
      <circle cx="110" cy="100" r="22" fill={GOLD} opacity="0.12" className="qa-breathe" />
      {/* falling leaves / drops */}
      {Array.from({ length: 7 }).map((_, i) => (
        <circle
          key={i}
          cx={60 + rnd(i + 31) * 100}
          cy={20}
          r={1.6}
          fill={GOLD_LIGHT}
          opacity="0.7"
          className="qa-fall"
          style={{ animationDelay: `${rnd(i + 55) * 4}s`, animationDuration: `${4 + rnd(i + 2) * 3}s` }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 5. Vibe — a silhouette wrapped in an aura
 * ------------------------------------------------------------------ */
function AuraScene() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="qa-aura">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.4" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="105" rx="62" ry="72" fill="url(#qa-aura)" className="qa-breathe" />
      {[0, 1, 2].map(i => (
        <ellipse
          key={i}
          cx="110"
          cy="105"
          rx="34"
          ry="46"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.35"
          className="qa-ripple"
          style={{ animationDelay: `${i * 1.3}s`, transformOrigin: "110px 105px" }}
        />
      ))}
      {/* silhouette */}
      <circle cx="110" cy="76" r="15" fill={GOLD} opacity="0.75" />
      <path d="M110 94 q22 4 26 34 q3 22 -6 30 h-40 q-9 -8 -6 -30 q4 -30 26 -34z" fill={GOLD} opacity="0.65" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 6. Intensity — sillage rings from an atomiser
 * ------------------------------------------------------------------ */
function SillageScene() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <rect x="46" y="96" width="26" height="52" rx="4" fill={GOLD} opacity="0.28" stroke={GOLD} strokeOpacity="0.6" />
      <rect x="54" y="84" width="10" height="14" fill={GOLD} opacity="0.6" />
      <rect x="50" y="78" width="18" height="8" rx="2" fill={GOLD} opacity="0.85" />

      {[0, 1, 2, 3].map(i => (
        <circle
          key={i}
          cx="76"
          cy="90"
          r="14"
          fill="none"
          stroke={GOLD_LIGHT}
          strokeWidth="1.4"
          className="qa-spray"
          style={{ animationDelay: `${i * 0.9}s`, transformOrigin: "76px 90px" }}
        />
      ))}

      {Array.from({ length: 12 }).map((_, i) => (
        <circle
          key={`p${i}`}
          cx="78"
          cy="90"
          r={1 + rnd(i + 70) * 1.6}
          fill={GOLD}
          className="qa-spray-dot"
          style={{
            animationDelay: `${rnd(i + 17) * 2.4}s`,
            // @ts-expect-error custom properties are fine here
            "--dx": `${40 + rnd(i + 4) * 80}px`,
            "--dy": `${(rnd(i + 44) - 0.5) * 70}px`,
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * 7. Target — two ribbons intertwining
 * ------------------------------------------------------------------ */
function RibbonScene() {
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <path
        d="M40 100 C 70 40, 150 160, 180 100"
        fill="none"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.85"
        className="qa-draw"
      />
      <path
        d="M40 100 C 70 160, 150 40, 180 100"
        fill="none"
        stroke={GOLD_LIGHT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
        className="qa-draw"
        style={{ animationDelay: "0.5s" }}
      />
      <circle cx="110" cy="100" r="7" fill={GOLD_LIGHT} className="qa-breathe" />
      <circle cx="110" cy="100" r="20" fill="none" stroke={GOLD} strokeOpacity="0.3" className="qa-ripple" style={{ transformOrigin: "110px 100px" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const SCENES: Record<StepKey, () => React.ReactElement> = {
  favorite: BottleScene,
  families: EssenceScene,
  occasion: DayNightScene,
  season: SeasonScene,
  vibe: AuraScene,
  intensity: SillageScene,
  target: RibbonScene,
};

export default function QuizArt({ step }: { step: StepKey }) {
  const Scene = SCENES[step];
  return (
    <div key={step} className="qa-enter h-32 sm:h-40 md:h-44 w-full flex items-center justify-center">
      <Scene />
    </div>
  );
}
