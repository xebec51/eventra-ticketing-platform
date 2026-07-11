"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { AppFooter } from "@/components/eventra/app-footer";
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}
            >
              {t("nav.createAccount")}
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
              {t("nav.openDashboard")}
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
