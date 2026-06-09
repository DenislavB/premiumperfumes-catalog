"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

const KEY = "pp_cookie_consent_v1";

export default function CookieConsent() {
  const locale = useLocale();
  const bg = locale === "bg";
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[120] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#161410] border border-[#C9A84C]/40 shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="text-[#F5ECD7] text-sm font-medium mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            {bg ? "Поверителност и бисквитки" : "Privacy & Cookies"}
          </p>
          <p className="text-[#F5ECD7]/55 text-xs leading-relaxed">
            {bg
              ? "Този сайт използва само необходими (функционални) бисквитки за правилната си работа. Като продължавате, се съгласявате с нашите "
              : "This site uses only necessary (functional) cookies to work properly. By continuing you agree to our "}
            <a href={`/${locale}/privacy`} className="text-[#C9A84C] underline">{bg ? "Политика за поверителност" : "Privacy Policy"}</a>
            {bg ? " и " : " and "}
            <a href={`/${locale}/cookies`} className="text-[#C9A84C] underline">{bg ? "Политика за бисквитки" : "Cookies Policy"}</a>.
          </p>
        </div>
        <button
          onClick={accept}
          className="flex-shrink-0 px-6 py-3 bg-[#C9A84C] text-[#0D0B08] text-xs font-bold tracking-widest uppercase hover:bg-[#E8D5A3] transition-colors"
        >
          {bg ? "Приемам" : "Accept"}
        </button>
      </div>
    </div>
  );
}
