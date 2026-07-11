"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/use-i18n";

export function EventFilters({
  query,
  category,
  city,
  sort,
  categories,
  cities,
}: {
  query?: string;
  category?: string;
  city?: string;
  sort?: string;
  categories: { id: string; slug: string; name: string }[];
  cities: string[];
}) {
  const { t } = useI18n();

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
            placeholder={t("events.searchPlaceholder")}
            className="h-11 border-black/10 pl-10"
          />
        </div>
        <select
          className="h-11 rounded-lg border border-black/10 bg-white px-3 text-sm"
          defaultValue={category || "all"}
          name="category"
        >
          <option value="all">{t("events.allCategories")}</option>
          {categories.map((categoryOption) => (
            <option key={categoryOption.id} value={categoryOption.slug}>
              {categoryOption.name}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-lg border border-black/10 bg-white px-3 text-sm"
          defaultValue={city || "all"}
          name="city"
        >
          <option value="all">{t("events.allCities")}</option>
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
          <option value="date">{t("events.sortByDate")}</option>
          <option value="price">{t("events.sortByPrice")}</option>
          <option value="popularity">{t("events.sortByPopularity")}</option>
        </select>
          <Button className="h-11" type="submit">
            {t("common.apply")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
