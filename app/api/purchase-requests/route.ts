import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, courier, address, message, items, promoCode } = body;

  if (!name || !phone || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Re-validate promo code server-side (don't trust client discount)
  let appliedCode: string | null = null;
  let discount: number | null = null;

  if (promoCode) {
    const normalized = String(promoCode).trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({ where: { code: normalized } });
    const orderTotal = (items as { price: number }[]).reduce((s, it) => s + (it.price || 0), 0);

    const valid =
      promo &&
      promo.active &&
      (!promo.expiresAt || new Date(promo.expiresAt) >= new Date()) &&
      (promo.usageLimit === null || promo.usageCount < promo.usageLimit) &&
      (promo.minOrder === null || orderTotal >= promo.minOrder);

    if (valid && promo) {
      let d = promo.discountType === "percent" ? (orderTotal * promo.discountValue) / 100 : promo.discountValue;
      d = Math.round(Math.min(d, orderTotal) * 100) / 100;
      appliedCode = promo.code;
      discount = d;
      // Increment usage count
      await prisma.promoCode.update({ where: { id: promo.id }, data: { usageCount: { increment: 1 } } });
    }
  }

  const request = await prisma.purchaseRequest.create({
    data: {
      name,
      email: email || null,
      phone,
      courier: courier || null,
      address: address || null,
      message: message || null,
      items,
      promoCode: appliedCode,
      discount,
    },
  });

  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
}
