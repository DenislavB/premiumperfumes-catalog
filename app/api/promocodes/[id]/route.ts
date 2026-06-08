import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = body.active;
  if (body.discountValue !== undefined) data.discountValue = parseFloat(body.discountValue);
  if (body.discountType !== undefined) data.discountType = body.discountType;
  if (body.minOrder !== undefined) data.minOrder = body.minOrder ? parseFloat(body.minOrder) : null;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit ? parseInt(body.usageLimit) : null;

  const updated = await prisma.promoCode.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
