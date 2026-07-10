import Link from "next/link";
import { ArrowRight, CalendarCheck2, ChartColumn, ShieldCheck, Ticket } from "lucide-react";

import { EventCard } from "@/components/eventra/event-card";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { eventCategories, featuredEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-20">
        <div className="space-y-8">
          <StatusBadge label="Smart event operations" tone="warning" />
          <div className="space-y-5">
            <h1 className="max-w-3xl font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl">
              Event ticketing with cleaner approvals, calmer ops, and better attendee trust.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Eventra helps campus organizations, communities, and modern event teams handle discovery,
              approvals, QR tickets, manual payment verification, and check-in without the usual operational mess.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/events" className={cn(buttonVariants({ size: "lg" }))}>
              Explore event catalog
            </Link>
            <Link
              href="/register/organizer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Apply as organizer
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Tickets issued"
              value="18.4K"
              change="+22% month-over-month"
              icon={<Ticket className="size-5" />}
              tone="success"
            />
            <StatCard
              label="Organizer approvals"
              value="94%"
              change="same-day response"
              icon={<ShieldCheck className="size-5" />}
              tone="warning"
            />
            <StatCard
              label="Check-in accuracy"
              value="99.2%"
              change="validated with QR"
              icon={<CalendarCheck2 className="size-5" />}
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-[#ffcb69]/60 blur-3xl" />
          <div className="absolute -right-12 bottom-12 h-56 w-56 rounded-full bg-[#1dd3b0]/20 blur-3xl" />
          <Card className="relative overflow-hidden border border-white/70 bg-white/90 shadow-[0_30px_120px_rgba(35,25,66,0.16)]">
            <div className="bg-[linear-gradient(135deg,#231942_0%,#d46d42_46%,#ffcb69_100%)] p-7 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] backdrop-blur">
                Platform snapshot
              </div>
              <h2 className="mt-6 font-heading text-3xl font-semibold">
                Approvals, tickets, and attendee confidence in one flow.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                Free bookings can auto-approve. Paid and cash-on-venue reservations stay tightly verified before ticket issuance.
              </p>
            </div>
            <CardContent className="grid gap-4 p-7 md:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Admin lens
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold">Revenue, moderation, approvals</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Keep organizer onboarding, payment review, and reporting aligned from one dashboard.
                </p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Organizer lens
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold">Publish, verify, check in</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Manage event inventory, attendee approvals, manual payments, and live entry validation.
                </p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-slate-50 p-5 md:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Attendee experience
                    </p>
                    <p className="mt-3 font-heading text-2xl font-semibold">
                      Discover events, reserve seats, and carry QR tickets.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/user"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Preview user workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Category map"
          title="Built for the kinds of events teams actually run"
          description="Eventra fits fast-moving student programs, independent communities, and public-facing small events that need approvals, limited quotas, and dependable check-in."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {eventCategories.map((category) => (
            <Card
              key={category.id}
              className="border border-black/5 bg-white/85 shadow-[0_18px_55px_rgba(15,23,42,0.05)]"
            >
              <CardContent className="space-y-4 pt-6">
                <StatusBadge label={`${category.eventCount} events`} tone="default" />
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
          eyebrow="Featured listings"
          title="Discovery that still feels curated"
          description="Organizers get polished public listings, while attendees see events with clean details, pricing signals, and transparent approval expectations."
          action={
            <Link
              href="/events"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Browse all events
            </Link>
          }
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-4">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border border-white/70 bg-slate-950 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
          <CardContent className="grid gap-10 p-8 lg:grid-cols-[1fr_0.9fr] lg:p-10">
            <div className="space-y-4">
              <StatusBadge label="Dashboard ready" tone="warning" />
              <h2 className="font-heading text-4xl font-semibold tracking-tight">
                Professional enough for organizers, simple enough for attendees.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Eventra’s dashboard system is purpose-built for role-based workflows: admin governance,
                organizer execution, and user self-service, each with a clear visual hierarchy and operational focus.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniFeature
                icon={<ChartColumn className="size-5" />}
                title="Analytics"
                description="Revenue, bookings, check-in, top events, and role-scoped reports."
              />
              <MiniFeature
                icon={<ShieldCheck className="size-5" />}
                title="Approvals"
                description="Organizer verification, manual payment review, and quota-safe ticket issuance."
              />
              <MiniFeature
                icon={<Ticket className="size-5" />}
                title="Tickets"
                description="QR payload-based e-tickets with no stored QR image blob in the database."
              />
              <MiniFeature
                icon={<CalendarCheck2 className="size-5" />}
                title="Check-in"
                description="Organizer and admin validation with duplicate-use protection."
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
    <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
    </div>
  );
}
