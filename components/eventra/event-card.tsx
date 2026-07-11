"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatI18nShortDate } from "@/lib/i18n/formatters";
import { useI18n } from "@/lib/i18n/use-i18n";
import type { EventSummary } from "@/lib/types";

export function EventCard({ event }: { event: EventSummary }) {
  const { locale, t } = useI18n();

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white shadow-none transition hover:border-slate-300">
      <div className="h-2 bg-slate-900" />
      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-medium text-amber-700">{event.category}</p>
        <h3 className="mt-3 font-heading text-2xl font-semibold leading-tight text-slate-950">
          {event.title}
        </h3>
      </div>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-3 text-sm text-slate-600">
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-slate-400" />
            {formatI18nShortDate(event.startDate, locale)}
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-slate-400" />
            {event.locationName}, {event.city}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="font-semibold text-slate-950">{event.priceLabel}</p>
            <p className="text-xs text-slate-500">{t("events.startingPrice")}</p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            {t("events.viewDetail")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
