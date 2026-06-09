import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LEGAL } from "@/lib/legalContent";

export default function LegalPage({ doc, locale }: { doc: keyof typeof LEGAL; locale: string }) {
  const content = locale === "bg" ? LEGAL[doc].bg : LEGAL[doc].en;

  return (
    <div className="pt-28 md:pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs text-[#F5ECD7]/40 hover:text-[#C9A84C] tracking-widest uppercase mb-10 transition-colors"
        >
          <ArrowLeft size={14} />
          {locale === "bg" ? "Обратно към сайта" : "Back to site"}
        </Link>

        <h1 className="text-3xl md:text-4xl text-gradient-gold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          {content.title}
        </h1>
        <p className="text-[#F5ECD7]/30 text-xs mb-12">{content.updated}</p>

        <div className="flex flex-col gap-8">
          {content.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-[#C9A84C] text-lg mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                {s.heading}
              </h2>
              <div className="flex flex-col gap-2">
                {s.body.map((p, j) => (
                  <p key={j} className="text-[#F5ECD7]/60 leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
