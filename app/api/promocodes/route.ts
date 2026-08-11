import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}

/** The UTC offset Bulgaria is on for a given day, e.g. "+03:00" in summer. */
function sofiaOffset(dateStr: string): string {
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Sofia",
    timeZoneName: "longOffset",
  })
    .formatToParts(probe)
    .find(p => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "+03:00";
}

/**
 * A date picked in the admin means a whole Bulgarian day. Without this a code
 * dated "19 Aug" would stop working at 03:00 that morning, because a bare
 * date string parses as UTC midnight.
 */
function dayBoundary(dateStr: string, edge: "start" | "end"): Date | null {
  if (!dateStr) return null;
  const time = edge === "start" ? "00:00:00.000" : "23:59:59.999";
  const d = new Date(`${dateStr}T${time}${sofiaOffset(dateStr)}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountType: body.discountType === "fixed" ? "fixed" : "percent",
        discountValue: parseFloat(body.discountValue) || 0,
        minOrder: body.minOrder ? parseFloat(body.minOrder) : null,
        startsAt: dayBoundary(body.startsAt, "start"),
        expiresAt: dayBoundary(body.expiresAt, "end"),
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        source: body.source === "quiz" ? "quiz" : "standard",
        active: body.active !== false,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    // Unique constraint
    return NextResponse.json({ error: `Този код вече съществува (${String(err).slice(0, 60)})` }, { status: 400 });
  }
}
