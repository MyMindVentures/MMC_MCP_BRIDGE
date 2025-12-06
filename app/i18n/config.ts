export const locales = [
  "en",
  "nl",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "pl",
  "ru",
  "zh",
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  pl: "Polski",
  ru: "Русский",
  zh: "中文",
};
