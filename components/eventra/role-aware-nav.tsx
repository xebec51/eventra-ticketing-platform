"use client";

import Link from "next/link";

import { sharedDashboardNav, roleDashboardNav } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type RoleAwareNavProps = {
  role: UserRole;
  pathname: string;
};

export function RoleAwareNav({ role, pathname }: RoleAwareNavProps) {
  const navItems = [...sharedDashboardNav, ...roleDashboardNav[role]];
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/45">
          {t("nav.shared")}
        </p>
        <nav className="mt-3 space-y-1">
          {sharedDashboardNav.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/45">
          {role === "ADMIN"
            ? t("nav.adminWorkspace")
            : role === "ORGANIZER"
              ? t("nav.organizerWorkspace")
              : t("nav.userWorkspace")}
        </p>
        <nav className="mt-3 space-y-1">
          {navItems.slice(sharedDashboardNav.length).map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
