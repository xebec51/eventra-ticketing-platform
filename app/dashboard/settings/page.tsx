import { Code2, ExternalLink, Mail } from "lucide-react";
import type { ReactNode } from "react";

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
            body={`${user.name} - ${user.email}`}
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

      <Card className="overflow-hidden border border-black/5 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/75">
              {t("developer.portfolioProject")}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold">
              {t("footer.developer")}: Muh. Rinaldi Ruslan
            </h2>
            <p className="mt-2 text-sm text-white/65">{t("developer.role")}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
              {t("developer.portfolioDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeveloperLink
              href="https://github.com/xebec51"
              label={t("developer.github")}
              icon={<Code2 className="size-4" />}
            />
            <DeveloperLink
              href="https://www.linkedin.com/in/rinaldiruslan"
              label={t("developer.linkedin")}
              icon={<ExternalLink className="size-4" />}
            />
            <DeveloperLink
              href="mailto:rinaldi.ruslan51@gmail.com"
              label={t("developer.email")}
              icon={<Mail className="size-4" />}
            />
          </div>
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

function DeveloperLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  const external = !href.startsWith("mailto:");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-amber-200/30 hover:bg-amber-200/10 hover:text-amber-100"
    >
      {icon}
      {label}
    </a>
  );
}
