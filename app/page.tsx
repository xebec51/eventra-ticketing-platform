import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ChartColumn,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { EventCard } from "@/components/eventra/event-card";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerTranslator } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { getPublicEvents } from "@/lib/public-events";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { t } = await getServerTranslator();
  const [upcomingEvents, popularEvents, categories] = await Promise.all([
    getPublicEvents({ sort: "date" }),
    getPublicEvents({ sort: "popularity" }),
    prisma.eventCategory.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  const featuredEvents = popularEvents.slice(0, 4);

  return (
    <MarketingShell>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="space-y-7">
          <StatusBadge label={t("marketing.heroBadge")} tone="warning" />
          <div className="space-y-5">
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.02] text-slate-950 sm:text-6xl">
              Eventra
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {t("marketing.heroDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }))}>
              {t("marketing.exploreCatalog")}
            </Link>
            <Link
              href="/register/organizer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {t("marketing.applyAsOrganizer")}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={t("marketing.ticketsIssued")}
              value="18.4K"
              change={t("marketing.ticketsIssuedChange")}
              icon={<Ticket className="size-5" />}
              tone="success"
            />
            <StatCard
              label={t("marketing.organizerApprovals")}
              value="94%"
              change={t("marketing.organizerApprovalsChange")}
              icon={<ShieldCheck className="size-5" />}
              tone="warning"
            />
            <StatCard
              label={t("marketing.checkInAccuracy")}
              value="99.2%"
              change={t("marketing.checkInAccuracyChange")}
              icon={<CalendarCheck2 className="size-5" />}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-3 shadow-[0_32px_100px_rgba(17,24,39,0.32)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827_0%,#24174f_42%,#1f3a8a_100%)]" />
          <div className="absolute inset-x-8 top-6 h-px bg-white/20" />
          <div className="relative grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/60">
                    {t("marketing.platformSnapshot")}
                  </p>
                  <h2 className="mt-3 max-w-xl font-heading text-3xl font-semibold">
                    {t("marketing.approvalsTitle")}
                  </h2>
                </div>
                <div className="flex size-14 items-center justify-center rounded-xl bg-amber-300 text-slate-950">
                  <QrCode className="size-7" />
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
                {t("marketing.approvalsFlowDescription")}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/90 p-5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("marketing.adminLens")}
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold">
                  {t("marketing.adminLensTitle")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("marketing.adminLensDescription")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/90 p-5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("marketing.organizerLens")}
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold">
                  {t("marketing.organizerLensTitle")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("marketing.organizerLensDescription")}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white p-5 md:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {t("marketing.attendeeExperience")}
                    </p>
                    <p className="mt-3 font-heading text-2xl font-semibold">
                      {t("marketing.attendeeExperienceTitle")}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/user"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    <CheckCircle2 className="size-4" />
                    {t("marketing.previewUserWorkspace")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("marketing.categoryMap")}
          title={t("marketing.categoryMapTitle")}
          description={t("marketing.categoryMapDescription")}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="eventra-panel rounded-xl"
            >
              <CardContent className="space-y-4 pt-6">
                <StatusBadge label={`${category._count.events} events`} tone="default" />
                <div>
                  <h3 className="font-heading text-xl font-semibold text-slate-950">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("marketing.featuredListings")}
          title={t("marketing.featuredListingsTitle")}
          description={t("marketing.featuredListingsDescription")}
          action={
            <Link
              href="/events"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {t("marketing.browseAllEvents")}
            </Link>
          }
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-4">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="eventra-panel rounded-xl">
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d46d42]">
                    {t("marketing.upcoming")}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {t("marketing.upcomingTitle")}
                  </h3>
                </div>
                <Link
                  href="/events?sort=date"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {t("common.viewAll")}
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <CompactEventRow
                    key={event.id}
                    href={`/events/${event.slug}`}
                    title={event.title}
                    meta={`${event.city} | ${event.priceLabel}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="eventra-panel rounded-xl">
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d46d42]">
                    {t("marketing.popular")}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                    {t("marketing.popularTitle")}
                  </h3>
                </div>
                <Link
                  href="/events?sort=popularity"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {t("common.explore")}
                </Link>
              </div>
              <div className="space-y-3">
                {popularEvents.slice(0, 3).map((event) => (
                  <CompactEventRow
                    key={event.id}
                    href={`/events/${event.slug}`}
                    title={event.title}
                    meta={`${event.favorites} saves | ${event.attendees} bookings`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-2xl border border-white/70 bg-slate-950 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
          <CardContent className="grid gap-10 p-8 lg:grid-cols-[1fr_0.9fr] lg:p-10">
            <div className="space-y-4">
              <StatusBadge label={t("marketing.dashboardReady")} tone="warning" />
              <h2 className="font-heading text-4xl font-semibold tracking-tight">
                {t("marketing.dashboardReadyTitle")}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {t("marketing.dashboardReadyDescription")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniFeature
                icon={<ChartColumn className="size-5" />}
                title={t("marketing.analytics")}
                description={t("marketing.analyticsDescription")}
              />
              <MiniFeature
                icon={<ShieldCheck className="size-5" />}
                title={t("marketing.approvals")}
                description={t("marketing.approvalsDescription")}
              />
              <MiniFeature
                icon={<Ticket className="size-5" />}
                title={t("marketing.tickets")}
                description={t("marketing.ticketsDescription")}
              />
              <MiniFeature
                icon={<CalendarCheck2 className="size-5" />}
                title={t("marketing.checkIn")}
                description={t("marketing.checkInDescription")}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}

function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-5">
      <div className="flex size-11 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
    </div>
  );
}

function CompactEventRow({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-black/5 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
    >
      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      </div>
      <ArrowRight className="size-4 text-[#d46d42]" />
    </Link>
  );
}
