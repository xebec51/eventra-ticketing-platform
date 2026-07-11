import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCompactNumber } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const { locale, t } = await getServerTranslator();
  const [totalEvents, pendingOrganizers, pendingPayments, upcomingEvents, recentLogs] =
    await Promise.all([
      prisma.event.count(),
      prisma.user.count({ where: { role: "ORGANIZER", status: "PENDING" } }),
      prisma.booking.count({ where: { paymentStatus: "WAITING_CONFIRMATION" } }),
      prisma.event.count({
        where: { status: "PUBLISHED", startDatetime: { gt: new Date() } },
      }),
      prisma.activityLog.findMany({
        select: {
          id: true,
          action: true,
          module: true,
          description: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div className="space-y-8">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">{t("nav.overview")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label={t("dashboard.stats.totalEvents")} value={formatCompactNumber(totalEvents, locale)} />
          <Metric label={t("nav.organizers")} value={String(pendingOrganizers)} emphasis={pendingOrganizers > 0} />
          <Metric label={t("nav.payments")} value={String(pendingPayments)} emphasis={pendingPayments > 0} />
          <Metric label={t("nav.events")} value={String(upcomingEvents)} />
        </CardContent>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.statChanges.pendingApprovals", { count: pendingOrganizers + pendingPayments })}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            <PriorityLink href="/dashboard/admin/organizers" label={t("nav.organizers")} count={pendingOrganizers} />
            <PriorityLink href="/dashboard/admin/payments" label={t("nav.payments")} count={pendingPayments} />
            <PriorityLink href="/dashboard/admin/events" label={t("nav.events")} count={upcomingEvents} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.admin.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-900">{log.description}</p>
                  <span className="shrink-0 text-xs text-slate-500">{log.module}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {log.user?.name ?? t("dashboard.admin.system")} · {log.createdAt.toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={emphasis ? "mt-2 text-3xl font-semibold text-amber-700" : "mt-2 text-3xl font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

function PriorityLink({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{count}</p>
      </div>
      <ArrowRight className="size-4 text-slate-400" />
    </Link>
  );
}
