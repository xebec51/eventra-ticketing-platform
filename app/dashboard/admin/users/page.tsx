import { updateUserStatusAction } from "@/app/actions/accounts";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const admin = await requireRole("ADMIN");
  const users = await prisma.user.findMany({
    include: {
      organizerProfile: {
        select: {
          organizationName: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          tickets: true,
          eventReviews: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">User management</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review account status across admins, organizers, and attendees.
          Organizer approval history still lives in its dedicated queue.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-3xl border border-black/5 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={user.role} tone="default" />
                  <StatusBadge
                    label={user.status}
                    tone={
                      user.status === "ACTIVE"
                        ? "success"
                        : user.status === "PENDING"
                          ? "warning"
                          : user.status === "INACTIVE"
                            ? "muted"
                            : "danger"
                    }
                  />
                  {user.organizerProfile ? (
                    <StatusBadge
                      label={user.organizerProfile.organizationName}
                      tone="muted"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {user.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.email} • Joined {formatDateTime(user.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{user._count.bookings} bookings</span>
                  <span>{user._count.tickets} tickets</span>
                  <span>{user._count.eventReviews} reviews</span>
                </div>
              </div>
              <form action={updateUserStatusAction} className="flex gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="status"
                  defaultValue={user.status}
                  disabled={user.id === admin.id}
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <button
                  type="submit"
                  disabled={user.id === admin.id}
                  className="rounded-lg bg-slate-950 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
