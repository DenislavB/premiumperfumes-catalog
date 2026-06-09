import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, total } = await req.json();
  const normalized = String(code || "").trim().toUpperCase();
  const orderTotal = parseFloat(total) || 0;

  if (!normalized) {
    return NextResponse.json({ valid: false, error: "Въведете код" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: normalized } });

  if (!promo || !promo.active) {
    return NextResponse.json({ valid: false, error: "Невалиден промокод" });
  }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: "Промокодът е изтекъл" });
  }
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return NextResponse.json({ valid: false, error: "Промокодът е изчерпан" });
  }
  if (promo.minOrder !== null && orderTotal < promo.minOrder) {
    return NextResponse.json({
      valid: false,
      error: `Минимална поръчка за този код: ${promo.minOrder.toFixed(2)} €`,
    });
  }

  // Freebie voucher (e.g. free decant / free shipping) — no price change, honored manually
  if (promo.discountType === "freebie") {
    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: "freebie",
      note: promo.note || "Подарък",
      discount: 0,
      finalTotal: Math.round(orderTotal * 100) / 100,
    });
  }

  // Compute discount
  let discount = 0;
  if (promo.discountType === "percent") {
    discount = (orderTotal * promo.discountValue) / 100;
  } else {
    discount = promo.discountValue;
  }
  discount = Math.min(discount, orderTotal); // never below 0
  discount = Math.round(discount * 100) / 100;

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount,
    finalTotal: Math.round((orderTotal - discount) * 100) / 100,
  });
}
