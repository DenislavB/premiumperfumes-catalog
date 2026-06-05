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

  const prompt = `Ти си експерт по луксозни парфюми. За парфюма "${name}" от "${brand}" предостави:

1. Елегантно описание на английски (3-4 изречения) подходящо за луксозен каталог. Спомени характера на аромата, основните нотки и за кого е подходящ.
2. Същото описание на български (3-4 изречения) — луксозен стил.
3. Пола: Men, Women или Unisex.
4. Основни нотки на аромата (до 8 нотки на английски, разделени със запетая).

Отговори САМО с валиден JSON в този точен формат:
{
  "descriptionEn": "...",
  "descriptionBg": "...",
  "gender": "Men|Women|Unisex",
  "notes": "rose, oud, amber, musk"
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
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!xaiRes.ok) {
      const err = await xaiRes.text();
      throw new Error(`xAI error: ${err}`);
    }

    const xaiData = await xaiRes.json();
    const text = xaiData?.choices?.[0]?.message?.content || "";

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Не е намерен JSON в отговора");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      description: parsed.descriptionEn || "",
      descriptionBg: parsed.descriptionBg || "",
      gender: parsed.gender || "Unisex",
      notes: parsed.notes || "",
      images: [],
    });

  } catch (err) {
    return NextResponse.json({ error: `Грешка: ${String(err)}` }, { status: 500 });
  }
}
