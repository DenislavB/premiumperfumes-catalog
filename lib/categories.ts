/**
 * The three catalogue categories, each with its own indexable landing page.
 *
 * Until now the categories only existed as client-side filter state, so there
 * was no URL for Google to rank for "арабски парфюми" and friends. The slugs
 * are Bulgarian because that is the market the shop sells into; the same slug
 * serves both locales so a product page can link to its category without
 * needing a per-language lookup.
 */
export const CATEGORIES = ["arabian", "designer", "niche"] as const;
export type CategoryKey = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS: Record<CategoryKey, string> = {
  arabian: "arabski-parfyumi",
  designer: "dizainerski-parfyumi-otlivki",
  niche: "nishovi-parfyumi-otlivki",
};

/** slug -> category key, for resolving the route param */
export const SLUG_TO_CATEGORY: Record<string, CategoryKey> = Object.fromEntries(
  (Object.entries(CATEGORY_SLUGS) as [CategoryKey, string][]).map(([k, v]) => [v, k])
);

type Copy = { title: string; heading: string; description: string; intro: string };

export const CATEGORY_COPY: Record<"bg" | "en", Record<CategoryKey, Copy>> = {
  bg: {
    arabian: {
      title: "Арабски парфюми — оригинални, с отливки",
      heading: "Арабски парфюми",
      description:
        "Оригинални арабски парфюми — Lattafa, Armaf, Afnan, Maison Alhambra. Пробвай като отливка, преди да купиш флакон. Доставка в цяла България за 1–3 дни.",
      intro:
        "Арабските парфюми са известни с плътността и дълготрайността си — уд, амбра, шафран и роза, направени да останат върху кожата с часове. Всеки аромат тук може да се поръча и като отливка, за да го изживееш, преди да се обвържеш с цял флакон.",
    },
    designer: {
      title: "Дизайнерски парфюми — отливки от оригинални флакони",
      heading: "Дизайнерски парфюми — отливки",
      description:
        "Отливки от оригинални дизайнерски парфюми — Dior, Versace, Burberry, Prada и още. Изпробвай любимия си аромат, без да плащаш за цял флакон.",
      intro:
        "Отливка е малко количество от оригиналния парфюм, прелято в отделно шишенце. Получаваш същия аромат от същия флакон, но на част от цената — идеално, за да провериш как стои върху твоята кожа, преди да инвестираш.",
    },
    niche: {
      title: "Нишови парфюми — отливки от редки аромати",
      heading: "Нишови парфюми — отливки",
      description:
        "Отливки от нишови парфюми — Amouage, Nishane, Kilian, Parfums de Marly. Редки аромати на достъпна цена, с доставка в цяла България.",
      intro:
        "Нишовите парфюми се произвеждат в малки серии, с по-редки съставки и по-смели композиции от масовите марки. Цената на цял флакон често надхвърля няколкостотин лева — затова отливката е най-разумният начин да откриеш дали един такъв аромат е за теб.",
    },
  },
  en: {
    arabian: {
      title: "Arabian Perfumes — original, with decants",
      heading: "Arabian Perfumes",
      description:
        "Original Arabian perfumes — Lattafa, Armaf, Afnan, Maison Alhambra. Try a decant before committing to a bottle. Delivery across Bulgaria in 1–3 days.",
      intro:
        "Arabian perfumes are known for their depth and longevity — oud, amber, saffron and rose, built to last on skin for hours. Every fragrance here can also be ordered as a decant, so you can live with it before committing to a full bottle.",
    },
    designer: {
      title: "Designer Perfume Decants — from original bottles",
      heading: "Designer Perfumes — Decants",
      description:
        "Decants of original designer perfumes — Dior, Versace, Burberry, Prada and more. Try your favourite scent without paying for a full bottle.",
      intro:
        "A decant is a small amount of the original perfume, transferred into its own vial. Same fragrance, same bottle, a fraction of the price — the sensible way to see how a scent behaves on your skin before investing.",
    },
    niche: {
      title: "Niche Perfume Decants — rare fragrances",
      heading: "Niche Perfumes — Decants",
      description:
        "Decants of niche perfumes — Amouage, Nishane, Kilian, Parfums de Marly. Rare fragrances at an accessible price, delivered across Bulgaria.",
      intro:
        "Niche perfumes are made in small batches, with rarer materials and bolder compositions than mainstream houses. A full bottle often runs into the hundreds — which is exactly why a decant is the smartest way to find out whether one is for you.",
    },
  },
};
