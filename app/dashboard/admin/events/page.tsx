import Link from "next/link";
import { format } from "date-fns";

import {
  cancelEventAction,
  publishEventAction,
  unpublishEventAction,
} from "@/app/actions/management";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const ADMIN_EVENT_LIMIT = 75;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const events = await prisma.event.findMany({
    take: ADMIN_EVENT_LIMIT,
    include: {
      category: { select: { name: true } },
      organizerProfile: { select: { organizationName: true } },
      ticketTypes: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          ticketTypes: true,
        },
      },
    },
    orderBy: [{ startDatetime: "asc" }, { createdAt: "desc" }],
  });

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="font-heading text-2xl">All events</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Admins can inspect organizer-owned events and apply publish, draft,
            or cancel status changes.
          </p>
        </div>
        <Link
          href="/dashboard/admin/categories"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Manage categories
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "missing-ticket-types" ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            This event needs at least one active ticket type before it can be
            published.
          </div>
        ) : null}
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-3xl border border-black/5 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={event.status}
                    tone={
                      event.status === "PUBLISHED"
                        ? "success"
                        : event.status === "CANCELLED"
                          ? "danger"
                          : "warning"
                    }
                  />
                  <StatusBadge label={event.visibility} tone="muted" />
                  <StatusBadge label={event.category.name} tone="default" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.organizerProfile.organizationName} | {event.city} |{" "}
                    {format(event.startDatetime, "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.ticketTypes.map((ticketType) => (
                    <StatusBadge
                      key={ticketType.id}
                      label={`${ticketType.name} | ${formatCurrency(ticketType.price.toString())}${ticketType.isActive ? "" : " | inactive"}`}
                      tone={ticketType.isActive ? "muted" : "warning"}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3 xl:w-80">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric
                    label="Bookings"
                    value={String(event._count.bookings)}
                  />
                  <Metric
                    label="Ticket types"
                    value={String(event._count.ticketTypes)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={publishEventAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <Button size="sm" type="submit">
                      Publish
                    </Button>
                  </form>
                  <form action={unpublishEventAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Move to draft
                    </Button>
                  </form>
                  <form action={cancelEventAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <Button size="sm" type="submit" variant="destructive">
                      Cancel
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
