import { OrganizerProfileForm } from "@/components/eventra/organizer-profile-form";
import { UserProfileForm } from "@/components/eventra/user-profile-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function OrganizerProfilePage() {
  const sessionUser = await requireRole("ORGANIZER");
  const [user, organizerProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
      },
    }),
    prisma.organizerProfile.findUnique({
      where: { userId: sessionUser.id },
      include: {
        approver: {
          select: { name: true },
        },
      },
    }),
  ]);

  if (!user || !organizerProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={sessionUser.status} tone="warning" />
            {organizerProfile.approvedAt ? (
              <StatusBadge
                label={`Approved ${formatDateTime(organizerProfile.approvedAt)}`}
                tone="success"
              />
            ) : null}
          </div>
          <CardTitle className="mt-2 font-heading text-2xl">
            Organizer profile
          </CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Manage your public organization identity, internal contact details,
            and approval metadata from one place.
          </p>
        </CardHeader>
        <CardContent>
          <OrganizerProfileForm initialValues={organizerProfile} />
        </CardContent>
      </Card>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Account owner</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm initialValues={user} />
          {organizerProfile.rejectionReason ? (
            <p className="mt-4 text-sm text-rose-700">
              Latest rejection reason: {organizerProfile.rejectionReason}
            </p>
          ) : null}
          {organizerProfile.approver?.name ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Approved by {organizerProfile.approver.name}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
