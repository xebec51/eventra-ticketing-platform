"use client";

import { EventraLogo } from "@/components/eventra/logo";
import { RoleAwareNav } from "@/components/eventra/role-aware-nav";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { UserRole } from "@/lib/types";

type DashboardSidebarProps = {
  role: UserRole;
  pathname: string;
};

export function DashboardSidebar({
  role,
  pathname,
}: DashboardSidebarProps) {
  const { t } = useI18n();

  return (
    <aside className="w-full max-w-72 shrink-0 rounded-xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-none lg:sticky lg:top-4 lg:self-start">
      <EventraLogo href="/dashboard" />
      <p className="mt-5 border-y border-sidebar-border py-3 text-xs text-sidebar-foreground/60">
        {t(`roles.${role}`)}
      </p>
      <div className="mt-5">
        <RoleAwareNav role={role} pathname={pathname} />
      </div>
    </aside>
  );
}
