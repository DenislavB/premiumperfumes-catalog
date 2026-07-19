import LegalPage from "@/components/LegalPage";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "bg" ? "Право на отказ и връщане" : "Returns & Withdrawal",
    alternates: {
      canonical: `${BASE}/${locale}/returns`,
      languages: {
        bg: `${BASE}/bg/returns`,
        en: `${BASE}/en/returns`,
        "x-default": `${BASE}/bg/returns`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="returns" locale={locale} />;
}
