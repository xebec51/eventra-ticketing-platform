import Link from "next/link";
import { format } from "date-fns";

import { createEventAction } from "@/app/actions/management";
import { EventForm } from "@/components/eventra/event-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function OrganizerEventsPage() {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, organizationName: true },
  });

  if (!organizerProfile) {
    return null;
  }

  const [categories, events] = await Promise.all([
    prisma.eventCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { organizerProfileId: organizerProfile.id },
      include: {
        category: { select: { name: true } },
        _count: {
          select: {
            bookings: true,
            ticketTypes: true,
          },
        },
      },
      orderBy: [{ startDatetime: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Create event</CardTitle>
            <p className="text-sm text-muted-foreground">
              New events are created as drafts so you can finish details before publishing.
            </p>
          </CardHeader>
          <CardContent>
            <EventForm
              action={createEventAction}
              categories={categories}
              submitLabel="Create draft event"
              loadingLabel="Creating draft..."
              initialValues={{ visibility: "PUBLIC" }}
            />
          </CardContent>
        </Card>

        <Card className="border border-black/5 bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-heading text-2xl">Your events</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {organizerProfile.organizationName} currently manages {events.length} events in Eventra.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label={event.status} tone={event.status === "PUBLISHED" ? "success" : event.status === "CANCELLED" ? "danger" : "warning"} />
                      <StatusBadge label={event.visibility} tone="muted" />
                      <StatusBadge label={event.category.name} tone="default" />
                    </div>
                    <div>
                      <p className="font-heading text-xl font-semibold text-slate-950">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.city} • {format(event.startDatetime, "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{event._count.ticketTypes} ticket types</span>
                      <span>{event._count.bookings} bookings</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/organizer/events/${event.id}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Manage event
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
