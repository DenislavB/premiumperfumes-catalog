import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { rehostImages } from "@/lib/blob";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = slugify(body.name) + "-" + Date.now().toString(36);
  const images = await rehostImages(body.images || []);

  const product = await prisma.product.create({
    data: {
      slug,
      name: body.name,
      nameBg: body.nameBg,
      description: body.description || "",
      descriptionBg: body.descriptionBg || "",
      brand: body.brand,
      category: body.category || "arabian",
      volume: body.volume,
      gender: body.gender,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      quantity: parseInt(body.quantity) || 0,
      images,
      variants: Array.isArray(body.variants) ? body.variants : [],
      notes: body.notes || "",
      notesBg: body.notesBg || "",
      featured: body.featured || false,
      inPromotion: body.inPromotion || false,
      discountPct: body.discountPct ? parseInt(body.discountPct) : null,
      available: body.available !== false,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
