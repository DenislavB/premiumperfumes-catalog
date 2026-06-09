import LegalPage from "@/components/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === "bg" ? "Право на отказ и връщане" : "Returns & Withdrawal" };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="returns" locale={locale} />;
}
