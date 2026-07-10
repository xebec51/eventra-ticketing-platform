import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";

export default async function DashboardSettingsPage() {
  const user = await requireSessionUser();

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Workspace settings</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Eventra keeps session control deliberately simple in this portfolio
            build: auth is credentials-based, role routing is enforced by proxy,
            and sensitive environment variables stay server-side only.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SettingCard
            title="Current account"
            body={`${user.name} • ${user.email}`}
          />
          <SettingCard
            title="Role enforcement"
            body={`${user.role} routes are protected before render.`}
          />
          <SettingCard
            title="Session model"
            body="JWT session strategy via NextAuth/Auth.js credentials."
          />
          <SettingCard
            title="Secrets"
            body="DATABASE_URL and auth secrets remain outside git and are read only on the server."
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
