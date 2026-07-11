import type { Metadata } from "next";

import "./globals.css";
import { I18nProvider } from "@/lib/i18n/i18n-provider";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: {
    default: "Eventra",
    template: "%s | Eventra",
  },
  description:
    "Eventra is a modern smart event ticketing platform for organizers, attendees, and approval-driven event operations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
