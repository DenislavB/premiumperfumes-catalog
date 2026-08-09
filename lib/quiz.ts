import type { Product, Variant } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Scent families
 * ------------------------------------------------------------------ */

export const FAMILIES = [
  "citrus",
  "floral",
  "gourmand",
  "fruity",
  "woody",
  "spicy",
  "fresh",
  "amber",
  "leather",
  "musk",
] as const;

export type FamilyKey = (typeof FAMILIES)[number];

/**
 * Explicit note -> family map. Built from the full vocabulary actually present
 * in the catalogue (109 unique notes), so matching is exact rather than guessed.
 * A note may belong to more than one family (coconut is both fruity and sweet).
 */
const NOTE_FAMILIES: Record<string, FamilyKey[]> = {
  // citrus
  bergamot: ["citrus"], lemon: ["citrus"], "sicilian lemon": ["citrus"], grapefruit: ["citrus"],
  mandarin: ["citrus"], "mandarin orange": ["citrus"], tangerine: ["citrus"], yuzu: ["citrus"],
  citrus: ["citrus"], "blood orange": ["citrus"], lime: ["citrus"], "bitter orange": ["citrus"],
  neroli: ["floral", "citrus"], petitgrain: ["citrus", "fresh"],

  // floral
  jasmine: ["floral"], "jasmine sambac": ["floral"], "jasmine absolute": ["floral"],
  "egyptian jasmine": ["floral"], rose: ["floral"], "bulgarian rose": ["floral"],
  "turkish rose": ["floral"], tuberose: ["floral"], violet: ["floral"],
  "orange blossom": ["floral"], "ylang-ylang": ["floral"], iris: ["floral"], peony: ["floral"],
  orchid: ["floral"], magnolia: ["floral"], freesia: ["floral"], gardenia: ["floral"],
  champaca: ["floral"], "white amaryllis": ["floral"], narcissus: ["floral"],
  osmanthus: ["floral", "fruity"], lotus: ["floral", "fresh"], lavender: ["floral", "fresh"],
  geranium: ["floral"], lily: ["floral"],

  // gourmand
  vanilla: ["gourmand"], "bourbon vanilla": ["gourmand"], caramel: ["gourmand"],
  cocoa: ["gourmand"], cacao: ["gourmand"], coffee: ["gourmand"], "cotton candy": ["gourmand"],
  marshmallow: ["gourmand"], praline: ["gourmand"], toffee: ["gourmand"], honey: ["gourmand"],
  almond: ["gourmand"], "bitter almond": ["gourmand"], pistachio: ["gourmand"],
  "tonka bean": ["gourmand"], tonka: ["gourmand"], chocolate: ["gourmand"], sugar: ["gourmand"],
  dates: ["gourmand", "fruity"],

  // fruity
  pineapple: ["fruity"], peach: ["fruity"], apple: ["fruity"], "green apple": ["fruity"],
  pear: ["fruity"], mango: ["fruity"], raspberry: ["fruity"], "red berries": ["fruity"],
  blackcurrant: ["fruity"], "black currant": ["fruity"], pomegranate: ["fruity"],
  lychee: ["fruity"], kiwi: ["fruity"], banana: ["fruity"], persimmon: ["fruity"],
  maninka: ["fruity"], plum: ["fruity"], cherry: ["fruity"],
  coconut: ["fruity", "gourmand"], watermelon: ["fruity", "fresh"],

  // woody
  sandalwood: ["woody"], cedarwood: ["woody"], cedar: ["woody"], vetiver: ["woody"],
  patchouli: ["woody"], mahogany: ["woody"], oakmoss: ["woody"], woods: ["woody"],
  "woody notes": ["woody"], guaiac: ["woody"], cypress: ["woody"], teak: ["woody"],
  oud: ["woody", "amber"], birch: ["woody", "leather"], amberwood: ["amber", "woody"],
  cashmeran: ["musk", "woody"],

  // spicy
  saffron: ["spicy"], "pink pepper": ["spicy"], "black pepper": ["spicy"], pepper: ["spicy"],
  cinnamon: ["spicy"], cardamom: ["spicy"], nutmeg: ["spicy"], ginger: ["spicy"],
  spices: ["spicy"], clove: ["spicy"], cumin: ["spicy"], coriander: ["spicy"],

  // fresh
  "marine notes": ["fresh"], "marine accord": ["fresh"], "sea notes": ["fresh"],
  salt: ["fresh"], mint: ["fresh"], bamboo: ["fresh"], "oolong tea": ["fresh"],
  sage: ["fresh"], rosemary: ["fresh"], green: ["fresh"], aquatic: ["fresh"],
  ozone: ["fresh"], cucumber: ["fresh"],

  // amber
  amber: ["amber"], "white amber": ["amber"], incense: ["amber"], frankincense: ["amber"],
  myrrh: ["amber"], benzoin: ["amber"], labdanum: ["amber"], resin: ["amber"],
  ambergris: ["amber", "musk"],

  // leather
  leather: ["leather"], tobacco: ["leather"], suede: ["leather"], smoke: ["leather"],
  rum: ["leather", "gourmand"], whisky: ["leather"],

  // musk
  musk: ["musk"], "white musk": ["musk"], ambroxan: ["musk"], ambrette: ["musk"],
};

