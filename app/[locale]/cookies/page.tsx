import LegalPage from "@/components/LegalPage";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "bg" ? "Политика за бисквитки" : "Cookies Policy",
    alternates: {
      canonical: `${BASE}/${locale}/cookies`,
      languages: {
        bg: `${BASE}/bg/cookies`,
        en: `${BASE}/en/cookies`,
        "x-default": `${BASE}/bg/cookies`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="cookies" locale={locale} />;
}
