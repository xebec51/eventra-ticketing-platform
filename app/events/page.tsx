import { EventCard } from "@/components/eventra/event-card";
import { EventFilters } from "@/components/eventra/event-filters";
import { MarketingShell } from "@/components/eventra/marketing-shell";
import { SectionHeading } from "@/components/eventra/section-heading";
import { featuredEvents } from "@/lib/mock-data";

export default function EventsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Event catalog"
          title="Find the right event, fast"
          description="Search, filter, and sort public listings across categories, cities, and pricing styles. Database-backed filtering lands in the discovery phase."
        />
        <div className="mt-8">
          <EventFilters />
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
