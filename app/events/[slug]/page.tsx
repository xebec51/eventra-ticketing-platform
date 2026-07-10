import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Star, Ticket } from "lucide-react";

import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { featuredEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatEventDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = featuredEvents.find((entry) => entry.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className={cn("rounded-[2rem] bg-gradient-to-br p-8 text-white lg:p-10", event.imageAccent)}>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={event.category} tone="default" />
            <StatusBadge label={event.city} tone="warning" />
          </div>
          <h1 className="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            {event.excerpt}
          </p>
          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <InfoPill icon={<CalendarDays className="size-4" />} label={formatEventDateRange(event.startDate, event.endDate)} />
            <InfoPill icon={<MapPin className="size-4" />} label={event.locationName} />
            <InfoPill icon={<Star className="size-4" />} label={`${event.rating.toFixed(1)} average rating`} />
            <InfoPill icon={<Ticket className="size-4" />} label={event.priceLabel} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-black/5 bg-white/90">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Event overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
              <p>
                This route is ready for the upcoming database-driven discovery phase. It already mirrors the final Eventra detail structure:
                public summary, ticket options, organizer info, attendee-facing FAQs, reviews, and booking CTA placement.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeaturePanel
                  title="Ticket types"
                  description="Early bird, regular, and free/community-access tiers with quota and sales period support."
                />
                <FeaturePanel
                  title="Manual approval model"
                  description="Paid bookings stay pending until proof is reviewed; free bookings can auto-approve."
                />
                <FeaturePanel
                  title="Review eligibility"
                  description="Attendees can only review after the event has ended and at least one ticket is used."
                />
                <FeaturePanel
                  title="QR verification"
                  description="Frontend-generated QR output points to a public verify route backed by ticket code validation."
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-black/5 bg-white/90">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Booking snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Primary CTA</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Guests will be redirected to login before protected actions such as booking and favoriting.
                  </p>
                </div>
                <div className="grid gap-3">
                  <TicketTier name="Early Bird" price="$12.00" note="Max 2 per booking" />
                  <TicketTier name="Regular Pass" price="$24.00" note="Manual payment supported" />
                  <TicketTier name="Community Access" price="Free" note="Auto-approved when quota remains" />
                </div>
                <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                  Sign in to book
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-black/5 bg-white/90">
              <CardHeader>
                <CardTitle className="font-heading text-xl">Expected flows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FlowRow label="Payment review" badge={<BookingStatusBadge status="PENDING" />} />
                <FlowRow label="Approval and ticket issuance" badge={<BookingStatusBadge status="APPROVED" />} />
                <FlowRow label="Expiry handling" badge={<StatusBadge label="24h deadline" tone="warning" />} />
                <FlowRow label="Check-in status" badge={<StatusBadge label="Ticket-level only" tone="default" />} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2.5 backdrop-blur">
      {icon}
      {label}
    </div>
  );
}

function FeaturePanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
      <p className="font-heading text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function TicketTier({
  name,
  price,
  note,
}: {
  name: string;
  price: string;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-black/5 bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-900">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{note}</p>
      </div>
      <p className="font-heading text-xl font-semibold text-slate-950">{price}</p>
    </div>
  );
}

function FlowRow({
  label,
  badge,
}: {
  label: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
        <Clock3 className="size-4 text-[#d46d42]" />
        {label}
      </div>
      {badge}
    </div>
  );
}
