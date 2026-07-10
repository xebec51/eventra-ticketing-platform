import Link from "next/link";

import { FavoriteEventButton } from "@/components/eventra/favorite-event-button";
import { EmptyState } from "@/components/eventra/empty-state";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function UserFavoritesPage() {
  const user = await requireRole("USER");
  const favorites = await prisma.favoriteEvent.findMany({
    where: { userId: user.id },
    include: {
      event: {
        include: {
          category: {
            select: { name: true },
          },
          ticketTypes: {
            where: { isActive: true },
            orderBy: { price: "asc" },
            take: 1,
          },
          _count: {
            select: {
              favoriteEvents: true,
              bookings: true,
            },
          },
          eventReviews: {
            where: { isVisible: true },
            select: { rating: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Saved events</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep a shortlist of events you want to book later, then jump back
            into the live public detail page when you are ready.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {favorites.length === 0 ? (
            <EmptyState
              title="No favorite events yet"
              description="Save events from the catalog to keep them close while you compare schedules and ticket tiers."
            />
          ) : (
            favorites.map(({ event }) => {
              const averageRating = event.eventReviews.length
                ? event.eventReviews.reduce((sum, review) => sum + review.rating, 0) /
                  event.eventReviews.length
                : 0;

              return (
                <div
                  key={event.id}
                  className="rounded-3xl border border-black/5 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge label={event.category.name} tone="default" />
                        <StatusBadge label={event.city} tone="muted" />
                        <StatusBadge
                          label={event.status}
                          tone={event.status === "PUBLISHED" ? "success" : "warning"}
                        />
                      </div>
                      <div>
                        <p className="font-heading text-xl font-semibold text-slate-950">
                          {event.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.locationName} • {formatShortDate(event.startDatetime)}
                        </p>
                      </div>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {event.ticketTypes[0]
                            ? formatCurrency(event.ticketTypes[0].price.toNumber())
                            : "Free"}{" "}
                          starting price
                        </span>
                        <span>{event._count.bookings} bookings</span>
                        <span>{averageRating.toFixed(1)} rating</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 xl:items-end">
                      <FavoriteEventButton
                        eventId={event.id}
                        redirectPath="/dashboard/user/favorites"
                        isFavorite
                        canFavorite
                        count={event._count.favoriteEvents}
                      />
                      <Link
                        href={`/events/${event.slug}`}
                        className={cn(
                          buttonVariants({ size: "sm", variant: "outline" })
                        )}
                      >
                        Open event page
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
