import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, brand } = await req.json();
  if (!name || !brand) {
    return NextResponse.json({ error: "Необходими са наименование и производител" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  // Use Gemini to get description + image URLs with Google Search grounding
  const prompt = `You are a luxury perfume expert. For the perfume "${name}" by "${brand}", provide:

1. A rich, elegant English description (3-4 sentences) suitable for a luxury perfume catalog. Mention the fragrance character, key notes if known, and who it's for.
2. Find 5 real image URLs of this perfume bottle from the web (from brand websites, fragrantica.com, parfumo.com, or other perfume sites). Only include direct image URLs ending in .jpg, .jpeg, .png or .webp.
3. The gender category: Men, Women, or Unisex.

Respond in this exact JSON format:
{
  "description": "...",
  "gender": "Men|Women|Unisex",
  "images": ["url1", "url2", "url3", "url4", "url5"]
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini error: ${err}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Filter valid image URLs
    const images = (parsed.images || []).filter(
      (url: string) =>
        typeof url === "string" &&
        url.startsWith("http") &&
        /\.(jpg|jpeg|png|webp)/i.test(url)
    ).slice(0, 5);

    return NextResponse.json({
      description: parsed.description || "",
      gender: parsed.gender || "Unisex",
      images,
    });
  } catch (err) {
    return NextResponse.json({ error: `Грешка: ${String(err)}` }, { status: 500 });
  }
}
