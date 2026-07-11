import { notFound } from "next/navigation";

import { MetricBarChart, StatusPieChart } from "@/components/eventra/analytics-charts";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOOKING_STATUS_ORDER,
  PAYMENT_STATUS_ORDER,
  buildDistribution,
  toCountRecord,
} from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateBookingStatus, translatePaymentStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export default async function OrganizerDashboardPage() {
  const user = await requireRole("ORGANIZER");
  const { locale, t } = await getServerTranslator();
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const [
    totalEvents,
    upcomingEvents,
    bookingGroups,
    paymentGroups,
    ticketCount,
    usedTicketCount,
    pendingBookings,
    waitingConfirmations,
    revenueAggregate,
    ratingAggregate,
    recentBookings,
    topTicketTypeGroups,
    topEventRevenueGroups,
  ] = await Promise.all([
    prisma.event.count({
      where: { organizerProfileId: organizerProfile.id },
    }),
    prisma.event.count({
      where: {
        organizerProfileId: organizerProfile.id,
        startDatetime: { gt: new Date() },
      },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["paymentStatus"],
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
      _count: { _all: true },
    }),
    prisma.ticket.count({
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
    }),
    prisma.ticket.count({
      where: {
        event: { organizerProfileId: organizerProfile.id },
        status: "USED",
      },
    }),
    prisma.booking.count({
      where: {
        event: { organizerProfileId: organizerProfile.id },
        status: "PENDING",
      },
    }),
    prisma.booking.count({
      where: {
        event: { organizerProfileId: organizerProfile.id },
        paymentStatus: "WAITING_CONFIRMATION",
      },
    }),
    prisma.booking.aggregate({
      where: {
        event: { organizerProfileId: organizerProfile.id },
        paymentStatus: "PAID",
      },
      _sum: { totalAmount: true },
    }),
    prisma.eventReview.aggregate({
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
      _avg: { rating: true },
    }),
    prisma.booking.findMany({
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
      include: {
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.ticket.groupBy({
      by: ["ticketTypeId"],
      where: {
        event: { organizerProfileId: organizerProfile.id },
      },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["eventId"],
      where: {
        event: { organizerProfileId: organizerProfile.id },
        paymentStatus: "PAID",
      },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 5,
    }),
  ]);

  const sortedTicketTypeGroups = [...topTicketTypeGroups]
    .sort((left, right) => right._count._all - left._count._all)
    .slice(0, 5);
  const topTicketTypeIds = sortedTicketTypeGroups.map((group) => group.ticketTypeId);
  const topEventIds = topEventRevenueGroups.map((group) => group.eventId);
  const [ticketTypes, events] = await Promise.all([
    prisma.ticketType.findMany({
      where: { id: { in: topTicketTypeIds } },
      select: { id: true, name: true },
    }),
    prisma.event.findMany({
      where: { id: { in: topEventIds } },
      select: { id: true, title: true },
    }),
  ]);
  const ticketTypeNameMap = new Map(ticketTypes.map((type) => [type.id, type.name]));
  const eventTitleMap = new Map(events.map((event) => [event.id, event.title]));
  const checkInRate = ticketCount ? Math.round((usedTicketCount / ticketCount) * 100) : 0;
  const bookingDistribution = buildDistribution(
    BOOKING_STATUS_ORDER,
    toCountRecord(bookingGroups, "status")
  ).map((item) => ({
    ...item,
    label: translateBookingStatus(item.label as never, locale),
  }));
  const paymentDistribution = buildDistribution(
    PAYMENT_STATUS_ORDER,
    toCountRecord(paymentGroups, "paymentStatus")
  ).map((item) => ({
    ...item,
    label: translatePaymentStatus(item.label as never, locale),
  }));
  const topTicketTypes = sortedTicketTypeGroups.map((group) => ({
    label: ticketTypeNameMap.get(group.ticketTypeId) ?? group.ticketTypeId,
    value: group._count._all,
  }));
  const topEventsByRevenue = topEventRevenueGroups.map((group) => ({
    label: eventTitleMap.get(group.eventId) ?? group.eventId,
    value: Number(group._sum.totalAmount?.toString() ?? 0),
  }));
  const revenue = Number(revenueAggregate._sum.totalAmount?.toString() ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.stats.myEvents")}
          value={String(totalEvents)}
          change={t("dashboard.statChanges.upcomingEvents", { count: upcomingEvents })}
        />
        <StatCard
          label={t("dashboard.stats.pendingBookings")}
          value={String(pendingBookings)}
          change={t("dashboard.statChanges.waitingConfirmations", {
            count: waitingConfirmations,
          })}
          tone="warning"
        />
        <StatCard
          label={t("dashboard.stats.ticketsSold")}
          value={String(ticketCount)}
          change={t("dashboard.statChanges.checkInRate", { rate: checkInRate })}
          tone="success"
        />
        <StatCard
          label={t("dashboard.stats.revenue")}
          value={formatCurrency(revenue, locale)}
          change={t("dashboard.statChanges.averageRating", {
            rating: (ratingAggregate._avg.rating ?? 0).toFixed(1),
          })}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title={t("dashboard.organizer.bookingDistribution")}
          description={t("dashboard.organizer.bookingDistributionDescription")}
          data={bookingDistribution}
        />
        <StatusPieChart
          title={t("dashboard.organizer.paymentDistribution")}
          description={t("dashboard.organizer.paymentDistributionDescription")}
          data={paymentDistribution}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricBarChart
          title={t("dashboard.organizer.topTicketTypes")}
          description={t("dashboard.organizer.topTicketTypesDescription")}
          data={topTicketTypes}
        />
        <MetricBarChart
          title={t("dashboard.organizer.revenueByEvent")}
          description={t("dashboard.organizer.revenueByEventDescription")}
          data={topEventsByRevenue}
        />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("dashboard.organizer.recentBookings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={translateBookingStatus(booking.status, locale)}
                    tone="warning"
                  />
                  <StatusBadge label={booking.bookingCode} tone="muted" />
                </div>
                <p className="mt-3 font-semibold text-slate-950">
                  {booking.event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.user.name} • {formatCurrency(booking.totalAmount.toNumber(), locale)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
