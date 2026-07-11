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
import { getServerTranslator } from "@/lib/i18n/server";
import { translateBookingStatus, translatePaymentStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const { locale, t } = await getServerTranslator();

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
        <StatCard
          label={t("dashboard.stats.totalEvents")}
          value={formatCompactNumber(totalEvents, locale)}
          change={t("dashboard.statChanges.allPlatformEvents")}
        />
        <StatCard
          label={t("dashboard.stats.activeOrganizers")}
          value={String(activeOrganizers)}
          change={t("dashboard.statChanges.pendingApprovals", {
            count: pendingOrganizers,
          })}
          tone="success"
        />
        <StatCard
          label={t("dashboard.stats.totalBookings")}
          value={formatCompactNumber(totalBookings, locale)}
          change={t("dashboard.statChanges.paidBookings", {
            count: paidBookings,
          })}
          tone="warning"
        />
        <StatCard
          label={t("dashboard.stats.revenue")}
          value={formatCurrency(totalRevenue, locale)}
          change={t("dashboard.statChanges.paidBookingsOnly")}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title={t("dashboard.admin.bookingDistribution")}
          description={t("dashboard.admin.bookingDistributionDescription")}
          data={bookingDistribution}
        />
        <StatusPieChart
          title={t("dashboard.admin.paymentDistribution")}
          description={t("dashboard.admin.paymentDistributionDescription")}
          data={paymentDistribution}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricBarChart
          title={t("dashboard.admin.topEventsByRevenue")}
          description={t("dashboard.admin.topEventsByRevenueDescription")}
          data={topEventsByRevenue}
        />
        <MetricBarChart
          title={t("dashboard.admin.topCategories")}
          description={t("dashboard.admin.topCategoriesDescription")}
          data={topCategories}
        />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("dashboard.admin.recentActivity")}
          </CardTitle>
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
                  {log.user?.name ?? t("dashboard.admin.system")} •{" "}
                  {log.createdAt.toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
