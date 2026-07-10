import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Card className="border border-black/5 bg-white/92">
          <CardContent className="space-y-6 py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <ShieldAlert className="size-7" />
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                You do not have access to that workspace
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Role-based access checks will redirect users here whenever they attempt to open a dashboard area that doesn’t match their role or approval state.
              </p>
            </div>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              Return to dashboard
            </Link>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
