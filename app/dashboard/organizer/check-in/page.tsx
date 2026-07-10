import { notFound } from "next/navigation";

import { CheckInForm } from "@/components/eventra/check-in-form";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrganizerCheckInPage() {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      event: {
        organizerProfileId: organizerProfile.id,
      },
    },
    include: {
      event: {
        select: { title: true },
      },
      user: {
        select: { name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  const usedTickets = tickets.filter((ticket) => ticket.status === "USED").length;
  const validTickets = tickets.filter((ticket) => ticket.status === "VALID").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Recent ticket records" value={String(tickets.length)} change="Last 8 scoped tickets" />
        <StatCard label="Ready to scan" value={String(validTickets)} change="Still valid for entry" tone="success" />
        <StatCard label="Already checked in" value={String(usedTickets)} change="Duplicate protection active" />
        <StatCard label="Scope" value="Organizer only" change="Cross-event access blocked" tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Check-in desk</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the ticket code manually from the attendee device or printed
              confirmation to mark the ticket as used.
            </p>
          </CardHeader>
          <CardContent>
            <CheckInForm />
          </CardContent>
        </Card>

        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Recent ticket activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={ticket.status}
                    tone={ticket.status === "VALID" ? "success" : "default"}
                  />
                  <StatusBadge label={ticket.ticketCode} tone="muted" />
                </div>
                <p className="mt-3 font-semibold text-slate-950">
                  {ticket.event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Attendee: {ticket.user.name}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
