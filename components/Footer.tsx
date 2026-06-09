"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { COMPANY } from "@/lib/legalContent";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const legalLinks = [
    { href: `/${locale}/privacy`, bg: "Политика за поверителност", en: "Privacy Policy" },
    { href: `/${locale}/cookies`, bg: "Политика за бисквитки", en: "Cookies Policy" },
    { href: `/${locale}/terms`, bg: "Общи условия", en: "Terms & Conditions" },
    { href: `/${locale}/returns`, bg: "Право на отказ и връщане", en: "Returns & Withdrawal" },
  ];

  return (
    <footer className="border-t border-[#2A2418] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-[#C9A84C] tracking-widest text-sm uppercase font-medium" style={{ fontFamily: "var(--font-playfair)" }}>
              Premium Perfumes
            </p>
            <p className="text-[#F5ECD7]/30 text-xs mt-1">{COMPANY.site}</p>
            <p className="text-[#F5ECD7]/30 text-xs mt-3 leading-relaxed">
              {locale === "bg" ? COMPANY.store : COMPANY.storeEn}
            </p>
          </div>

          {/* Navigation */}
          <div className="text-center md:text-left flex flex-col gap-2">
            <Link href={`/${locale}`} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
              {t("catalog")}
            </Link>
            <Link href={`/${locale}#about`} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
              {locale === "bg" ? "За нас" : "About"}
            </Link>
            <Link href={`/${locale}#contact`} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
              {t("contact")}
            </Link>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left flex flex-col gap-2">
            {legalLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] transition-colors">
                {locale === "bg" ? l.bg : l.en}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#2A2418] text-center">
          <p className="text-[#F5ECD7]/20 text-xs tracking-wider">
            © {new Date().getFullYear()} {locale === "bg" ? COMPANY.name : COMPANY.nameEn} · ЕИК {COMPANY.eik} · {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
