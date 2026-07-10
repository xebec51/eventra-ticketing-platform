import { format } from "date-fns";

import {
  cancelEventAction,
  deleteEventAction,
  publishEventAction,
  unpublishEventAction,
  updateEventAction,
} from "@/app/actions/management";
import {
  createTicketTypeAction,
  deleteTicketTypeAction,
  toggleTicketTypeAction,
  updateTicketTypeAction,
} from "@/app/actions/ticket-types";
import { EventForm } from "@/components/eventra/event-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { TicketTypeForm } from "@/components/eventra/ticket-type-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

function toDateTimeLocal(value: Date | null) {
  if (!value) {
    return "";
  }

  return format(value, "yyyy-MM-dd'T'HH:mm");
}

export default async function OrganizerEventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const [{ id }, { error, notice }] = await Promise.all([params, searchParams]);
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    return null;
  }

  const [categories, event, ticketTypeReservations] = await Promise.all([
    prisma.eventCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findFirst({
      where: {
        id,
        organizerProfileId: organizerProfile.id,
      },
      include: {
        category: { select: { name: true } },
        ticketTypes: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            bookings: true,
            ticketTypes: true,
          },
        },
      },
    }),
    prisma.bookingItem.groupBy({
      by: ["ticketTypeId"],
      _sum: { quantity: true },
      where: {
        ticketType: {
          eventId: id,
        },
        booking: {
          status: {
            in: ["PENDING", "APPROVED"],
          },
        },
      },
    }),
  ]);

  if (!event) {
    return null;
  }

  const reservedMap = new Map(
    ticketTypeReservations.map((entry) => [
      entry.ticketTypeId,
      entry._sum.quantity ?? 0,
    ])
  );

  return (
    <div className="space-y-6">
      {error === "missing-ticket-types" ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Add at least one active ticket type before publishing this event.
        </div>
      ) : null}
      {error === "event-has-bookings" ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          This event already has bookings, so it cannot be deleted safely.
        </div>
      ) : null}
      {notice === "deactivated-ticket-type" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          The ticket type was deactivated instead of deleted because bookings already exist for it.
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={event.status} tone={event.status === "PUBLISHED" ? "success" : event.status === "CANCELLED" ? "danger" : "warning"} />
              <StatusBadge label={event.visibility} tone="muted" />
              <StatusBadge label={event.category.name} tone="default" />
            </div>
            <CardTitle className="pt-3 font-heading text-2xl">
              Edit event details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm
              action={updateEventAction}
              categories={categories}
              submitLabel="Save event changes"
              loadingLabel="Saving changes..."
              initialValues={{
                eventId: event.id,
                title: event.title,
                slug: event.slug,
                categoryId: event.categoryId,
                description: event.description,
                startDatetime: toDateTimeLocal(event.startDatetime),
                endDatetime: toDateTimeLocal(event.endDatetime),
                locationName: event.locationName,
                locationAddress: event.locationAddress ?? "",
                city: event.city,
                imageUrl: event.imageUrl ?? "",
                visibility: event.visibility,
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-black/5 bg-white/90">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Lifecycle controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Ticket types" value={String(event._count.ticketTypes)} />
                <Metric label="Bookings" value={String(event._count.bookings)} />
              </div>
              <form action={publishEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button className="w-full" type="submit">
                  Publish event
                </Button>
              </form>
              <form action={unpublishEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button className="w-full" type="submit" variant="outline">
                  Move back to draft
                </Button>
              </form>
              <form action={cancelEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button className="w-full" type="submit" variant="destructive">
                  Cancel event
                </Button>
              </form>
              <form action={deleteEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button className="w-full" type="submit" variant="destructive">
                  Delete event
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border border-black/5 bg-white/90">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Quick context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Scheduled for {format(event.startDatetime, "dd MMM yyyy, HH:mm")} in {event.city}.
              </p>
              <p>
                Organizer ownership protection is enforced at the query and action layers for this route.
              </p>
              <p>
                Publish controls now depend on active ticket types, which keeps discovery and booking flows aligned.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Add ticket type</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketTypeForm
              action={createTicketTypeAction}
              submitLabel="Create ticket type"
              loadingLabel="Creating ticket type..."
              initialValues={{
                eventId: event.id,
                price: 0,
                quota: 0,
                maxPerBooking: 1,
                isActive: true,
              }}
            />
          </CardContent>
        </Card>

        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Existing ticket types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.ticketTypes.map((ticketType) => {
              const reserved = reservedMap.get(ticketType.id) ?? 0;
              const available = Math.max(ticketType.quota - reserved, 0);

              return (
                <div
                  key={ticketType.id}
                  className="space-y-4 rounded-3xl border border-black/5 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={ticketType.name} tone="default" />
                    <StatusBadge
                      label={ticketType.isActive ? "ACTIVE" : "INACTIVE"}
                      tone={ticketType.isActive ? "success" : "muted"}
                    />
                    <StatusBadge label={`${available} available`} tone="warning" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4 text-sm">
                    <Metric label="Price" value={formatCurrency(ticketType.price.toString())} />
                    <Metric label="Quota" value={String(ticketType.quota)} />
                    <Metric label="Reserved" value={String(reserved)} />
                    <Metric label="Max / booking" value={String(ticketType.maxPerBooking)} />
                  </div>
                  <TicketTypeForm
                    action={updateTicketTypeAction}
                    submitLabel="Save ticket type"
                    loadingLabel="Saving ticket type..."
                    initialValues={{
                      eventId: event.id,
                      ticketTypeId: ticketType.id,
                      name: ticketType.name,
                      description: ticketType.description ?? "",
                      price: ticketType.price.toString(),
                      quota: ticketType.quota,
                      maxPerBooking: ticketType.maxPerBooking,
                      salesStartAt: toDateTimeLocal(ticketType.salesStartAt),
                      salesEndAt: toDateTimeLocal(ticketType.salesEndAt),
                      isActive: ticketType.isActive,
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleTicketTypeAction}>
                      <input type="hidden" name="ticketTypeId" value={ticketType.id} />
                      <input
                        type="hidden"
                        name="nextActive"
                        value={String(!ticketType.isActive)}
                      />
                      <Button size="sm" type="submit" variant="outline">
                        {ticketType.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                    <form action={deleteTicketTypeAction}>
                      <input type="hidden" name="ticketTypeId" value={ticketType.id} />
                      <Button size="sm" type="submit" variant="destructive">
                        Delete or deactivate
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
