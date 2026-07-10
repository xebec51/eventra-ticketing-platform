"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/eventra/app-shell";
import { DashboardHeader } from "@/components/eventra/dashboard-header";
import { DashboardSidebar } from "@/components/eventra/dashboard-sidebar";
import type { UserRole, UserStatus } from "@/lib/types";

function inferTitle(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((segment) =>
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");
}

export function DashboardRouteShell({
  children,
  user,
}: {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: UserRole;
    status: UserStatus;
  };
}) {
  const pathname = usePathname();
  const title = inferTitle(pathname) || "Dashboard";

  return (
    <AppShell
      sidebar={<DashboardSidebar role={user.role} pathname={pathname} />}
      header={
        <DashboardHeader
          role={user.role}
          title={title}
          name={user.name || "Eventra User"}
          email={user.email || "No email"}
          status={user.status}
        />
      }
    >
      {children}
    </AppShell>
  );
}
