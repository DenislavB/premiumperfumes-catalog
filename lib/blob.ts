import { put } from "@vercel/blob";

function uniqueName(ext: string) {
  return `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

// Re-host external image URLs onto Vercel Blob (trusted, optimizable host).
// Already-hosted Blob URLs are left untouched. On any failure, the original URL is kept.
export async function rehostImages(urls: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const url of urls) {
    if (!url || typeof url !== "string") continue;
    if (url.includes("blob.vercel-storage.com")) {
      out.push(url); // already on Blob
      continue;
    }
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PremiumPerfumesBot/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        out.push(url);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = (url.split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
      const blob = await put(uniqueName(ext), buf, { access: "public" });
      out.push(blob.url);
    } catch {
      out.push(url); // keep original if rehosting fails
    }
  }
  return out;
}
