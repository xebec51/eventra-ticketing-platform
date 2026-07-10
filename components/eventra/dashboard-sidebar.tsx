"use client";

import { ShieldCheck } from "lucide-react";

import { EventraLogo } from "@/components/eventra/logo";
import { RoleAwareNav } from "@/components/eventra/role-aware-nav";
import { Card, CardContent } from "@/components/ui/card";
import type { UserRole } from "@/lib/types";

type DashboardSidebarProps = {
  role: UserRole;
  pathname: string;
};

export function DashboardSidebar({
  role,
  pathname,
}: DashboardSidebarProps) {
  return (
    <aside className="w-full max-w-80 shrink-0 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <EventraLogo href="/dashboard" />
      <div className="mt-8">
        <RoleAwareNav role={role} pathname={pathname} />
      </div>
      <Card className="mt-8 border border-emerald-100 bg-emerald-50/70">
        <CardContent className="space-y-3 pt-6">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-slate-900">
              Approval-centric ops
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Manual payment verification, booking review, and ticket issuance
              stay tightly controlled.
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
