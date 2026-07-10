import Link from "next/link";
import { Hourglass } from "lucide-react";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PendingOrganizerPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Card className="border border-black/5 bg-white/92">
          <CardContent className="space-y-6 py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff1e8] text-[#d46d42]">
              <Hourglass className="size-7" />
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                Organizer application under review
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Your account exists, but organizer access stays locked until an admin completes approval.
                Once approved, you’ll be able to create and publish events from the organizer workspace.
              </p>
            </div>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              Back to dashboard
            </Link>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
