/**
 * Tactile feedback for the Scent Journey: a soft synthesised click, a light
 * haptic tap on phones, and gold dust bursting from whatever was pressed.
 *
 * Sound is generated with the Web Audio API rather than audio files — no
 * download, no CDN, and the tones stay quiet and short on purpose.
 */

const SOUND_KEY = "pp_quiz_sound";

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isMuted(): boolean {
  if (muted !== null) return muted;
  try {
    muted = localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    muted = false;
  }
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem(SOUND_KEY, v ? "off" : "on");
  } catch {
    /* ignore */
  }
}

/** Lazily created on the first click — browsers block audio before a gesture. */
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One short, soft sine blip. Gain stays low — this should never startle. */
function blip(freq: number, when = 0, duration = 0.12, gain = 0.05, type: OscillatorType = "sine") {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const amp = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);

  // quick attack, exponential decay — reads as a glass tap rather than a beep
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(amp);
  amp.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export type Cue = "select" | "deselect" | "advance" | "back" | "reveal" | "add";

export function playCue(cue: Cue) {
  if (isMuted()) return;
  switch (cue) {
    case "select":
      blip(880, 0, 0.1, 0.05);
      blip(1320, 0.012, 0.07, 0.025);
      break;
    case "deselect":
      blip(440, 0, 0.08, 0.035);
      break;
    case "advance":
      blip(660, 0, 0.1, 0.045);
      blip(990, 0.06, 0.12, 0.04);
      break;
    case "back":
      blip(560, 0, 0.09, 0.03);
      blip(420, 0.05, 0.1, 0.025);
      break;
    case "add":
      blip(784, 0, 0.1, 0.05);
      blip(1175, 0.07, 0.14, 0.04);
      break;
    case "reveal":
      // a small ascending arpeggio for the payoff moment
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, i * 0.09, 0.28, 0.045, "triangle"));
      break;
  }
}

/** Very light vibration — only phones expose this, desktops ignore it. */
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}

/* ------------------------------------------------------------------ *
 * Gold dust
 * ------------------------------------------------------------------ */

let layer: HTMLElement | null = null;

function dustLayer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (layer && document.body.contains(layer)) return layer;
  layer = document.createElement("div");
  layer.className = "qa-dust-layer";
  document.body.appendChild(layer);
  return layer;
}

/** A burst of gold specks from a point — call it with the click coordinates. */
export function goldDust(x: number, y: number, count = 14) {
  if (reducedMotion()) return;
  const l = dustLayer();
  if (!l) return;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = 22 + Math.random() * 52;
    const size = 2 + Math.random() * 3.5;
    const life = 620 + Math.random() * 520;

    p.className = "qa-dust-p";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    // bias upward slightly so it drifts like dust, not shrapnel
    p.style.setProperty("--ty", `${Math.sin(angle) * dist - 14}px`);
    p.style.setProperty("--life", `${life}ms`);
    if (i % 3 === 0) p.style.background = "#E8D5A3";

    l.appendChild(p);
    setTimeout(() => p.remove(), life + 120);
  }
}

/** Convenience: burst from the centre of the element that was clicked. */
export function goldDustFrom(el: Element | null, count = 14) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  goldDust(r.left + r.width / 2, r.top + r.height / 2, count);
}

/** A slow shower across the top of the screen for the results reveal. */
export function goldShower(count = 34) {
  if (reducedMotion()) return;
  const l = dustLayer();
  if (!l) return;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = 2 + Math.random() * 3;
    const life = 2200 + Math.random() * 1800;
    const delay = Math.random() * 900;

    p.className = "qa-dust-fall";
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = `-20px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty("--life", `${life}ms`);
    p.style.animationDelay = `${delay}ms`;
    if (i % 3 === 0) p.style.background = "#E8D5A3";

    l.appendChild(p);
    setTimeout(() => p.remove(), life + delay + 200);
  }
}
