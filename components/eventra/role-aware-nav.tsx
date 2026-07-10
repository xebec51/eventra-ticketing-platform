"use client";

import Link from "next/link";

import { sharedDashboardNav, roleDashboardNav } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type RoleAwareNavProps = {
  role: UserRole;
  pathname: string;
};

export function RoleAwareNav({ role, pathname }: RoleAwareNavProps) {
  const navItems = [...sharedDashboardNav, ...roleDashboardNav[role]];

  return (
    <div className="space-y-6">
      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Shared
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
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {role.toLowerCase()} workspace
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
                    ? "bg-[#231942] text-white shadow-lg shadow-[#231942]/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
