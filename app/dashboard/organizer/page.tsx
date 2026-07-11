import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateBookingStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export default async function OrganizerDashboardPage() {
  const user = await requireRole("ORGANIZER");
  const { locale, t } = await getServerTranslator();
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) notFound();

  const [activeEvents, pendingBookings, waitingPayments, validTickets, upcomingEvents, recentBookings] =
    await Promise.all([
      prisma.event.count({ where: { organizerProfileId: organizerProfile.id, status: "PUBLISHED" } }),
      prisma.booking.count({ where: { event: { organizerProfileId: organizerProfile.id }, status: "PENDING" } }),
      prisma.booking.count({ where: { event: { organizerProfileId: organizerProfile.id }, paymentStatus: "WAITING_CONFIRMATION" } }),
      prisma.ticket.count({ where: { event: { organizerProfileId: organizerProfile.id }, status: "VALID" } }),
      prisma.event.findMany({
        where: { organizerProfileId: organizerProfile.id, startDatetime: { gt: new Date() } },
        select: { id: true, title: true, startDatetime: true, city: true },
        orderBy: { startDatetime: "asc" },
        take: 4,
      }),
      prisma.booking.findMany({
        where: { event: { organizerProfileId: organizerProfile.id } },
        select: {
          id: true,
          bookingCode: true,
          status: true,
          totalAmount: true,
          user: { select: { name: true } },
          event: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader><CardTitle className="text-lg">{t("nav.overview")}</CardTitle></CardHeader>
        <CardContent className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label={t("dashboard.stats.myEvents")} value={activeEvents} />
          <Metric label={t("dashboard.stats.pendingBookings")} value={pendingBookings} warning />
          <Metric label={t("dashboard.stats.waitingPaymentReview")} value={waitingPayments} warning />
          <Metric label={t("nav.tickets")} value={validTickets} />
        </CardContent>
      </Card>

      <div className="grid gap-8 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("dashboard.statChanges.upcomingEvents", { count: upcomingEvents.length })}</CardTitle>
            <Link href="/dashboard/organizer/events" className="text-sm font-medium text-slate-600">{t("common.viewAll")}</Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/dashboard/organizer/events/${event.id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{event.city} · {formatDateTime(event.startDatetime, locale)}</p>
                </div>
                <ArrowRight className="size-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader><CardTitle className="text-lg">{t("dashboard.organizer.recentBookings")}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{booking.event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.user.name} · {formatCurrency(booking.totalAmount.toNumber(), locale)}</p>
                </div>
                <StatusBadge label={translateBookingStatus(booking.status, locale)} tone={booking.status === "APPROVED" ? "success" : "warning"} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return <div><p className="text-sm text-slate-500">{label}</p><p className={warning && value > 0 ? "mt-2 text-3xl font-semibold text-amber-700" : "mt-2 text-3xl font-semibold text-slate-950"}>{value}</p></div>;
}
