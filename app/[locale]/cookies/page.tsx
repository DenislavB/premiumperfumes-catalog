import LegalPage from "@/components/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === "bg" ? "Политика за бисквитки" : "Cookies Policy" };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="cookies" locale={locale} />;
}
