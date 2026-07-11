import { notFound } from "next/navigation";

import { CheckInForm } from "@/components/eventra/check-in-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateTicketStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export default async function OrganizerCheckInPage() {
  const user = await requireRole("ORGANIZER");
  const { locale, t } = await getServerTranslator();
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) notFound();

  const tickets = await prisma.ticket.findMany({
    where: { event: { organizerProfileId: organizerProfile.id } },
    select: {
      id: true,
      ticketCode: true,
      status: true,
      event: { select: { title: true } },
      user: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  const readyCount = tickets.filter((ticket) => ticket.status === "VALID").length;
  const usedCount = tickets.filter((ticket) => ticket.status === "USED").length;

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{t("checkInDesk.title")}</CardTitle>
          <p className="text-sm leading-6 text-slate-500">{t("checkInDesk.description")}</p>
        </CardHeader>
        <CardContent><CheckInForm /></CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{t("checkInDesk.recentActivity")}</CardTitle>
          <p className="text-sm text-slate-500">
            {t("checkInDesk.summary", { ready: readyCount, used: usedCount })}
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-950">{ticket.event.title}</p>
                <p className="mt-1 text-sm text-slate-500">{ticket.user.name} · {ticket.ticketCode}</p>
              </div>
              <StatusBadge
                label={translateTicketStatus(ticket.status, locale)}
                tone={ticket.status === "VALID" ? "success" : "default"}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
