import Link from "next/link";
import { CalendarDays, Heart, MapPin, Star } from "lucide-react";

import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function EventCard({ event }: { event: EventSummary }) {
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
            {formatEventDate(event.startDate)}
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-[#d46d42]" />
            {event.locationName}
          </div>
          <div className="inline-flex items-center gap-2">
            <Star className="size-4 text-[#d46d42]" />
            {event.rating.toFixed(1)} rating
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="font-semibold text-slate-900">{event.priceLabel}</span>
            <span className="text-muted-foreground">starting price</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {event.attendees.toLocaleString()} attendees
            </p>
            <p className="text-xs text-muted-foreground">
              Public listing and manual approval-ready flow
            </p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            View detail
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
