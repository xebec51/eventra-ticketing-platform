import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default function AdminPaymentsPage() {
  return (
    <GenericDashboardPage
      title="Payment verification"
      description="Manual payment proof review, failure reasons, verification audit fields, and approval triggers will be surfaced here."
    />
  );
}
