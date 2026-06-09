import LegalPage from "@/components/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === "bg" ? "Общи условия" : "Terms & Conditions" };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="terms" locale={locale} />;
}
