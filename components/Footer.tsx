"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t border-[#2A2418] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[#C9A84C] tracking-widest text-sm uppercase font-medium" style={{ fontFamily: "var(--font-playfair)" }}>
              Premium Perfumes
            </p>
            <p className="text-[#F5ECD7]/30 text-xs mt-1">premiumperfumes.bg</p>
          </div>
          <div className="flex gap-8">
            <Link href={`/${locale}`} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
              {t("catalog")}
            </Link>
            <Link href={`/${locale}#contact`} className="text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase transition-colors">
              {t("contact")}
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#2A2418] text-center">
          <p className="text-[#F5ECD7]/20 text-xs tracking-wider">
            © {new Date().getFullYear()} Premium Perfumes · {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
