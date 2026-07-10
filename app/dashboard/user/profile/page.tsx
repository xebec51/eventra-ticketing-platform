import { UserProfileForm } from "@/components/eventra/user-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UserProfilePage() {
  const sessionUser = await requireRole("USER");
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Attendee profile</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keep your contact details current so organizers can verify identity or
          follow up about payment and venue logistics.
        </p>
      </CardHeader>
      <CardContent>
        <UserProfileForm initialValues={user} />
      </CardContent>
    </Card>
  );
}
