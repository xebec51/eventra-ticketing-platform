import { MetricBarChart, StatusPieChart } from "@/components/eventra/analytics-charts";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOOKING_STATUS_ORDER,
  PAYMENT_STATUS_ORDER,
  buildDistribution,
  prettyLabel,
  toCountRecord,
} from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { formatCompactNumber, formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const [
    totalEvents,
    activeOrganizers,
    pendingOrganizers,
    totalBookings,
    paidBookings,
    paidRevenueAggregate,
    bookingGroups,
    paymentGroups,
    recentLogs,
    categoryCounts,
    topEventRevenueGroups,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.user.count({ where: { role: "ORGANIZER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "ORGANIZER", status: "PENDING" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { paymentStatus: "PAID" } }),
    prisma.booking.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["paymentStatus"],
      _count: { _all: true },
    }),
    prisma.activityLog.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.eventCategory.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
    }),
    prisma.booking.groupBy({
      by: ["eventId"],
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
      orderBy: {
        _sum: { totalAmount: "desc" },
      },
      take: 5,
    }),
  ]);

  const topEventIds = topEventRevenueGroups.map((group) => group.eventId);
  const topEvents = await prisma.event.findMany({
    where: { id: { in: topEventIds } },
    select: { id: true, title: true },
  });
  const eventTitleMap = new Map(topEvents.map((event) => [event.id, event.title]));

  const bookingDistribution = buildDistribution(
    BOOKING_STATUS_ORDER,
    toCountRecord(bookingGroups, "status")
  );
  const paymentDistribution = buildDistribution(
    PAYMENT_STATUS_ORDER,
    toCountRecord(paymentGroups, "paymentStatus")
  );
  const topEventsByRevenue = topEventRevenueGroups.map((group) => ({
    label: eventTitleMap.get(group.eventId) ?? group.eventId,
    value: Number(group._sum.totalAmount?.toString() ?? 0),
  }));
  const topCategories = [...categoryCounts]
    .sort((left, right) => right._count.events - left._count.events)
    .slice(0, 5)
    .map((category) => ({
      label: category.name,
      value: category._count.events,
    }));
  const totalRevenue = Number(paidRevenueAggregate._sum.totalAmount?.toString() ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Total events" value={formatCompactNumber(totalEvents)} change="All platform events" />
        <StatCard label="Active organizers" value={String(activeOrganizers)} change={`${pendingOrganizers} pending approvals`} tone="success" />
        <StatCard label="Total bookings" value={formatCompactNumber(totalBookings)} change={`${paidBookings} paid bookings`} tone="warning" />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} change="Paid bookings only" tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title="Booking status distribution"
          description="Current platform-wide booking state across all events."
          data={bookingDistribution}
        />
        <StatusPieChart
          title="Payment status distribution"
          description="Manual payment progress and automatic booking states."
          data={paymentDistribution}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricBarChart
          title="Top events by paid revenue"
          description="Highest grossing events based on paid bookings."
          data={topEventsByRevenue}
        />
        <MetricBarChart
          title="Top categories"
          description="Event category volume across the platform."
          data={topCategories}
        />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={prettyLabel(log.module)} tone="default" />
                  <StatusBadge label={prettyLabel(log.action)} tone="muted" />
                </div>
                <p className="mt-3 text-sm text-slate-950">{log.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.user?.name ?? "System"} • {log.createdAt.toLocaleString("en-SG")}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
