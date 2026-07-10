import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default function AdminUsersPage() {
  return (
    <GenericDashboardPage
      title="User management"
      description="Admins will review user roles, account status, activity, and organizer registration state from this table-driven workspace."
    />
  );
}
