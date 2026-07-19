import LegalPage from "@/components/LegalPage";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "bg" ? "Политика за поверителност" : "Privacy Policy",
    alternates: {
      canonical: `${BASE}/${locale}/privacy`,
      languages: {
        bg: `${BASE}/bg/privacy`,
        en: `${BASE}/en/privacy`,
        "x-default": `${BASE}/bg/privacy`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="privacy" locale={locale} />;
}
