import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import type { Product as PrismaProduct, PurchaseRequest as PrismaRequest } from "@prisma/client";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");

  const [products, requests] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // Serialize dates to strings for client components
  const serializedProducts = products.map((p: PrismaProduct) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const serializedRequests = requests.map((r: PrismaRequest) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AdminDashboardClient products={serializedProducts} requests={serializedRequests} />;
}
