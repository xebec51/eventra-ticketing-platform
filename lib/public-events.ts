import { EventStatus, EventVisibility } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { EventSummary } from "@/lib/types";

type PublicEventsParams = {
  query?: string;
  category?: string;
  city?: string;
  sort?: string;
};

function mapEventToSummary(event: {
  id: string;
  slug: string;
  title: string;
  category: { name: string };
  city: string;
  locationName: string;
  startDatetime: Date;
  endDatetime: Date;
  status: EventStatus;
  description: string;
  _count: { favoriteEvents: number; bookings: number };
  ticketTypes: { price: { toString(): string } }[];
  eventReviews: { rating: number }[];
}): EventSummary {
  const prices = event.ticketTypes.map((ticketType) =>
    Number(ticketType.price.toString())
  );
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const averageRating = event.eventReviews.length
    ? event.eventReviews.reduce((sum, review) => sum + review.rating, 0) /
      event.eventReviews.length
    : 0;

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category.name,
    city: event.city,
    locationName: event.locationName,
    startDate: event.startDatetime.toISOString(),
    endDate: event.endDatetime.toISOString(),
    priceLabel: minPrice > 0 ? `From $${minPrice}` : "Free",
    priceValue: minPrice,
    attendees: event._count.bookings,
    favorites: event._count.favoriteEvents,
    rating: averageRating,
    status: event.status,
    imageAccent: "from-[#231942] via-[#d46d42] to-[#ffcb69]",
    excerpt: event.description,
    featured: event._count.favoriteEvents > 0,
  };
}

export async function getPublicEvents(params: PublicEventsParams = {}) {
  const events = await prisma.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      visibility: EventVisibility.PUBLIC,
      title: params.query
        ? {
            contains: params.query,
            mode: "insensitive",
          }
        : undefined,
      category: params.category
        ? {
            slug: params.category,
          }
        : undefined,
      city: params.city
        ? {
            equals: params.city,
            mode: "insensitive",
          }
        : undefined,
    },
    include: {
      category: { select: { name: true } },
      ticketTypes: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        select: { price: true },
      },
      eventReviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
      _count: {
        select: {
          favoriteEvents: true,
          bookings: true,
        },
      },
    },
    orderBy: { startDatetime: "asc" },
  });

  const mapped = events.map(mapEventToSummary);

  if (params.sort === "price") {
    mapped.sort((left, right) => left.priceValue - right.priceValue);
  } else if (params.sort === "popularity") {
    mapped.sort(
      (left, right) =>
        right.favorites + right.attendees - (left.favorites + left.attendees)
    );
  } else {
    mapped.sort(
      (left, right) =>
        new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
    );
  }

  return mapped;
}