/** Notes that read as heavy/loud vs light/airy — used for the sillage question. */
const HEAVY = new Set([
  "oud", "amber", "white amber", "incense", "frankincense", "myrrh", "leather", "tobacco",
  "patchouli", "vanilla", "bourbon vanilla", "tonka bean", "saffron", "ambergris", "cinnamon",
  "labdanum", "cacao", "cocoa", "coffee", "rum", "amberwood",
]);
const LIGHT = new Set([
  "bergamot", "lemon", "sicilian lemon", "grapefruit", "mandarin", "mandarin orange", "tangerine",
  "yuzu", "citrus", "neroli", "marine notes", "marine accord", "sea notes", "salt", "mint",
  "bamboo", "oolong tea", "lotus", "freesia", "sage", "rosemary", "green apple", "watermelon",
]);

/* ------------------------------------------------------------------ *
 * Note parsing
 * ------------------------------------------------------------------ */

export function parseNotes(raw: string): string[] {
  return String(raw || "")
    .split(/[,;/]/)
    .map(n => n.trim().toLowerCase())
    .filter(Boolean);
}

/** Families a product belongs to, with how many notes back each one. */
export function productFamilies(product: Product): Map<FamilyKey, number> {
  const counts = new Map<FamilyKey, number>();
  for (const note of parseNotes(product.notes || product.notesBg)) {
    let fams: FamilyKey[] | undefined = NOTE_FAMILIES[note];
    if (!fams) {
      // fall back to substring matching so notes added later still classify
      const hit = Object.keys(NOTE_FAMILIES).find(k => note.includes(k));
      fams = hit ? NOTE_FAMILIES[hit] : undefined;
    }
    if (!fams) continue;
    for (const f of fams) counts.set(f, (counts.get(f) || 0) + 1);
  }
  return counts;
}

/** -1 (airy) .. +1 (heavy hitter) */
export function productStrength(product: Product): number {
  const notes = parseNotes(product.notes || product.notesBg);
  if (notes.length === 0) return 0;
  let heavy = 0;
  let light = 0;
  for (const n of notes) {
    if (HEAVY.has(n)) heavy++;
    if (LIGHT.has(n)) light++;
  }
  return Math.max(-1, Math.min(1, (heavy - light) / Math.max(3, notes.length / 2)));
}

/* ------------------------------------------------------------------ *
 * Questions
 * ------------------------------------------------------------------ */

export type Occasion = "day" | "night" | "work" | "special";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Vibe = "elegant" | "seductive" | "clean" | "bold" | "cozy";
export type Intensity = "subtle" | "balanced" | "strong";
export type Target = "women" | "men" | "unisex";

export type QuizAnswers = {
  favorite: string;
  families: FamilyKey[];
  occasion: Occasion | null;
  season: Season | null;
  vibe: Vibe | null;
  intensity: Intensity | null;
  target: Target | null;
};

