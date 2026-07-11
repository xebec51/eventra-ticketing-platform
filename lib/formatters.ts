import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import {
  formatI18nCompactNumber,
  formatI18nCurrency,
  formatI18nDateTime,
  formatI18nShortDate,
} from "@/lib/i18n/formatters";

export function formatCurrency(value: number | string, locale: Locale = defaultLocale) {
  return formatI18nCurrency(value, locale);
}

export function formatShortDate(value: Date | string, locale: Locale = defaultLocale) {
  return formatI18nShortDate(value, locale);
}

export function formatDateTime(value: Date | string, locale: Locale = defaultLocale) {
  return formatI18nDateTime(value, locale);
}

export function formatCompactNumber(value: number, locale: Locale = defaultLocale) {
  return formatI18nCompactNumber(value, locale);
}
