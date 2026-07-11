import { EventCard } from "@/components/eventra/event-card";
import { EmptyState } from "@/components/eventra/empty-state";
import { EventFilters } from "@/components/eventra/event-filters";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { getServerTranslator } from "@/lib/i18n/server";
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
  const { t } = await getServerTranslator();
  const events = await getPublicEvents({
    query: q,
    category: category === "all" ? undefined : category,
    city: city === "all" ? undefined : city,
    sort,
  });
  const [cityOptions, categories] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
    prisma.eventCategory.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("events.catalogEyebrow")}
          title={t("events.catalogTitle")}
          description={t("events.catalogDescription")}
        />
        <div className="mt-8">
          <EventFilters
            query={q}
            category={category}
            city={city}
            sort={sort}
            categories={categories}
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
              title={t("events.noResultsTitle")}
              description={t("events.noResultsDescription")}
            />
          </div>
        )}
      </section>
    </MarketingShell>
  );
}
