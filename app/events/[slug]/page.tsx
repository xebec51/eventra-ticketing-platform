import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Star, Ticket } from "lucide-react";

import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { BookingForm } from "@/components/eventra/booking-form";
import { FavoriteEventButton } from "@/components/eventra/favorite-event-button";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { getServerTranslator } from "@/lib/i18n/server";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function formatEventDateRange(start: Date, end: Date, locale: "en" | "id") {
  const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, t } = await getServerTranslator();
  const [user, event] = await Promise.all([
    getSessionUser(),
    prisma.event.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      include: {
        category: { select: { name: true } },
        organizerProfile: { select: { organizationName: true } },
        ticketTypes: {
          where: { isActive: true },
          orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        },
        favoriteEvents: {
          select: { userId: true },
        },
        eventReviews: {
          where: { isVisible: true },
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            favoriteEvents: true,
            bookings: true,
          },
        },
      },
    }),
  ]);

  if (!event) {
    notFound();
  }

  const reservationSums = await prisma.bookingItem.groupBy({
    by: ["ticketTypeId"],
    _sum: { quantity: true },
    where: {
      ticketType: { eventId: event.id },
      booking: {
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    },
  });

  const reservedMap = new Map(
    reservationSums.map((entry) => [entry.ticketTypeId, entry._sum.quantity ?? 0])
  );
  const isFavorite = !!user
    ? event.favoriteEvents.some((favorite) => favorite.userId === user.id)
    : false;
  const averageRating = event.eventReviews.length
    ? event.eventReviews.reduce((sum, review) => sum + review.rating, 0) /
      event.eventReviews.length
    : 0;
  const bookingTicketTypes = event.ticketTypes.map((ticketType) => {
    const reserved = reservedMap.get(ticketType.id) ?? 0;
    const available = Math.max(ticketType.quota - reserved, 0);

    return {
      id: ticketType.id,
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price.toNumber(),
      maxPerBooking: ticketType.maxPerBooking,
      available,
      salesWindowLabel:
        ticketType.salesStartAt || ticketType.salesEndAt
          ? `Sales ${ticketType.salesStartAt ? formatDateTime(ticketType.salesStartAt, locale) : "now"}${
              ticketType.salesEndAt ? ` to ${formatDateTime(ticketType.salesEndAt, locale)}` : ""
            }`
          : null,
    };
  });
  const isUserBooker = user?.role === "USER";

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className={cn(
            "rounded-[2rem] bg-gradient-to-br p-8 text-white lg:p-10",
            "from-[#231942] via-[#d46d42] to-[#ffcb69]"
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={event.category.name} tone="default" />
            <StatusBadge label={event.city} tone="warning" />
          </div>
          <h1 className="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            {event.description}
          </p>
          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <InfoPill
              icon={<CalendarDays className="size-4" />}
              label={formatEventDateRange(event.startDatetime, event.endDatetime, locale)}
            />
            <InfoPill icon={<MapPin className="size-4" />} label={event.locationName} />
            <InfoPill
              icon={<Star className="size-4" />}
              label={`${averageRating.toFixed(1)} ${t("events.ratingSuffix")}`}
            />
            <InfoPill
              icon={<Ticket className="size-4" />}
              label={
                event.ticketTypes.length
                  ? formatCurrency(event.ticketTypes[0].price.toString(), locale)
                  : "Free"
              }
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-black/5 bg-white/90">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                {t("nav.overview")}
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
              <p>
                Hosted by {event.organizerProfile.organizationName}, this public
                listing exposes live ticket inventory, visible attendee feedback,
                and the approval model before checkout begins.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeaturePanel
                  title="Ticket types"
                  description="Organizer-configured tiers support free, paid, and sales-window based inventory."
                />
                <FeaturePanel
                  title="Manual approval model"
                  description="Paid bookings stay pending until proof is reviewed, while cash-on-venue still requires approval before ticket issuance."
                />
                <FeaturePanel
                  title="Review eligibility"
                  description="Attendees can only review after the event ends and a ticket for that event has been checked in as used."
                />
                <FeaturePanel
                  title="QR verification"
                  description="Frontend-generated QR output points to the public verify route backed by ticket code validation."
                />
              </div>
              <div className="space-y-3">
                <h3 className="font-heading text-xl font-semibold text-slate-950">
                  Attendee reviews
                </h3>
                {event.eventReviews.length > 0 ? (
                  event.eventReviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-3xl border border-black/5 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900">
                        {review.user.name}
                      </p>
                      <StatusBadge label={`${review.rating}/5`} tone="warning" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {review.comment || "No written comment provided."}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No public reviews yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-black/5 bg-white/90">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Booking snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <FavoriteEventButton
                    eventId={event.id}
                    redirectPath={`/events/${event.slug}`}
                    isFavorite={isFavorite}
                    canFavorite={!!user}
                    count={event._count.favoriteEvents}
                  />
                  <StatusBadge
                    label={`${event._count.bookings} bookings`}
                    tone="default"
                  />
                </div>
                <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Primary CTA
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Guests are redirected to login before protected actions such
                    as booking and favoriting.
                  </p>
                </div>
                <div className="grid gap-3">
                  {bookingTicketTypes.map((ticketType) => (
                    <TicketTier
                      key={ticketType.id}
                      name={ticketType.name}
                      price={
                        ticketType.price > 0
                          ? formatCurrency(ticketType.price)
                          : "Free"
                      }
                      note={`${ticketType.available} available | max ${ticketType.maxPerBooking} per booking`}
                    />
                  ))}
                </div>
                {isUserBooker ? (
                  <BookingForm
                    eventId={event.id}
                    eventTitle={event.title}
                    ticketTypes={bookingTicketTypes}
                  />
                ) : (
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className={cn(buttonVariants({ size: "lg" }), "w-full")}
                  >
                    {user ? t("nav.openDashboard") : t("auth.signIn")}
                  </Link>
                )}
              </CardContent>
            </Card>
            <Card className="border border-black/5 bg-white/90">
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  Expected flows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FlowRow
                  label="Payment review"
                  badge={<BookingStatusBadge status="PENDING" />}
                />
                <FlowRow
                  label="Approval and ticket issuance"
                  badge={<BookingStatusBadge status="APPROVED" />}
                />
                <FlowRow
                  label="Expiry handling"
                  badge={<StatusBadge label="24h deadline" tone="warning" />}
                />
                <FlowRow
                  label="Check-in status"
                  badge={<StatusBadge label="Ticket-level only" tone="default" />}
                />
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
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
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
