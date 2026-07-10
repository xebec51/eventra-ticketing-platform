import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default function DashboardProfilePage() {
  return (
    <GenericDashboardPage
      title="Shared profile center"
      description="This route will adapt to the authenticated role and expose profile details, avatar fields, phone information, and role-specific metadata."
    />
  );
}
