import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PRIZES, pickPrizeIndex } from "@/lib/prizes";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "SPIN" + s;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Step 1: spin — server decides the prize
  if (body.action === "spin") {
    const prizeIndex = pickPrizeIndex();
    return NextResponse.json({ prizeIndex });
  }

  // Step 2: claim — record entry + generate code
  if (body.action === "claim") {
    const { prizeIndex, name, email, phone, marketing } = body;
    const idx = parseInt(prizeIndex);
    if (isNaN(idx) || idx < 0 || idx >= PRIZES.length) {
      return NextResponse.json({ error: "Invalid prize" }, { status: 400 });
    }
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    // One wheel code per email — prevent farming
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.spinEntry.findFirst({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({
        duplicate: true,
        message: "Този имейл вече е участвал в играта.",
        code: existing.code,
      });
    }

    const prize = PRIZES[idx];

    // Generate a single-use promo code for EVERY prize
    const code = randomCode();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // valid 30 days
    await prisma.promoCode.create({
      data: {
        code,
        discountType: prize.type, // "percent" | "fixed" | "freebie"
        discountValue: prize.value,
        note: prize.type === "freebie" ? prize.label : null,
        source: "wheel",
        usageLimit: 1,
        expiresAt: expires,
        active: true,
      },
    });

    await prisma.spinEntry.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        phone: phone || null,
        prize: prize.label,
        code,
        marketing: !!marketing,
      },
    });

    return NextResponse.json({ prize: prize.label, code });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.spinEntry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(entries);
}
