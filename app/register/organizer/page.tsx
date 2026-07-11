import { MarketingShell } from "@/components/eventra/marketing-shell";
import { OrganizerRegisterForm } from "@/components/eventra/organizer-register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectAuthenticatedUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function OrganizerRegistrationPage() {
  await redirectAuthenticatedUser();
  const { t } = await getServerTranslator();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="border border-black/5 bg-slate-950 text-white">
            <CardContent className="space-y-5 p-8">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                {t("auth.organizerTitle")}
              </h1>
              <p className="text-sm leading-7 text-white/75">
                {t("auth.organizerDescription")}
              </p>
              <div className="grid gap-3">
                <Requirement title={t("auth.pendingApprovalPage")} />
                <Requirement title={t("auth.rejectedState")} />
                <Requirement title={t("auth.ownershipProtection")} />
                <Requirement title={t("auth.paymentExportSupport")} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5 bg-white/92">
            <CardHeader>
              <CardTitle className="font-heading text-3xl">
                {t("auth.organizerProfile")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizerRegisterForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}

function Requirement({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/80">
      {title}
    </div>
  );
}
