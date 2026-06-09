export type Prize = {
  label: string;     // Bulgarian label (stored)
  labelEn: string;
  type: "percent" | "fixed" | "freebie";
  value: number;     // percent or EUR; 0 for freebie
  weight: number;    // relative probability
  color: string;     // wheel segment color
};

// Order = wheel segment order (index 0 at the top, going clockwise)
export const PRIZES: Prize[] = [
  { label: "5% отстъпка",       labelEn: "5% off",       type: "percent", value: 5,  weight: 26, color: "#C9A84C" },
  { label: "Безплатна отливка", labelEn: "Free decant",  type: "freebie", value: 0,  weight: 14, color: "#1A1612" },
  { label: "10% отстъпка",      labelEn: "10% off",      type: "percent", value: 10, weight: 22, color: "#9A7A2E" },
  { label: "−5 € отстъпка",     labelEn: "€5 off",       type: "fixed",   value: 5,  weight: 18, color: "#1A1612" },
  { label: "7% отстъпка",       labelEn: "7% off",       type: "percent", value: 7,  weight: 16, color: "#E8D5A3" },
  { label: "15% отстъпка",      labelEn: "15% off",      type: "percent", value: 15, weight: 4,  color: "#1A1612" },
];

// Weighted random prize index
export function pickPrizeIndex(): number {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}
