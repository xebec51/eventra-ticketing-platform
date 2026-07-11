import { cookies } from "next/headers";

import { translate } from "@/lib/i18n/dictionary";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/locales";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(localeCookieName)?.value;

  return isLocale(stored) ? stored : defaultLocale;
}

export async function getServerTranslator() {
  const locale = await getServerLocale();

  return {
    locale,
    t: (key: string, replacements?: Record<string, string | number>) =>
      translate(locale, key, replacements),
  };
}

