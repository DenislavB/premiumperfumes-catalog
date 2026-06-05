import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || !url.includes("fragrantica.com")) {
    return NextResponse.json({ error: "Invalid Fragrantica URL" }, { status: 400 });
  }

  // Step 1: Extract brand + name from URL
  const urlParts = url.match(/\/perfume\/([^/]+)\/([^/]+?)(?:-\d+)?\.html/);
  const brandFromUrl = urlParts ? urlParts[1].replace(/-/g, " ") : "";
  const nameFromUrl = urlParts ? urlParts[2].replace(/-\d+$/, "").replace(/-/g, " ") : "";

  // Step 2: Try proxy for description, gender, and Fragrantica image
  let description = "";
  let gender = "Unisex";
  const images: string[] = [];

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

      // Notes
      const notesMatches = [...html.matchAll(/class="[^"]*note-name[^"]*"[^>]*>([^<]+)</g)];
      const notes = notesMatches.map((m) => m[1].trim()).filter(Boolean).slice(0, 8);
      if (notes.length > 0 && description) {
        description += ` Fragrance notes: ${notes.join(", ")}.`;
      }

      // All images from the page
      const allImgs = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))[^"]*"/gi)];
      for (const m of allImgs) {
        const src = m[1];
        if (
          src &&
          !src.includes("logo") &&
          !src.includes("icon") &&
          !src.includes("banner") &&
          !src.includes("ad") &&
          !images.includes(src) &&
          images.length < 5
        ) {
          images.push(src);
        }
      }

      // og:image as fallback
      if (images.length === 0) {
        const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
        if (ogImg) images.push(ogImg[1].trim());
      }
    }
  } catch {
    // Proxy failed
  }

  // Step 3: Google Image Search (if API keys available)
  if (images.length < 5 && process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID) {
    try {
      const query = `${brandFromUrl} ${nameFromUrl} perfume bottle official`;
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=8&imgSize=large&safe=active`;
      const gRes = await fetch(googleUrl, { signal: AbortSignal.timeout(8000) });
      if (gRes.ok) {
        const gData = await gRes.json();
        for (const item of (gData.items || [])) {
          const imgUrl: string = item.link || "";
          if (imgUrl && !imgUrl.endsWith(".svg") && !images.includes(imgUrl) && images.length < 5) {
            images.push(imgUrl);
          }
        }
      }
    } catch {
      // Google search failed
    }
  }

  return NextResponse.json({
    name: nameFromUrl,
    brand: brandFromUrl,
    description,
    gender,
    images,
  });
}
