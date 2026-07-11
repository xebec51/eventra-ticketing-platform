"use client";

import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";

import { DashboardUserMenu } from "@/components/eventra/dashboard-user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/lib/types";

export function DashboardHeader({
  role,
  title,
  name,
  email,
  status,
}: {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  status: UserStatus;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#d46d42]">
          <Sparkles className="size-3.5" />
          {t(`roles.${role}`)}
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t(`dashboard.roleCopy.${role}`)}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("dashboard.quickSearch")} className="h-11 border-black/10 pl-10" />
        </div>
        <LanguageSwitcher />
        <Button variant="outline" size="lg">
          <Bell className="size-4" />
          {t("dashboard.alerts")}
        </Button>
        <Link
          href="/events"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          {t("dashboard.viewCatalog")}
        </Link>
        <DashboardUserMenu
          name={name}
          email={email}
          role={role}
          status={status}
        />
      </div>
    </div>
  );
}
