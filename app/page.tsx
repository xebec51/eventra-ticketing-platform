import Link from "next/link";
import { ArrowRight, CalendarCheck2, ShieldCheck, Ticket } from "lucide-react";

import { EventCard } from "@/components/eventra/event-card";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerTranslator } from "@/lib/i18n/server";
import { getPublicEvents } from "@/lib/public-events";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { t } = await getServerTranslator();
  const [upcomingEvents, popularEvents] = await Promise.all([
    getPublicEvents({ sort: "date" }),
    getPublicEvents({ sort: "popularity" }),
  ]);

  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.75fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl space-y-7">
          <p className="text-sm font-semibold text-amber-700">
            {t("marketing.heroBadge")}
          </p>
          <div className="space-y-5">
            <h1 className="font-heading text-5xl font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
              {t("marketing.heroTitle")}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {t("marketing.heroDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }))}>
              {t("marketing.exploreCatalog")}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/register/organizer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {t("marketing.applyAsOrganizer")}
            </Link>
          </div>
        </div>

        <Card className="border-slate-200 bg-slate-950 text-white shadow-none">
          <CardContent className="space-y-6 p-7">
            <div>
              <p className="text-sm font-medium text-amber-300">
                {t("marketing.platformSnapshot")}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold">
                {t("marketing.approvalsTitle")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {t("marketing.approvalsFlowDescription")}
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              <WorkflowRow
                icon={<ShieldCheck className="size-4" />}
                title={t("marketing.approvals")}
                description={t("marketing.approvalsDescription")}
              />
              <WorkflowRow
                icon={<Ticket className="size-4" />}
                title={t("marketing.tickets")}
                description={t("marketing.ticketsDescription")}
              />
              <WorkflowRow
                icon={<CalendarCheck2 className="size-4" />}
                title={t("marketing.checkIn")}
                description={t("marketing.checkInDescription")}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("marketing.featuredListings")}
            title={t("marketing.featuredListingsTitle")}
            description={t("marketing.featuredListingsDescription")}
            action={
              <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>
                {t("marketing.browseAllEvents")}
              </Link>
            }
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {popularEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("marketing.upcoming")}
          title={t("marketing.upcomingTitle")}
        />
        <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {upcomingEvents.slice(0, 4).map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="flex items-center justify-between gap-6 py-5 transition hover:text-amber-700"
            >
              <div>
                <p className="font-semibold text-slate-950">{event.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {event.city} · {event.priceLabel}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}

function WorkflowRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 py-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-amber-300">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
