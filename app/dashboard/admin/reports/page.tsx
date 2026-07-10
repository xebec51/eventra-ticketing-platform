import Link from "next/link";

import { toggleReviewVisibilityAction } from "@/app/actions/reviews";
import { MetricBarChart, StatusPieChart } from "@/components/eventra/analytics-charts";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BOOKING_STATUS_ORDER,
  PAYMENT_STATUS_ORDER,
  buildDistribution,
  toCountRecord,
} from "@/lib/analytics";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const [bookingGroups, paymentGroups, reviews, topEvents] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["paymentStatus"],
      _count: { _all: true },
    }),
    prisma.eventReview.findMany({
      include: {
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.event.findMany({
      include: {
        bookings: {
          where: { paymentStatus: "PAID" },
          select: { totalAmount: true },
        },
      },
      take: 10,
    }),
  ]);

  const bookingDistribution = buildDistribution(
    BOOKING_STATUS_ORDER,
    toCountRecord(bookingGroups, "status")
  );
  const paymentDistribution = buildDistribution(
    PAYMENT_STATUS_ORDER,
    toCountRecord(paymentGroups, "paymentStatus")
  );
  const topEventData = topEvents
    .map((event) => ({
      label: event.title,
      value: event.bookings.reduce(
        (sum, booking) => sum + booking.totalAmount.toNumber(),
        0
      ),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl">Platform reports</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Export booking and attendee spreadsheets, then moderate public
              review visibility from the same reporting workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/api/exports/bookings"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Export bookings
            </Link>
            <Link href="/api/exports/attendees" className={cn(buttonVariants({}))}>
              Export attendees
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPieChart
          title="Booking status report"
          description="Export-aligned platform status counts."
          data={bookingDistribution}
        />
        <StatusPieChart
          title="Payment status report"
          description="Manual payment state across the whole platform."
          data={paymentDistribution}
        />
      </div>

      <MetricBarChart
        title="Top revenue events"
        description="Highest revenue based on paid booking totals."
        data={topEventData}
      />

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Review moderation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-black/5 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={`${review.rating}/5`} tone="warning" />
                    <StatusBadge
                      label={review.isVisible ? "Visible" : "Hidden"}
                      tone={review.isVisible ? "success" : "muted"}
                    />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-semibold text-slate-950">
                      {review.event.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.user.name}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {review.comment || "No written comment provided."}
                  </p>
                </div>
                <div className="min-w-48 rounded-3xl border border-black/5 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Visibility control
                  </p>
                  <form action={toggleReviewVisibilityAction} className="mt-3">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input
                      type="hidden"
                      name="nextVisibility"
                      value={String(!review.isVisible)}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                    >
                      {review.isVisible ? "Hide review" : "Show review"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
