import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, courier, address, message, items } = body;

  if (!name || !phone || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
