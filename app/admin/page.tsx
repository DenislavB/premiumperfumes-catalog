import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");

  const [products, requests] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedProducts = (products as any[]).map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedRequests = (requests as any[]).map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AdminDashboardClient products={serializedProducts} requests={serializedRequests} />;
}
