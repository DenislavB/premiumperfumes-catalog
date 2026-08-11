import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const STEP_KEYS = ["favorite", "families", "occasion", "season", "vibe", "intensity", "target"];

/**
 * Records a run of the Scent Journey. Called when the visitor starts, and again
 * when they finish (or abandon). Upserted by the client-generated session id so
 * one journey is one row.
 *
 * Anonymous by design: `visitorId` is a random id kept in the visitor's browser.
 * It only ever gains a name if that same visitor later places an order, which is
 * how the conversion figure in the admin panel is worked out.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, visitorId } = body;

    if (!sessionId || !visitorId) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 });
    }

    const answers = body.answers || {};
    const families = Array.isArray(answers.families) ? answers.families.slice(0, 12).map(String) : [];
    const recommended = Array.isArray(body.recommended)
      ? body.recommended.slice(0, 5).map((r: { id: string; name: string; brand: string; match: number }) => ({
          id: String(r.id),
          name: String(r.name).slice(0, 160),
          brand: String(r.brand).slice(0, 80),
          match: Number(r.match) || 0,
        }))
      : [];

    const data = {
      visitorId: String(visitorId).slice(0, 64),
      locale: String(body.locale || "bg").slice(0, 5),
      completed: !!body.completed,
      lastStep: STEP_KEYS.includes(body.lastStep) ? body.lastStep : "favorite",
      favorite: answers.favorite ? String(answers.favorite).slice(0, 120) : null,
      favoriteHit: body.favoriteHit ? String(body.favoriteHit).slice(0, 160) : null,
      families,
      occasion: answers.occasion || null,
      season: answers.season || null,
      vibe: answers.vibe || null,
      intensity: answers.intensity || null,
      target: answers.target || null,
      recommended,
    };

    await prisma.quizSession.upsert({
      where: { id: String(sessionId).slice(0, 64) },
      create: { id: String(sessionId).slice(0, 64), ...data },
      update: data,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Quiz tracking error:", e);
    // Never let analytics break the customer's experience
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.quizSession.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
  return NextResponse.json(sessions);
}
