import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * The promo code currently attached to the Scent Journey, or null.
 *
 * Driven entirely by the PromoCode table (source = "quiz"), so the campaign
 * turns itself off when the code expires — nothing to remember to switch off.
 * If several are active, the one ending soonest wins.
 */
export async function GET() {
  const now = new Date();

  const promo = await prisma.promoCode.findFirst({
    where: {
      source: "quiz",
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: [{ expiresAt: "asc" }],
  });

  if (!promo) return NextResponse.json({ promo: null });
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return NextResponse.json({ promo: null });
  }

  return NextResponse.json({
    promo: {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      expiresAt: promo.expiresAt,
    },
  });
}
