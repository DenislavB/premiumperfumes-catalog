import LegalPage from "@/components/LegalPage";

const BASE = "https://premiumperfumes.bg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === "bg" ? "Общи условия" : "Terms & Conditions",
    alternates: {
      canonical: `${BASE}/${locale}/terms`,
      languages: {
        bg: `${BASE}/bg/terms`,
        en: `${BASE}/en/terms`,
        "x-default": `${BASE}/bg/terms`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="terms" locale={locale} />;
}
