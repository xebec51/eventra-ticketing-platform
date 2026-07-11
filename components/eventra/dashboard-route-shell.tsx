"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/eventra/app-shell";
import { DashboardHeader } from "@/components/eventra/dashboard-header";
import { DashboardSidebar } from "@/components/eventra/dashboard-sidebar";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { UserRole, UserStatus } from "@/lib/types";

function inferTitle(pathname: string, t: (key: string) => string) {
  const pathTitleMap: Record<string, string> = {
    "/dashboard": "common.dashboard",
    "/dashboard/profile": "common.profile",
    "/dashboard/settings": "common.settings",
    "/dashboard/admin": "nav.overview",
    "/dashboard/admin/users": "nav.users",
    "/dashboard/admin/organizers": "nav.organizers",
    "/dashboard/admin/events": "nav.events",
    "/dashboard/admin/categories": "nav.categories",
    "/dashboard/admin/bookings": "nav.bookings",
    "/dashboard/admin/payments": "nav.payments",
    "/dashboard/admin/reports": "nav.reports",
    "/dashboard/admin/activity-logs": "nav.activityLogs",
    "/dashboard/organizer": "nav.overview",
    "/dashboard/organizer/events": "nav.myEvents",
    "/dashboard/organizer/bookings": "nav.bookings",
    "/dashboard/organizer/payments": "nav.payments",
    "/dashboard/organizer/check-in": "nav.checkIn",
    "/dashboard/organizer/reports": "nav.reports",
    "/dashboard/organizer/profile": "nav.organizerProfile",
    "/dashboard/user": "nav.overview",
    "/dashboard/user/bookings": "nav.bookings",
    "/dashboard/user/tickets": "nav.tickets",
    "/dashboard/user/favorites": "nav.favorites",
    "/dashboard/user/reviews": "nav.reviews",
    "/dashboard/user/profile": "common.profile",
  };

  return pathTitleMap[pathname] ? t(pathTitleMap[pathname]) : t("common.dashboard");
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
  const { t } = useI18n();
  const title = inferTitle(pathname, t);

  return (
    <AppShell
      sidebar={<DashboardSidebar role={user.role} pathname={pathname} />}
      header={
        <DashboardHeader
          role={user.role}
          title={title}
          name={user.name || t("dashboard.userFallback")}
          email={user.email || t("common.noEmail")}
          status={user.status}
        />
      }
    >
      {children}
    </AppShell>
  );
}
