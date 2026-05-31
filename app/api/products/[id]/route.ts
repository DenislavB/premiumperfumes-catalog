import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.nameBg !== undefined) data.nameBg = body.nameBg;
  if (body.description !== undefined) data.description = body.description;
  if (body.descriptionBg !== undefined) data.descriptionBg = body.descriptionBg;
  if (body.brand !== undefined) data.brand = body.brand;
  if (body.volume !== undefined) data.volume = body.volume;
  if (body.gender !== undefined) data.gender = body.gender;
  if (body.price !== undefined) data.price = parseFloat(body.price);
  if (body.originalPrice !== undefined) data.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
  if (body.quantity !== undefined) data.quantity = parseInt(body.quantity);
  if (body.images !== undefined) data.images = body.images;
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.inPromotion !== undefined) data.inPromotion = body.inPromotion;
  if (body.discountPct !== undefined) data.discountPct = body.discountPct ? parseInt(body.discountPct) : null;
  if (body.available !== undefined) data.available = body.available;

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
