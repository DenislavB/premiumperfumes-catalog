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

  // JSON round-trip serializes all Date objects to strings safely
  const data = JSON.parse(JSON.stringify({ products, requests }));

  return <AdminDashboardClient products={data.products} requests={data.requests} />;
}
