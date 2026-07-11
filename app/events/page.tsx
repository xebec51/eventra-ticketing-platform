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
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(17,24,39,0.22)] sm:p-8">
          <SectionHeading
            eyebrow={t("events.catalogEyebrow")}
            title={t("events.catalogTitle")}
            description={t("events.catalogDescription")}
            inverse
          />
          <div className="mt-5 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
            <p>{events.length} curated listings</p>
            <p>{categories.length} categories</p>
            <p>{cityOptions.length} active cities</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-black/5 bg-white/90 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
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
          <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