export const EMPTY_ANSWERS: QuizAnswers = {
  favorite: "",
  families: [],
  occasion: null,
  season: null,
  vibe: null,
  intensity: null,
  target: null,
};

export const STEPS = ["favorite", "families", "occasion", "season", "vibe", "intensity", "target"] as const;
export type StepKey = (typeof STEPS)[number];

export const OCCASIONS: Occasion[] = ["day", "night", "work", "special"];
export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
export const VIBES: Vibe[] = ["elegant", "seductive", "clean", "bold", "cozy"];
export const INTENSITIES: Intensity[] = ["subtle", "balanced", "strong"];
export const TARGETS: Target[] = ["women", "men", "unisex"];

/* ------------------------------------------------------------------ *
 * Scoring weights
 * ------------------------------------------------------------------ */

type Weights = Partial<Record<FamilyKey, number>>;

const OCCASION_W: Record<Occasion, Weights> = {
  day: { citrus: 3, fresh: 3, floral: 2, fruity: 2, musk: 1 },
  night: { amber: 3, woody: 3, gourmand: 2, leather: 2, spicy: 2 },
  work: { musk: 3, fresh: 3, citrus: 2, woody: 2, floral: 1, gourmand: -1, amber: -1 },
  special: { amber: 3, floral: 2, woody: 2, leather: 2, spicy: 1, gourmand: 1 },
};

const SEASON_W: Record<Season, Weights> = {
  spring: { floral: 3, citrus: 3, fresh: 2, fruity: 2 },
  summer: { citrus: 3, fresh: 3, fruity: 3, musk: 1, amber: -1 },
  autumn: { woody: 3, spicy: 3, amber: 2, leather: 2, gourmand: 2 },
  winter: { amber: 3, gourmand: 3, woody: 2, spicy: 2, leather: 2, citrus: -1 },
};

const VIBE_W: Record<Vibe, Weights> = {
  elegant: { floral: 3, musk: 2, woody: 2, citrus: 1 },
  seductive: { amber: 3, gourmand: 2, leather: 2, spicy: 2, woody: 1 },
  clean: { fresh: 3, musk: 3, citrus: 2, floral: 1 },
  bold: { woody: 3, leather: 3, spicy: 3, amber: 2 },
  cozy: { gourmand: 3, amber: 2, musk: 2, woody: 1 },
};

const INTENSITY_TARGET: Record<Intensity, number> = { subtle: -0.6, balanced: 0, strong: 0.7 };

/* ------------------------------------------------------------------ *
 * Recommendation engine
 * ------------------------------------------------------------------ */

export type Recommendation = {
  product: Product;
  match: number;
  reasons: FamilyKey[];
  decantPrice: number | null;
};

/**
 * A decant is the "Отливка" variant or a small 5/10 ml sample. The trailing
 * anchor matters: without it "100ml" would match the 10 ml rule.
 */
const DECANT_RE = /отливка|decant|^\s*5\s*(мл|ml)?\s*$|^\s*10\s*(мл|ml)?\s*$/i;

/** The cheapest decant variant, or null when the product isn't sold as one. */
export function decantVariantOf(product: Product): Variant | null {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const decants = variants
    .filter(v => DECANT_RE.test(String(v.size)) && !Number.isNaN(Number(v.price)))
    .sort((a, b) => Number(a.price) - Number(b.price));
  return decants[0] ?? null;
}

export function decantPriceOf(product: Product): number | null {
  const v = decantVariantOf(product);
  return v ? Number(v.price) : null;
}

/** Loose match of the free-text "current favourite" against the catalogue. */
function findFavourite(products: Product[], text: string): Product | null {
  const q = text.trim().toLowerCase();
  if (q.length < 3) return null;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  let best: Product | null = null;
  let bestLen = 0;
  for (const p of products) {
    const hay = norm(`${p.brand} ${p.name} ${p.nameBg}`);
    if (hay.includes(q) && q.length > bestLen) {
      best = p;
      bestLen = q.length;
    }
  }
  if (best) return best;
  // otherwise try token overlap (e.g. "sauvage dior" vs "Dior Sauvage")
  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  if (tokens.length === 0) return null;
  let bestScore = 0;
  for (const p of products) {
    const hay = norm(`${p.brand} ${p.name} ${p.nameBg}`);
    const hits = tokens.filter(t => hay.includes(t)).length;
    if (hits > bestScore && hits >= Math.min(2, tokens.length)) {
      bestScore = hits;
      best = p;
    }
  }
  return best;
}

