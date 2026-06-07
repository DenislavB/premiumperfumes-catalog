import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "bg"],
  defaultLocale: "bg",
  // Always start in Bulgarian — don't auto-switch based on the visitor's browser language
  localeDetection: false,
});
