import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Known brand website patterns for popular Arabic/luxury perfume brands
const BRAND_SITES: Record<string, string> = {
  "lattafa": "lattafa.com",
  "al haramain": "alharamain.com",
  "ajmal": "ajmalperfume.com",
  "swiss arabian": "swissarabian.com",
  "rasasi": "rasasi.com",
  "armaf": "armaf.com",
  "fragrance world": "fragranceworld.net",
  "afnan": "afnanperfumes.com",
  "ard al zaafaran": "ardalzaafaran.com",
  "zimaya": "zimaya.com",
  "maison alhambra": "maisonalhambra.com",
};

async function scrapeImagesFromUrl(url: string): Promise<string[]> {
  const images: string[] = [];
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return images;

    const data = await res.json();
    const html: string = data.contents || "";

    // Extract og:image first (usually the main product image)
    const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
    if (ogImg && ogImg[1].startsWith("http")) images.push(ogImg[1]);

    // Extract all large product images
    const allImgs = [...html.matchAll(/src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi)];
    for (const m of allImgs) {
      const src = m[1];
      if (
        src &&
        !src.includes("logo") &&
        !src.includes("icon") &&
        !src.includes("banner") &&
        !src.includes("avatar") &&
        !src.includes("thumbnail") &&
        !src.includes("payment") &&
        !src.includes("flag") &&
        !images.includes(src) &&
        images.length < 6
      ) {
        images.push(src);
      }
    }
  } catch {
    // Scrape failed
  }
  return images;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, brand } = await req.json();
  if (!name || !brand) {
    return NextResponse.json({ error: "Необходими са наименование и производител" }, { status: 400 });
  }

  const xaiKey = process.env.XAI_API_KEY;
  if (!xaiKey) {
    return NextResponse.json({ error: "xAI API key not configured" }, { status: 500 });
  }

  const prompt = `You are a luxury perfume copywriter creating product descriptions for a high-end Bulgarian perfume catalog.

For the perfume "${name}" by "${brand}", write the following. Be specific about this perfume's actual character — don't be generic.

---

ENGLISH DESCRIPTION:
Write a compelling, elegant product description in English. Structure it like a luxury brand would:
- First sentence: a captivating opening that captures the soul of the scent
- Second sentence: describe the fragrance journey (top notes feel, heart, base)
- Third sentence: the mood, occasion, or person this perfume is made for
Keep it under 80 words. No bullet points. Flowing, poetic prose.

BULGARIAN DESCRIPTION:
Translate and adapt the above into elegant Bulgarian. Same structure, same feel. Natural Bulgarian — not a robotic translation. Under 80 words.

NOTES IN ENGLISH:
List the key fragrance notes separated by commas. Only the notes, nothing else. Example: Bulgarian rose, oud, amber, white musk, sandalwood

NOTES IN BULGARIAN:
Same notes translated to Bulgarian, separated by commas. Example: Българска роза, уд, амбра, бял мускус, сандалово дърво

GENDER: Men | Women | Unisex (pick one)

OFFICIAL PRODUCT URL:
Find the exact URL of this perfume on the official brand website or on fragrantica.com or parfumo.com. Return only the full URL, nothing else. If you don't know the exact URL, return an empty string "".

---

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "descriptionEn": "...",
  "descriptionBg": "...",
  "notes": "note1, note2, note3",
  "notesBg": "нотка1, нотка2, нотка3",
  "gender": "Men|Women|Unisex",
  "productUrl": "https://..."
}`;

  let description = "";
  let descriptionBg = "";
  let notes = "";
  let notesBg = "";
  let gender = "Unisex";
  let productUrl = "";

  try {
    const xaiRes = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1400,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (xaiRes.ok) {
      const xaiData = await xaiRes.json();
      const text = xaiData?.choices?.[0]?.message?.content || "";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        description = parsed.descriptionEn || "";
        descriptionBg = parsed.descriptionBg || "";
        notes = parsed.notes || "";
        notesBg = parsed.notesBg || "";
        gender = parsed.gender || "Unisex";
        productUrl = parsed.productUrl || "";
      }
    }
  } catch {
    // Grok failed
  }

  // Step 1: Serper.dev Google Image Search (primary)
  let images: string[] = [];

  if (process.env.SERPER_API_KEY) {
    try {
      const query = `${brand} ${name} perfume bottle official`;
      const serperRes = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 10 }),
        signal: AbortSignal.timeout(8000),
      });
      if (serperRes.ok) {
        const serperData = await serperRes.json();
        for (const item of serperData.images || []) {
          const imgUrl: string = item.imageUrl || "";
          if (
            imgUrl &&
            imgUrl.startsWith("http") &&
            /\.(jpg|jpeg|png|webp)/i.test(imgUrl) &&
            !imgUrl.endsWith(".svg") &&
            !images.includes(imgUrl) &&
            images.length < 5
          ) {
            images.push(imgUrl);
          }
        }
      }
    } catch {
      // Serper failed
    }
  }

  // Fallback: scrape official product URL if Grok found one
  if (images.length === 0 && productUrl && productUrl.startsWith("http")) {
    images = await scrapeImagesFromUrl(productUrl);
  }

  // Final fallback: Pexels
  if (images.length === 0 && process.env.PEXELS_API_KEY) {
    try {
      const query = `${brand} ${name} perfume bottle`;
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
        { headers: { Authorization: process.env.PEXELS_API_KEY }, signal: AbortSignal.timeout(8000) }
      );
      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        for (const photo of pexelsData.photos || []) {
          if (photo.src?.large && images.length < 5) images.push(photo.src.large);
        }
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    description,
    descriptionBg,
    notes,
    notesBg,
    gender,
    images: images.slice(0, 5),
    sourceUrl: productUrl,
  });
}
