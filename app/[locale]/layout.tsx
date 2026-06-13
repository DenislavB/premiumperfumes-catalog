import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";

const locales = ["en", "bg"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <CartProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <CookieConsent />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
