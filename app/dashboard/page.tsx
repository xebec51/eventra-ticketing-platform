import { redirectDashboardIndex } from "@/lib/auth";

export default async function DashboardPage() {
  await redirectDashboardIndex();

  return null;
}
