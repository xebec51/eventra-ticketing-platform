import { EventCard } from "@/components/eventra/event-card";
import { EmptyState } from "@/components/eventra/empty-state";
import { EventFilters } from "@/components/eventra/event-filters";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { prisma } from "@/lib/prisma";
import { getPublicEvents } from "@/lib/public-events";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    sort?: string;
  }>;
}) {
  const { q, category, city, sort } = await searchParams;
  const events = await getPublicEvents({
    query: q,
    category: category === "all" ? undefined : category,
    city: city === "all" ? undefined : city,
    sort,
  });
  const cityOptions = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Event catalog"
          title="Find the right event, fast"
          description="Search, filter, and sort live public listings across categories, cities, and pricing styles."
        />
        <div className="mt-8">
          <EventFilters
            query={q}
            category={category}
            city={city}
            sort={sort}
            cities={cityOptions.map((item) => item.city)}
          />
        </div>
        {events.length > 0 ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No events matched those filters"
              description="Try a different keyword, category, or city to broaden the public catalog results."
            />
          </div>
        )}
      </section>
    </MarketingShell>
  );
}
