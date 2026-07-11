import { defaultLocale, type Locale } from "@/lib/i18n/locales";

function getResolvedLocale(locale: Locale) {
  return locale === "id" ? "id-ID" : "en-US";
}

export function formatI18nCurrency(value: number | string, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(getResolvedLocale(locale), {
    style: "currency",
    currency: locale === "id" ? "IDR" : "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function formatI18nShortDate(value: Date | string, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(getResolvedLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatI18nDateTime(value: Date | string, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(getResolvedLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatI18nCompactNumber(value: number, locale: Locale = defaultLocale) {
  return new Intl.NumberFormat(getResolvedLocale(locale), {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

