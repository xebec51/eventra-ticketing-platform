import { EmptyState } from "@/components/eventra/empty-state";
import { StatCard } from "@/components/eventra/stat-card";
import { TicketCard } from "@/components/eventra/ticket-card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UserTicketsPage() {
  const user = await requireRole("USER");
  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          city: true,
          locationName: true,
          startDatetime: true,
        },
      },
      ticketType: {
        select: { name: true },
      },
    },
    orderBy: [{ event: { startDatetime: "asc" } }, { createdAt: "desc" }],
  });

  const validTickets = tickets.filter((ticket) => ticket.status === "VALID").length;
  const usedTickets = tickets.filter((ticket) => ticket.status === "USED").length;
  const uniqueEvents = new Set(tickets.map((ticket) => ticket.event.id)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Total tickets" value={String(tickets.length)} change="Generated after approval only" />
        <StatCard label="Ready to use" value={String(validTickets)} change="Valid QR tickets" tone="success" />
        <StatCard label="Already checked in" value={String(usedTickets)} change="Used at venue" />
        <StatCard label="Event access" value={String(uniqueEvents)} change="Distinct events in your wallet" tone="warning" />
      </div>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <EmptyState
            title="No tickets issued yet"
            description="Tickets appear here only after your booking has been approved."
          />
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticketCode={ticket.ticketCode}
              qrPayload={ticket.qrPayload}
              status={ticket.status}
              eventTitle={ticket.event.title}
              eventCity={ticket.event.city}
              eventVenue={ticket.event.locationName}
              eventStart={ticket.event.startDatetime}
              ticketTypeName={ticket.ticketType.name}
              checkedInAt={ticket.checkedInAt}
            />
          ))
        )}
      </div>
    </div>
  );
}
