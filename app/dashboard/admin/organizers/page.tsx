import {
  approveOrganizerAction,
  rejectOrganizerAction,
} from "@/app/actions/accounts";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

const ORGANIZER_TABLE_LIMIT = 75;

export default async function AdminOrganizersPage() {
  await requireRole("ADMIN");
  const organizers = await prisma.organizerProfile.findMany({
    take: ORGANIZER_TABLE_LIMIT,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
      approver: {
        select: { name: true },
      },
      _count: {
        select: { events: true },
      },
    },
    orderBy: [{ user: { status: "asc" } }, { createdAt: "desc" }],
  });

  const pendingCount = organizers.filter(
    (profile) => profile.user.status === "PENDING"
  ).length;
  const activeCount = organizers.filter(
    (profile) => profile.user.status === "ACTIVE"
  ).length;
  const rejectedCount = organizers.filter(
    (profile) => profile.user.status === "REJECTED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Organizer applications" value={String(organizers.length)} change="Total organizer profiles" />
        <StatCard label="Pending approval" value={String(pendingCount)} change="Needs admin review" tone="warning" />
        <StatCard label="Active organizers" value={String(activeCount)} change="Approved and publishing-ready" tone="success" />
        <StatCard label="Rejected" value={String(rejectedCount)} change="Retained for audit trail" tone="danger" />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Organizer approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizers.map((profile) => (
            <div
              key={profile.id}
              className="grid gap-4 rounded-3xl border border-black/5 bg-slate-50 p-5 xl:grid-cols-[1.15fr_0.85fr]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={profile.user.status}
                    tone={
                      profile.user.status === "ACTIVE"
                        ? "success"
                        : profile.user.status === "PENDING"
                          ? "warning"
                          : "danger"
                    }
                  />
                  <StatusBadge label={`${profile._count.events} events`} tone="muted" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {profile.organizationName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.user.name} • {profile.user.email}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCell label="Submitted" value={formatDateTime(profile.createdAt)} />
                  <InfoCell
                    label="Approved by"
                    value={profile.approver?.name ?? "Not approved yet"}
                  />
                  <InfoCell label="Website" value={profile.websiteUrl ?? "Not provided"} />
                  <InfoCell label="Phone" value={profile.phone ?? "Not provided"} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {profile.description || "No organizer description provided yet."}
                </p>
                {profile.rejectionReason ? (
                  <p className="text-sm text-rose-700">
                    Rejection reason: {profile.rejectionReason}
                  </p>
                ) : null}
              </div>
              <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-4">
                <form action={approveOrganizerAction}>
                  <input
                    type="hidden"
                    name="organizerProfileId"
                    value={profile.id}
                  />
                  <Button type="submit" className="w-full">
                    Approve organizer
                  </Button>
                </form>
                <form action={rejectOrganizerAction} className="space-y-3">
                  <input
                    type="hidden"
                    name="organizerProfileId"
                    value={profile.id}
                  />
                  <textarea
                    name="rejectionReason"
                    className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
                    placeholder="Reason for rejection"
                  />
                  <Button type="submit" variant="destructive" className="w-full">
                    Reject organizer
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950 break-all">{value}</p>
    </div>
  );
}
