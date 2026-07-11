"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { EventraLogo } from "@/components/eventra/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { publicNavItems } from "@/lib/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/use-i18n";

type MarketingShellProps = {
  children: ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.22),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fff8f2_46%,#f5f7fb_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_25%_20%,rgba(255,138,91,0.2),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(29,211,176,0.14),transparent_24%)]" />
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <EventraLogo />
          <nav className="hidden items-center gap-5 lg:flex">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("nav.createAccount")}
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants())}>
              {t("nav.openDashboard")}
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-heading text-lg font-semibold">Eventra</p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("marketing.footerDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/events">{t("nav.browseEvents")}</Link>
            <Link href="/register/organizer">{t("nav.organizerRegistration")}</Link>
            <Link href="/verify/TKT-DEMO2026">{t("nav.verifyTicket")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
