import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default function AdminActivityLogsPage() {
  return (
    <GenericDashboardPage
      title="Activity logs"
      description="Audit actions across organizer approvals, payment verification, booking decisions, and moderation events will be tracked here."
    />
  );
}
