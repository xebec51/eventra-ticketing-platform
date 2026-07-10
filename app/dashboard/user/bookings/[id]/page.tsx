import { GenericDashboardPage } from "@/components/eventra/dashboard-templates";

export default async function UserBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <GenericDashboardPage
      title={`Booking detail ${id}`}
      description="Final booking detail will summarize ticket quantities, payment proof history, deadlines, approval actions, and ticket issuance state."
    />
  );
}
