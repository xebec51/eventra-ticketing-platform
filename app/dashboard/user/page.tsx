import Link from "next/link";

import { EmptyState } from "@/components/eventra/empty-state";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateBookingStatus, translatePaymentStatus, translateTicketStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function UserDashboardPage() {
  const user = await requireRole("USER");
  const { locale, t } = await getServerTranslator();
  const [activeBookings, waitingPayments, favoriteEvents, recentBookings, tickets] = await Promise.all([
    prisma.booking.count({ where: { userId: user.id, status: { in: ["PENDING", "APPROVED"] } } }),
    prisma.booking.count({ where: { userId: user.id, paymentStatus: "WAITING_CONFIRMATION" } }),
    prisma.favoriteEvent.count({ where: { userId: user.id } }),
    prisma.booking.findMany({
      where: { userId: user.id },
      select: { id: true, bookingCode: true, status: true, paymentStatus: true, createdAt: true, event: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.ticket.findMany({
      where: { userId: user.id, status: "VALID" },
      select: { id: true, ticketCode: true, status: true, event: { select: { title: true, startDatetime: true } } },
      orderBy: { event: { startDatetime: "asc" } },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader><CardTitle className="text-lg">{t("nav.overview")}</CardTitle></CardHeader>
        <CardContent className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-3">
          <Metric label={t("dashboard.stats.activeBookings")} value={activeBookings} />
          <Metric label={t("dashboard.stats.waitingPaymentReview")} value={waitingPayments} warning />
          <Metric label={t("dashboard.stats.favoriteEvents")} value={favoriteEvents} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg">{t("dashboard.user.recentTickets")}</CardTitle>
          <Link href="/dashboard/user/tickets" className={cn(buttonVariants({ size: "sm" }))}>{t("dashboard.user.openWallet")}</Link>
        </CardHeader>
        <CardContent>
          {tickets.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border-l-2 border-amber-500 bg-slate-50 p-4">
                  <StatusBadge label={translateTicketStatus(ticket.status, locale)} tone="success" />
                  <p className="mt-4 font-medium text-slate-950">{ticket.event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(ticket.event.startDatetime, locale)}</p>
                  <p className="mt-4 font-mono text-xs text-slate-500">{ticket.ticketCode}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t("dashboard.user.recentTickets")} description={t("dashboard.user.ticketSnapshotDescription")} />
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg">{t("dashboard.user.recentBookings")}</CardTitle>
          <Link href="/dashboard/user/bookings" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>{t("common.viewAll")}</Link>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium text-slate-950">{booking.event.title}</p>
                <p className="mt-1 text-sm text-slate-500">{booking.bookingCode} · {formatDateTime(booking.createdAt, locale)}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge label={translateBookingStatus(booking.status, locale)} tone={booking.status === "APPROVED" ? "success" : "warning"} />
                <StatusBadge label={translatePaymentStatus(booking.paymentStatus, locale)} tone="muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return <div><p className="text-sm text-slate-500">{label}</p><p className={warning && value > 0 ? "mt-2 text-3xl font-semibold text-amber-700" : "mt-2 text-3xl font-semibold text-slate-950"}>{value}</p></div>;
}
