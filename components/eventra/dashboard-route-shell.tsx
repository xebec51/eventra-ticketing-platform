"use client";

import type { ReactNode } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";

import { AppShell } from "@/components/eventra/app-shell";
import { DashboardHeader } from "@/components/eventra/dashboard-header";
import { DashboardSidebar } from "@/components/eventra/dashboard-sidebar";
import type { UserRole } from "@/lib/types";

function inferRole(segments: string[]): UserRole {
  const firstSegment = segments[0];

  if (firstSegment === "admin") return "ADMIN";
  if (firstSegment === "organizer") return "ORGANIZER";
  return "USER";
}

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
}: {
  children: ReactNode;
}) {
  const segments = useSelectedLayoutSegments();
  const pathname = usePathname();
  const role = inferRole(segments);
  const title = inferTitle(pathname) || "Dashboard";

  return (
    <AppShell
      sidebar={<DashboardSidebar role={role} pathname={pathname} />}
      header={<DashboardHeader role={role} title={title} />}
    >
      {children}
    </AppShell>
  );
}
