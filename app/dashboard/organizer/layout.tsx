import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth";

export default async function OrganizerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("ORGANIZER");

  return children;
}
