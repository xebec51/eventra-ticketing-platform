import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prettyLabel } from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function AdminActivityLogsPage() {
  await requireRole("ADMIN");
  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Activity logs</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Audit trail for approvals, payment reviews, booking decisions,
          check-ins, and content moderation actions across Eventra.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-3xl border border-black/5 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={prettyLabel(log.module)} tone="default" />
                  <StatusBadge label={prettyLabel(log.action)} tone="muted" />
                </div>
                <p className="text-sm leading-6 text-slate-950">{log.description}</p>
                <p className="text-xs text-muted-foreground">
                  {log.user?.name ?? "System"} • {log.user?.email ?? "No email"} •{" "}
                  {formatDateTime(log.createdAt)}
                </p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {log.ipAddress ?? "No IP"}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
