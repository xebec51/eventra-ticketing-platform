import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/eventra/login-form";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border border-black/5 bg-slate-950 text-white shadow-[0_28px_100px_rgba(15,23,42,0.28)]">
            <CardContent className="space-y-6 p-8 lg:p-10">
              <StatusBadge label="Secure access" tone="warning" />
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                Sign in to manage bookings, approvals, and QR tickets.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Eventra&apos;s auth layer uses credentials login with role-aware
                redirects for admins, organizers, and attendees.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureMessage
                  title="Fast credentials login"
                  description="Only the fields required for auth are selected on sign-in."
                />
                <FeatureMessage
                  title="Protected routes"
                  description="Dashboard routes redirect guests, and organizer status gates stay explicit."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#d46d42]">
                <LockKeyhole className="size-5" />
              </div>
              <CardTitle className="pt-3 font-heading text-3xl">
                Welcome back
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <LoginForm />
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Demo accounts are live. Use `Password123!` for every seeded
                    admin, organizer, and user account.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Need an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-slate-950 underline-offset-4 hover:underline"
                >
                  Register as attendee
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
    <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
    </div>
  );
}
