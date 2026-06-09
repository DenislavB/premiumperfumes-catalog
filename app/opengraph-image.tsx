import { ImageResponse } from "next/og";

export const alt = "Premium Perfumes — Луксозни арабски парфюми от Дубай";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0D0B08 0%, #1A1410 55%, #0D0B08 100%)",
          color: "#F5ECD7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28 }}>
          <div style={{ width: 80, height: 1, background: "#C9A84C" }} />
          <div style={{ color: "#C9A84C", fontSize: 22, letterSpacing: 10 }}>PREMIUMPERFUMES.BG</div>
          <div style={{ width: 80, height: 1, background: "#C9A84C" }} />
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, color: "#C9A84C", textAlign: "center", lineHeight: 1.1, padding: "0 60px" }}>
          Луксозни арабски парфюми
        </div>
        <div style={{ fontSize: 40, color: "#E8D5A3", marginTop: 8 }}>от Дубай</div>
        <div style={{ fontSize: 26, color: "#F5ECD7", opacity: 0.6, marginTop: 36 }}>
          Lattafa · Armaf · Afnan · Maison Alhambra
        </div>
        <div style={{ fontSize: 20, color: "#F5ECD7", opacity: 0.4, marginTop: 40 }}>
          Магазин Omaya · гр. Кюстендил
        </div>
      </div>
    ),
    { ...size }
  );
}
