import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";
import { translateRole } from "@/lib/i18n/status";

export default async function DashboardSettingsPage() {
  const user = await requireSessionUser();
  const { locale, t } = await getServerTranslator();

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("dashboard.workspaceSettings")}
          </CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("dashboard.settingsDescription")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SettingCard
            title={t("dashboard.currentAccount")}
            body={`${user.name} • ${user.email}`}
          />
          <SettingCard
            title={t("dashboard.roleEnforcement")}
            body={t("dashboard.roleEnforcementDescription", {
              role: translateRole(user.role, locale),
            })}
          />
          <SettingCard
            title={t("dashboard.sessionModel")}
            body={t("dashboard.sessionModelDescription")}
          />
          <SettingCard
            title={t("dashboard.secrets")}
            body={t("dashboard.secretsDescription")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-slate-50 p-5">
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
