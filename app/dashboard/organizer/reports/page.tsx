import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricBarChart, StatusPieChart } from "@/components/eventra/analytics-charts";
import { StatCard } from "@/components/eventra/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOOKING_STATUS_ORDER,
  PAYMENT_STATUS_ORDER,
  buildDistribution,
  toCountRecord,
} from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function OrganizerReportsPage() {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const [bookingGroups, paymentGroups, ticketGroups, topEvents, recentEvents] =
    await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        where: { event: { organizerProfileId: organizerProfile.id } },
        _count: { _all: true },
      }),
      prisma.booking.groupBy({
        by: ["paymentStatus"],
        where: { event: { organizerProfileId: organizerProfile.id } },
        _count: { _all: true },
      }),
      prisma.ticket.groupBy({
        by: ["ticketTypeId"],
        where: { event: { organizerProfileId: organizerProfile.id } },
        _count: { _all: true },
      }),
      prisma.event.findMany({
        where: { organizerProfileId: organizerProfile.id },
        include: {
          bookings: {
            where: { paymentStatus: "PAID" },
            select: { totalAmount: true },
          },
        },
      }),
      prisma.event.findMany({
        where: { organizerProfileId: organizerProfile.id },
        include: {
          _count: {
            select: { bookings: true, tickets: true },
          },
        },
        orderBy: { startDatetime: "desc" },
        take: 6,
      }),
    ]);

  const sortedTicketGroups = [...ticketGroups]
    .sort((left, right) => right._count._all - left._count._all)
    .slice(0, 5);
  const ticketTypeIds = sortedTicketGroups.map((group) => group.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: ticketTypeIds } },
    select: { id: true, name: true },
  });
  const ticketTypeNameMap = new Map(ticketTypes.map((type) => [type.id, type.name]));
  const bookingDistribution = buildDistribution(
    BOOKING_STATUS_ORDER,
    toCountRecord(bookingGroups, "status")
  );
  const paymentDistribution = buildDistribution(
    PAYMENT_STATUS_ORDER,
    toCountRecord(paymentGroups, "paymentStatus")
  );
  const topTicketTypeData = sortedTicketGroups.map((group) => ({
    label: ticketTypeNameMap.get(group.ticketTypeId) ?? group.ticketTypeId,
    value: group._count._all,
  }));
  const revenueByEvent = topEvents
    .map((event) => ({
      label: event.title,
      value: event.bookings.reduce(
        (sum, booking) => sum + booking.totalAmount.toNumber(),
        0
      ),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
  const totalEventRevenue = revenueByEvent.reduce((sum, event) => sum + event.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Top event revenue" value={formatCurrency(totalEventRevenue)} change="Across highest-grossing events" tone="success" />
        <StatCard label="Report scope" value="Organizer only" change="Role-safe export boundaries" tone="warning" />
        <StatCard label="Tracked events" value={String(topEvents.length)} change="All events under your profile" />
        <StatCard label="Top ticket tiers" value={String(topTicketTypeData.length)} change="Sales-ranked ticket types" tone="success" />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl">Organizer reports</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Download booking and attendee reports that are automatically scoped
              to events owned by your organizer profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/api/exports/bookings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Export bookings
            </Link>
            <Link href="/api/exports/attendees" className={cn(buttonVariants({}))}>
              Export attendees
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title="Booking report"
          description="Scoped booking status distribution."
          data={bookingDistribution}
        />
        <StatusPieChart
          title="Payment report"
          description="Manual payment states across your own events."
          data={paymentDistribution}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricBarChart
          title="Top ticket type sales"
          description="Issued tickets by organizer-owned ticket tier."
          data={topTicketTypeData}
        />
        <MetricBarChart
          title="Revenue by event"
          description="Paid booking totals per event."
          data={revenueByEvent}
        />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Recent event performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-black/5 bg-slate-50 p-4"
            >
              <p className="font-semibold text-slate-950">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {event._count.bookings} bookings • {event._count.tickets} tickets
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
