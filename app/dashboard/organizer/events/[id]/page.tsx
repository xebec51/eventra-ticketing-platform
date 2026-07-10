import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default async function OrganizerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <GenericDashboardPage
      title={`Event workspace ${id}`}
      description="This event-level route will host event editing, ticket type management, attendee metrics, and publishing controls."
    />
  );
}
