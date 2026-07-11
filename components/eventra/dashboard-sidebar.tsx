"use client";

import { BadgeCheck, Radar, ShieldCheck } from "lucide-react";

import { EventraLogo } from "@/components/eventra/logo";
import { RoleAwareNav } from "@/components/eventra/role-aware-nav";
import { Card, CardContent } from "@/components/ui/card";
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
    <aside className="w-full max-w-80 shrink-0 rounded-2xl border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-[0_24px_80px_rgba(17,24,39,0.18)]">
      <EventraLogo href="/dashboard" />
      <div className="mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-sidebar-foreground/70">
          <Radar className="size-3.5 text-amber-300" />
          Live operations
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/7 p-2">
            <p className="text-sidebar-foreground/55">Role</p>
            <p className="mt-1 font-semibold">{t(`roles.${role}`)}</p>
          </div>
          <div className="rounded-lg bg-white/7 p-2">
            <p className="text-sidebar-foreground/55">Mode</p>
            <p className="mt-1 font-semibold">Secure</p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <RoleAwareNav role={role} pathname={pathname} />
      </div>
      <Card className="mt-6 border border-sidebar-border bg-white/7 text-sidebar-foreground">
        <CardContent className="space-y-3 pt-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold">
              {t("marketing.approvals")}
            </p>
            <p className="mt-1 text-sm text-sidebar-foreground/65">
              {t("marketing.approvalsDescription")}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-slate-950">
            <BadgeCheck className="size-3.5" />
            Guarded workflow
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
