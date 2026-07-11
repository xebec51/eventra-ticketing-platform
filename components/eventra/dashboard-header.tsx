"use client";

import Link from "next/link";
import { DashboardUserMenu } from "@/components/eventra/dashboard-user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-amber-700">{t(`roles.${role}`)}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t(`dashboard.roleCopy.${role}`)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Link
          href="/events"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }), "hidden sm:inline-flex")}
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
