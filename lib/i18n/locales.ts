export const locales = ["en", "id"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export const localeCookieName = "eventra-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "id";
}

