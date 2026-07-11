import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { LoginForm } from "@/components/eventra/login-form";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectAuthenticatedUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function LoginPage() {
  await redirectAuthenticatedUser();
  const { t } = await getServerTranslator();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-amber-700">{t("auth.secureAccess")}</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-slate-950">
            {t("auth.welcomeBack")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t("auth.loginDescription")}
          </p>
        </div>
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <LockKeyhole className="size-4" />
            </div>
            <CardTitle className="sr-only">{t("auth.welcomeBack")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <LoginForm />
            <details className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-900">
                {t("auth.demoAccountsTitle")}
              </summary>
              <p className="mt-2 leading-6">{t("auth.demoAccounts")}</p>
            </details>
            <p className="text-sm text-slate-600">
              {t("auth.needAccount")} {" "}
              <Link href="/register" className="font-medium text-slate-950 underline-offset-4 hover:underline">
                {t("auth.registerAsAttendee")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
