"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLocale = locale === "bg" ? "en" : "bg";
  const switchLocale = () => {
    const stripped = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${otherLocale}${stripped}`);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0D0B08]/95 backdrop-blur-md border-b border-[#C9A84C]/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex flex-col leading-none">
          <span
            className="text-xl font-bold tracking-widest uppercase"
            style={{ fontFamily: "var(--font-playfair)", color: "#C9A84C" }}
          >
            Premium
          </span>
          <span className="text-xs tracking-[0.4em] uppercase text-[#F5ECD7]/60">
            Perfumes
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className="text-sm tracking-widest uppercase text-[#F5ECD7]/70 hover:text-[#C9A84C] transition-colors"
          >
            {t("catalog")}
          </Link>
          <Link
            href={`/${locale}#about`}
            className="text-sm tracking-widest uppercase text-[#F5ECD7]/70 hover:text-[#C9A84C] transition-colors"
          >
            {t("about")}
          </Link>
          <Link
            href={`/${locale}#contact`}
            className="text-sm tracking-widest uppercase text-[#F5ECD7]/70 hover:text-[#C9A84C] transition-colors"
          >
            {t("contact")}
          </Link>
          <button
            onClick={switchLocale}
            className="text-xs tracking-widest uppercase border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 hover:bg-[#C9A84C]/10 transition-colors"
          >
            {otherLocale.toUpperCase()}
          </button>
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={switchLocale} className="text-xs text-[#C9A84C] border border-[#C9A84C]/40 px-2 py-1">
            {otherLocale.toUpperCase()}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-[#F5ECD7]">
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`h-px bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-px bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-px bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D0B08] border-t border-[#C9A84C]/20 px-6 py-6 flex flex-col gap-6">
          {[["catalog", `/${locale}`], ["about", `/${locale}#about`], ["contact", `/${locale}#contact`]].map(
            ([key, href]) => (
              <Link
                key={key}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-[#F5ECD7]/70 hover:text-[#C9A84C]"
              >
                {t(key as "catalog" | "about" | "contact")}
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}
