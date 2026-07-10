import type { ReactNode } from "react";

import { DashboardRouteShell } from "@/components/eventra/dashboard-route-shell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
