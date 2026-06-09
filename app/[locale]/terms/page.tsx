import LegalPage from "@/components/LegalPage";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="terms" locale={locale} />;
}
