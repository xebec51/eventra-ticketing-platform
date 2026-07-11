import Link from "next/link";
import { ShieldX } from "lucide-react";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerTranslator } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export default async function RejectedOrganizerPage() {
  const { t } = await getServerTranslator();

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Card className="border border-rose-100 bg-white/92">
          <CardContent className="space-y-6 py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldX className="size-7" />
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                {t("state.rejectedOrganizerTitle")}
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {t("state.rejectedOrganizerDescription")}
              </p>
            </div>
            <Link
              href="/register/organizer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {t("state.submitNewApplication")}
            </Link>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
