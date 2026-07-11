import Link from "next/link";

import { StatusPieChart } from "@/components/eventra/analytics-charts";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOOKING_STATUS_ORDER,
  TICKET_STATUS_ORDER,
  buildDistribution,
  toCountRecord,
} from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  translateBookingStatus,
  translatePaymentStatus,
  translateTicketStatus,
} from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function UserDashboardPage() {
  const user = await requireRole("USER");
  const { locale, t } = await getServerTranslator();
  const [
    bookingGroups,
    ticketGroups,
    activeBookings,
    waitingPayments,
    favoriteEvents,
    reviewCount,
    recentBookings,
    tickets,
  ] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
    prisma.booking.count({
      where: { userId: user.id, status: { in: ["PENDING", "APPROVED"] } },
    }),
    prisma.booking.count({
      where: { userId: user.id, paymentStatus: "WAITING_CONFIRMATION" },
    }),
    prisma.favoriteEvent.count({ where: { userId: user.id } }),
    prisma.eventReview.count({ where: { userId: user.id } }),
    prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: { title: true, startDatetime: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const usedTickets = tickets.filter((ticket) => ticket.status === "USED").length;
  const bookingDistribution = buildDistribution(
    BOOKING_STATUS_ORDER,
    toCountRecord(bookingGroups, "status")
  ).map((item) => ({
    ...item,
    label: translateBookingStatus(item.label as never, locale),
  }));
  const ticketDistribution = buildDistribution(
    TICKET_STATUS_ORDER,
    toCountRecord(ticketGroups, "status")
  ).map((item) => ({
    ...item,
    label: translateTicketStatus(item.label as never, locale),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.stats.activeBookings")}
          value={String(activeBookings)}
          change={t("dashboard.statChanges.pendingOrApproved")}
        />
        <StatCard
          label={t("dashboard.stats.waitingPaymentReview")}
          value={String(waitingPayments)}
          change={t("dashboard.statChanges.proofUploaded")}
          tone="warning"
        />
        <StatCard
          label={t("dashboard.stats.favoriteEvents")}
          value={String(favoriteEvents)}
          change={t("dashboard.statChanges.reviewsSubmitted", { count: reviewCount })}
          tone="success"
        />
        <StatCard
          label={t("dashboard.stats.attendedEvents")}
          value={String(usedTickets)}
          change={t("dashboard.statChanges.usedTickets")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title={t("dashboard.user.bookingSnapshot")}
          description={t("dashboard.user.bookingSnapshotDescription")}
          data={bookingDistribution}
        />
        <StatusPieChart
          title={t("dashboard.user.ticketSnapshot")}
          description={t("dashboard.user.ticketSnapshotDescription")}
          data={ticketDistribution}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border border-black/5 bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-heading text-2xl">
              {t("dashboard.user.recentBookings")}
            </CardTitle>
            <Link
              href="/dashboard/user/bookings"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              {t("common.viewAll")}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={translateBookingStatus(booking.status, locale)} tone="warning" />
                  <StatusBadge label={translatePaymentStatus(booking.paymentStatus, locale)} tone="muted" />
                </div>
                <p className="mt-3 font-semibold text-slate-950">
                  {booking.event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.bookingCode} • {formatDateTime(booking.createdAt, locale)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-black/5 bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-heading text-2xl">
              {t("dashboard.user.recentTickets")}
            </CardTitle>
            <Link
              href="/dashboard/user/tickets"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              {t("dashboard.user.openWallet")}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={translateTicketStatus(ticket.status, locale)}
                    tone={ticket.status === "VALID" ? "success" : "default"}
                  />
                  <StatusBadge label={ticket.ticketCode} tone="muted" />
                </div>
                <p className="mt-3 font-semibold text-slate-950">
                  {ticket.event.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(ticket.event.startDatetime, locale)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
