import { Search } from "lucide-react";

import { eventCategories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function EventFilters({
  query,
  category,
  city,
  sort,
  cities,
}: {
  query?: string;
  category?: string;
  city?: string;
  sort?: string;
  cities: string[];
}) {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardContent>
        <form
          action="/events"
          className="grid gap-4 pt-6 lg:grid-cols-[1.8fr_1fr_1fr_1fr_auto]"
        >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={query}
            name="q"
            placeholder="Search by event title, organizer, or topic"
            className="h-11 border-black/10 pl-10"
          />
        </div>
        <select
          className="h-11 rounded-lg border border-black/10 bg-white px-3 text-sm"
          defaultValue={category || "all"}
          name="category"
        >
          <option value="all">All categories</option>
            {eventCategories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
        </select>
        <select
          className="h-11 rounded-lg border border-black/10 bg-white px-3 text-sm"
          defaultValue={city || "all"}
          name="city"
        >
          <option value="all">All cities</option>
          {cities.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-lg border border-black/10 bg-white px-3 text-sm"
          defaultValue={sort || "date"}
          name="sort"
        >
          <option value="date">Sort by date</option>
          <option value="price">Sort by price</option>
          <option value="popularity">Sort by popularity</option>
        </select>
          <Button className="h-11" type="submit">
            Apply
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
