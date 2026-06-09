import SpinWheel from "@/components/SpinWheel";

export default async function SpinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const bg = locale === "bg";

  return (
    <div className="relative min-h-screen pt-28 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0B08] via-[#17120A] to-[#0D0B08]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs tracking-[0.5em] uppercase">✦</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A84C]" />
        </div>
        <h1 className="text-4xl md:text-5xl text-gradient-gold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
          {bg ? "Завъртете и спечелете" : "Spin & Win"}
        </h1>
        <p className="text-[#F5ECD7]/60 mb-12 max-w-md mx-auto">
          {bg
            ? "По случай откриването на premiumperfumes.bg — завъртете колелото и спечелете отстъпка или подарък!"
            : "To celebrate the launch of premiumperfumes.bg — spin the wheel and win a discount or a gift!"}
        </p>

        <SpinWheel />

        <p className="text-[#F5ECD7]/20 text-xs mt-12 max-w-md mx-auto">
          {bg
            ? "Един участник може да спечели веднъж. Наградите не подлежат на замяна срещу пари. Виж Общите условия."
            : "One prize per participant. Prizes cannot be exchanged for cash. See Terms & Conditions."}
        </p>
      </div>
    </div>
  );
}
