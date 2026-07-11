"use client";

import Link from "next/link";
import { CalendarDays, Heart, MapPin, Star } from "lucide-react";

import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatI18nShortDate } from "@/lib/i18n/formatters";
import { useI18n } from "@/lib/i18n/use-i18n";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

export function EventCard({ event }: { event: EventSummary }) {
  const { locale, t } = useI18n();

  return (
    <Card className="overflow-hidden border border-black/5 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
      <div className={cn("h-52 bg-gradient-to-br", event.imageAccent)}>
        <div className="flex h-full flex-col justify-between p-6 text-white">
          <div className="flex items-center justify-between">
            <StatusBadge label={event.category} tone="default" />
            <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Heart className="size-3.5" />
              {event.favorites}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              {event.city}
            </p>
            <h3 className="font-heading text-2xl font-semibold leading-tight">
              {event.title}
            </h3>
          </div>
        </div>
      </div>
      <CardContent className="space-y-5 pt-6">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {event.excerpt}
        </p>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-[#d46d42]" />
            {formatI18nShortDate(event.startDate, locale)}
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-[#d46d42]" />
            {event.locationName}
          </div>
          <div className="inline-flex items-center gap-2">
            <Star className="size-4 text-[#d46d42]" />
            {event.rating.toFixed(1)} {t("events.ratingSuffix")}
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="font-semibold text-slate-900">{event.priceLabel}</span>
            <span className="text-muted-foreground">{t("events.startingPrice")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {event.attendees.toLocaleString(locale === "id" ? "id-ID" : "en-US")} {t("events.attendees")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("events.listingReady")}
            </p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className={cn(buttonVariants({ size: "sm" }))}
        >
            {t("events.viewDetail")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
