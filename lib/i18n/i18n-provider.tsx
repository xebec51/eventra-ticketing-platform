"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { translate } from "@/lib/i18n/dictionary";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/locales";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return initialLocale;
    }

    const stored = window.localStorage.getItem(localeCookieName);

    return isLocale(stored) ? stored : initialLocale;
  });

  useEffect(() => {
    window.localStorage.setItem(localeCookieName, locale);
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        setLocaleState(isLocale(nextLocale) ? nextLocale : defaultLocale);
      },
      t: (key, replacements) => translate(locale, key, replacements),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
