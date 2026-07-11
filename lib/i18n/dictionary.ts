import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import { en } from "@/lib/i18n/dictionaries/en";
import { id } from "@/lib/i18n/dictionaries/id";

export const dictionaries = {
  en,
  id,
} as const;

export type Dictionary = Record<string, unknown>;

export function getDictionary(locale: Locale): Dictionary {
  return (dictionaries[locale] ?? dictionaries[defaultLocale]) as Dictionary;
}

function getValue(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

export function translate(locale: Locale, key: string, replacements?: Record<string, string | number>) {
  const localized = getValue(getDictionary(locale), key);
  const fallback = getValue(getDictionary(defaultLocale), key);
  const message = typeof localized === "string" ? localized : typeof fallback === "string" ? fallback : key;

  if (!replacements) {
    return message;
  }

  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.replaceAll(`{${token}}`, String(value)),
    message
  );
}
