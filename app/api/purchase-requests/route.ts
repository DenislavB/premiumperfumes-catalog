import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, courier, address, message, items } = body;
  // Accept either a single promoCode (legacy) or an array promoCodes
  const rawCodes: string[] = Array.isArray(body.promoCodes)
    ? body.promoCodes
    : body.promoCode
    ? [body.promoCode]
    : [];

  if (!name || !phone || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const orderTotal = (items as { price: number }[]).reduce((s, it) => s + (it.price || 0), 0);

  // Re-validate each promo code server-side. Rule: max 1 "wheel" + 1 "standard".
  const acceptedCodes: string[] = [];
  let discount = 0;
  const usedSources = new Set<string>();

  // De-duplicate, cap at 2
  const unique = [...new Set(rawCodes.map(c => String(c).trim().toUpperCase()).filter(Boolean))].slice(0, 2);

  for (const codeStr of unique) {
    const promo = await prisma.promoCode.findUnique({ where: { code: codeStr } });
    const valid =
      promo &&
      promo.active &&
      (!promo.expiresAt || new Date(promo.expiresAt) >= new Date()) &&
      (promo.usageLimit === null || promo.usageCount < promo.usageLimit) &&
      (promo.minOrder === null || orderTotal >= promo.minOrder) &&
      !usedSources.has(promo.source); // only one code per source

    if (valid && promo) {
      usedSources.add(promo.source);
      acceptedCodes.push(promo.code);
      if (promo.discountType === "percent") discount += (orderTotal * promo.discountValue) / 100;
      else if (promo.discountType === "fixed") discount += promo.discountValue;
      // freebie adds 0
      await prisma.promoCode.update({ where: { id: promo.id }, data: { usageCount: { increment: 1 } } });
    }
  }

  discount = Math.round(Math.min(discount, orderTotal) * 100) / 100;

  const request = await prisma.purchaseRequest.create({
    data: {
      name,
      email: email || null,
      phone,
      courier: courier || null,
      address: address || null,
      message: message || null,
      items,
      promoCode: acceptedCodes.length ? acceptedCodes.join(", ") : null,
      discount: acceptedCodes.length ? discount : null,
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
