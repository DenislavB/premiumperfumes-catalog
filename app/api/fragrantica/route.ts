import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || !url.includes("fragrantica.com")) {
    return NextResponse.json({ error: "Invalid Fragrantica URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const html = await res.text();

    // Extract name
    const nameMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/) ||
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Extract brand
    const brandMatch = html.match(/itemprop="brand"[^>]*>\s*<[^>]+>([^<]+)</) ||
                       html.match(/<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/);
    const brand = brandMatch ? brandMatch[1].trim() : "";

    // Extract description — look for the main description paragraph
    const descMatch = html.match(/class="[^"]*fragrance-description[^"]*"[^>]*>([\s\S]*?)<\/div>/) ||
                      html.match(/<div[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/);
    let description = "";
    if (descMatch) {
      description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Extract gender
    let gender = "Unisex";
    if (html.includes("for women") || html.includes("feminine") || html.includes("Women")) gender = "Women";
    if (html.includes("for men") || html.includes("masculine") || html.includes(" Men")) gender = "Men";
    if (html.includes("for women and men") || html.includes("unisex") || html.includes("shared")) gender = "Unisex";

    // Extract main image
    const imgMatch = html.match(/<img[^>]*itemprop="image"[^>]*src="([^"]+)"/) ||
                     html.match(/og:image"[^>]*content="([^"]+)"/) ||
                     html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
    const image = imgMatch ? imgMatch[1].trim() : "";

    // Extract notes for description enrichment
    const notesMatches = html.matchAll(/class="[^"]*note-name[^"]*"[^>]*>([^<]+)</g);
    const notes = [...notesMatches].map(m => m[1].trim()).filter(Boolean).slice(0, 10);

    // Build enriched description
    let fullDescription = description;
    if (notes.length > 0) {
      fullDescription += `\n\nFragrance notes: ${notes.join(", ")}.`;
    }

    return NextResponse.json({
      name,
      brand,
      description: fullDescription.trim(),
      gender,
      image,
      notes,
    });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch fragrance data: ${String(err)}` }, { status: 500 });
  }
}
