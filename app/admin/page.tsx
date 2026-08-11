import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");

  const [products, requests, messages, promoCodes, spinEntries, quizSessions] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.purchaseRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.spinEntry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.quizSession.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
  ]);

  // JSON round-trip serializes all Date objects to strings safely
  const data = JSON.parse(JSON.stringify({ products, requests, messages, promoCodes, spinEntries, quizSessions }));

  return (
    <AdminDashboardClient
      products={data.products}
      requests={data.requests}
      messages={data.messages}
      promoCodes={data.promoCodes}
      spinEntries={data.spinEntries}
      quizSessions={data.quizSessions}
    />
  );
}
