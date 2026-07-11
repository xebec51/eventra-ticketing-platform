import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/eventra/login-form";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectAuthenticatedUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function LoginPage() {
  await redirectAuthenticatedUser();
  const { t } = await getServerTranslator();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="overflow-hidden rounded-2xl border border-black/5 bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.28)]">
            <CardContent className="space-y-6 p-8 lg:p-10">
              <StatusBadge label={t("auth.secureAccess")} tone="warning" />
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                {t("auth.loginTitle")}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {t("auth.loginDescription")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureMessage
                  title={t("auth.fastCredentialsLogin")}
                  description={t("auth.fastCredentialsLoginDescription")}
                />
                <FeatureMessage
                  title={t("auth.protectedRoutes")}
                  description={t("auth.protectedRoutesDescription")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="eventra-panel rounded-2xl">
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <LockKeyhole className="size-5" />
              </div>
              <CardTitle className="pt-3 font-heading text-3xl">
                {t("auth.welcomeBack")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <LoginForm />
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {t("auth.demoAccounts")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("auth.needAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-slate-950 underline-offset-4 hover:underline"
                >
                  {t("auth.registerAsAttendee")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}

function FeatureMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-5">
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
    </div>
  );
}
