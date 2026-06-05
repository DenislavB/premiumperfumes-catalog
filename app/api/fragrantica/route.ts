import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, brand } = await req.json();
  if (!name || !brand) {
    return NextResponse.json({ error: "Name and brand are required" }, { status: 400 });
  }

  let description = "";
  let gender = "Unisex";
  const images: string[] = [];
  let notes: string[] = [];

  // Step 1: Search Fragrantica for the product
  try {
    const searchQuery = `${brand} ${name}`;
    const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(searchQuery)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
    const searchRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const searchHtml: string = searchData.contents || "";

      // Find first perfume result link
      const linkMatch = searchHtml.match(/href="(https:\/\/www\.fragrantica\.com\/perfume\/[^"]+\.html)"/);
      if (linkMatch) {
        const perfumeUrl = linkMatch[1];

        // Fetch the perfume page
        const perfumeProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(perfumeUrl)}`;
        const perfumeRes = await fetch(perfumeProxy, { signal: AbortSignal.timeout(8000) });

        if (perfumeRes.ok) {
          const perfumeData = await perfumeRes.json();
          const html: string = perfumeData.contents || "";

          // Description
          const descMatch = html.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/) ||
                            html.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/);
          if (descMatch) {
            description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          }

          // Gender
          if (/for women and men|unisex|shared/i.test(html)) gender = "Unisex";
          else if (/for women|feminine/i.test(html)) gender = "Women";
          else if (/for men|masculine/i.test(html)) gender = "Men";

          // Notes
          const notesMatches = [...html.matchAll(/class="[^"]*note-name[^"]*"[^>]*>([^<]+)</g)];
          notes = notesMatches.map((m) => m[1].trim()).filter(Boolean).slice(0, 10);
          if (notes.length > 0 && description) {
            description += `\n\nНотки на аромата: ${notes.join(", ")}.`;
          }

          // Images from page
          const allImgs = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))[^"]*"/gi)];
          for (const m of allImgs) {
            const src = m[1];
            if (src && !src.includes("logo") && !src.includes("icon") && !images.includes(src) && images.length < 3) {
              images.push(src);
            }
          }

          // og:image
          if (images.length === 0) {
            const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
            if (ogImg) images.push(ogImg[1].trim());
          }
        }
      }
    }
  } catch {
    // Fragrantica search failed, continue to Google
  }

  // Step 2: Google Image Search
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID) {
    try {
      const query = `${brand} ${name} perfume bottle`;
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=8&imgSize=large&safe=active`;
      const gRes = await fetch(googleUrl, { signal: AbortSignal.timeout(8000) });
      if (gRes.ok) {
        const gData = await gRes.json();
        for (const item of (gData.items || [])) {
          const imgUrl: string = item.link || "";
          if (imgUrl && !imgUrl.endsWith(".svg") && !images.includes(imgUrl) && images.length < 6) {
            images.push(imgUrl);
          }
        }
      }
    } catch {
      // Google search failed
    }
  }

  return NextResponse.json({ description, gender, images, notes });
}