export function recommend(products: Product[], answers: QuizAnswers, limit = 3): Recommendation[] {
  const pool = products.filter(p => p.available && decantPriceOf(p) !== null);
  const favourite = findFavourite(pool, answers.favorite);

  // Build the desired family profile
  const desire = new Map<FamilyKey, number>();
  const add = (w: Weights, mult = 1) => {
    for (const [f, v] of Object.entries(w)) {
      desire.set(f as FamilyKey, (desire.get(f as FamilyKey) || 0) + (v as number) * mult);
    }
  };

  // Explicitly chosen families are the strongest signal
  for (const f of answers.families) desire.set(f, (desire.get(f) || 0) + 7);
  if (answers.occasion) add(OCCASION_W[answers.occasion]);
  if (answers.season) add(SEASON_W[answers.season]);
  if (answers.vibe) add(VIBE_W[answers.vibe]);

  // "Smells like what I already love"
  if (favourite) {
    const favFams = productFamilies(favourite);
    const favTotal = [...favFams.values()].reduce((a, b) => a + b, 0) || 1;
    for (const [f, c] of favFams) {
      desire.set(f, (desire.get(f) || 0) + (c / favTotal) * 14);
    }
  }

  const desireTotal = [...desire.values()].reduce((a, b) => a + Math.max(0, b), 0) || 1;
  const wantStrength = answers.intensity ? INTENSITY_TARGET[answers.intensity] : 0;

  const scored = pool
    .filter(p => {
      if (favourite && p.id === favourite.id) return false; // don't recommend what they already own
      if (!answers.target || answers.target === "unisex") return true;
      const g = (p.gender || "").toLowerCase();
      if (g === "unisex") return true;
      return answers.target === "women" ? g === "women" : g === "men";
    })
    .map(p => {
      const fams = productFamilies(p);
      const famTotal = [...fams.values()].reduce((a, b) => a + b, 0) || 1;

      // How much of what they want does this perfume actually deliver?
      let score = 0;
      const reasons: { f: FamilyKey; v: number }[] = [];
      for (const [f, want] of desire) {
        const has = fams.get(f) || 0;
        if (has === 0) continue;
        const share = has / famTotal;
        const contribution = want * share;
        score += contribution;
        if (want > 0 && contribution > 0) reasons.push({ f, v: contribution });
      }
      score = (score / desireTotal) * 100;

      // Sillage fit
      const strengthGap = Math.abs(productStrength(p) - wantStrength);
      score += (1 - strengthGap) * 12;

      // Gentle nudges: exact gender match and curated picks
      if (answers.target && answers.target !== "unisex" && (p.gender || "").toLowerCase() === answers.target) {
        score += 4;
      }
      if (p.featured) score += 2;

      reasons.sort((a, b) => b.v - a.v);
      return { product: p, raw: score, reasons: reasons.slice(0, 3).map(r => r.f) };
    })
    .sort((a, b) => b.raw - a.raw);

  // Pick the top matches but keep some brand variety in the final three
  const picked: typeof scored = [];
  const brands = new Set<string>();
  for (const cand of scored) {
    if (picked.length >= limit) break;
    const brand = (cand.product.brand || "").toLowerCase();
    if (brands.has(brand)) continue;
    picked.push(cand);
    brands.add(brand);
  }
  for (const cand of scored) {
    if (picked.length >= limit) break;
    if (!picked.includes(cand)) picked.push(cand);
  }

  // Present the raw score as a friendly match percentage
  const top = picked[0]?.raw || 1;
  return picked.map((c, i) => ({
    product: c.product,
    match: Math.max(71, Math.min(97, Math.round(97 - i * 4 - Math.max(0, (top - c.raw) / Math.max(top, 1)) * 22))),
    reasons: c.reasons,
    decantPrice: decantPriceOf(c.product),
  }));
}
