import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || !url.includes("fragrantica.com")) {
    return NextResponse.json({ error: "Invalid Fragrantica URL" }, { status: 400 });
  }

  // Step 1: Always extract brand + name from the URL itself
  // e.g. /perfume/Al-Haramain/Amber-Oud-Gold-12345.html
  const urlParts = url.match(/\/perfume\/([^/]+)\/([^/]+?)(?:-\d+)?\.html/);
  const brandFromUrl = urlParts ? urlParts[1].replace(/-/g, " ") : "";
  const nameFromUrl = urlParts ? urlParts[2].replace(/-\d+$/, "").replace(/-/g, " ") : "";

  // Step 2: Try to fetch the full page via a proxy for more details
  let description = "";
  let gender = "Unisex";
  let image = "";

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      const html: string = data.contents || "";

      // Description
      const descMatch = html.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/) ||
                        html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }

      // Gender
      if (/for women and men|unisex|shared/i.test(html)) gender = "Unisex";
      else if (/for women|feminine/i.test(html)) gender = "Women";
      else if (/for men|masculine/i.test(html)) gender = "Men";

      // Image
      const imgMatch = html.match(/og:image"[^>]*content="([^"]+)"/) ||
                       html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
      if (imgMatch) image = imgMatch[1].trim();

      // Notes
      const notesMatches = [...html.matchAll(/class="[^"]*note-name[^"]*"[^>]*>([^<]+)</g)];
      const notes = notesMatches.map(m => m[1].trim()).filter(Boolean).slice(0, 8);
      if (notes.length > 0 && description) {
        description += ` Fragrance notes: ${notes.join(", ")}.`;
      }
    }
  } catch {
    // Proxy failed — just use URL data, still useful
  }

  return NextResponse.json({
    name: nameFromUrl,
    brand: brandFromUrl,
    description,
    gender,
    image,
  });
}
