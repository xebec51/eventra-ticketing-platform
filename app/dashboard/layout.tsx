import type { ReactNode } from "react";

import { DashboardRouteShell } from "@/components/eventra/dashboard-route-shell";
import { requireDashboardAccess } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDashboardAccess();

  return <DashboardRouteShell user={user}>{children}</DashboardRouteShell>;
}
