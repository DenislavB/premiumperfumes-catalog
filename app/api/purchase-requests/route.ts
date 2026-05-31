import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, message, items } = body;

  if (!name || !email || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const request = await prisma.purchaseRequest.create({
    data: { name, email, phone: phone || null, message: message || null, items },
  });

  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
}
