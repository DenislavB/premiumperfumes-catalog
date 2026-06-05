import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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

---

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "descriptionEn": "...",
  "descriptionBg": "...",
  "notes": "note1, note2, note3",
  "notesBg": "нотка1, нотка2, нотка3",
  "gender": "Men|Women|Unisex"
}`;

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
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!xaiRes.ok) {
      const err = await xaiRes.text();
      throw new Error(`xAI error: ${err}`);
    }

    const xaiData = await xaiRes.json();
    const text = xaiData?.choices?.[0]?.message?.content || "";

    // Extract JSON — strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Не е намерен JSON в отговора");

    const parsed = JSON.parse(jsonMatch[0]);

    // Search Pexels for perfume images
    const images: string[] = [];
    if (process.env.PEXELS_API_KEY) {
      try {
        const query = `${brand} ${name} perfume bottle`;
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=portrait`,
          {
            headers: { Authorization: process.env.PEXELS_API_KEY },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          for (const photo of pexelsData.photos || []) {
            if (photo.src?.large && images.length < 5) {
              images.push(photo.src.large);
            }
          }
        }
        // If no brand-specific results, search generic luxury perfume
        if (images.length === 0) {
          const fallbackRes = await fetch(
            `https://api.pexels.com/v1/search?query=luxury+perfume+bottle&per_page=6&orientation=portrait`,
            {
              headers: { Authorization: process.env.PEXELS_API_KEY },
              signal: AbortSignal.timeout(8000),
            }
          );
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            for (const photo of fallbackData.photos || []) {
              if (photo.src?.large && images.length < 5) {
                images.push(photo.src.large);
              }
            }
          }
        }
      } catch {
        // Pexels failed, continue without images
      }
    }

    return NextResponse.json({
      description: parsed.descriptionEn || "",
      descriptionBg: parsed.descriptionBg || "",
      notes: parsed.notes || "",
      notesBg: parsed.notesBg || "",
      gender: parsed.gender || "Unisex",
      images,
    });

  } catch (err) {
    return NextResponse.json({ error: `Грешка: ${String(err)}` }, { status: 500 });
  }
}
