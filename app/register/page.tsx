import Link from "next/link";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { RegisterForm } from "@/components/eventra/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function RegisterPage() {
  await redirectAuthenticatedUser();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border border-black/5 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Create attendee account
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Register to browse favorites, reserve tickets, upload payment
              proofs, and access QR tickets after approval.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <RegisterForm />
            <p className="text-sm text-muted-foreground">
              Want to host events instead?{" "}
              <Link
                href="/register/organizer"
                className="font-medium text-slate-950 underline-offset-4 hover:underline"
              >
                Apply as an organizer
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
