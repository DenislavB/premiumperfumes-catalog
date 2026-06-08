import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
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
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        active: body.active !== false,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    // Unique constraint
    return NextResponse.json({ error: `Този код вече съществува (${String(err).slice(0, 60)})` }, { status: 400 });
  }
}
