import Link from "next/link";

import { UserProfileForm } from "@/components/eventra/user-profile-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateRole, translateUserStatus } from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DashboardProfilePage() {
  const sessionUser = await requireSessionUser();
  const { locale, t } = await getServerTranslator();
  const profileHref =
    sessionUser.role === "USER"
      ? "/dashboard/user/profile"
      : sessionUser.role === "ORGANIZER"
        ? "/dashboard/organizer/profile"
        : "/dashboard/profile";
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={translateRole(sessionUser.role, locale)} tone="default" />
            <StatusBadge label={translateUserStatus(sessionUser.status, locale)} tone="warning" />
          </div>
          <CardTitle className="mt-2 font-heading text-2xl">
            {t("dashboard.sharedProfileCenter")}
          </CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("dashboard.sharedProfileDescription")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-black/5 bg-slate-50 p-5">
            <p className="font-semibold text-slate-950">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          {sessionUser.role === "ADMIN" ? (
            <UserProfileForm initialValues={user} />
          ) : (
            <Link
              href={profileHref}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {t("dashboard.openRoleProfile")}
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
