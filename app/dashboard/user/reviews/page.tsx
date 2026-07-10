import { ReviewForm } from "@/components/eventra/review-form";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function UserReviewsPage() {
  const user = await requireRole("USER");
  const [eligibleBookings, reviews] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user.id,
        status: "APPROVED",
        event: {
          endDatetime: {
            lt: new Date(),
          },
        },
        tickets: {
          some: {
            status: "USED",
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            endDatetime: true,
          },
        },
        review: {
          select: { id: true },
        },
      },
      orderBy: { event: { endDatetime: "desc" } },
    }),
    prisma.eventReview.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const reviewedEventIds = new Set(reviews.map((review) => review.eventId));
  const reviewReadyBookings = eligibleBookings.filter(
    (booking) => !booking.review && !reviewedEventIds.has(booking.event.id)
  );

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Review readiness</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Attendees will only be able to review an event after it ends and at least one ticket for that event has been checked in as `USED`.
        </CardContent>
      </Card>
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Ready to review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewReadyBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attended events are waiting for a review right now.
            </p>
          ) : (
            reviewReadyBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-5"
              >
                <div className="mb-4">
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {booking.event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Event ended {formatDateTime(booking.event.endDatetime)}
                  </p>
                </div>
                <ReviewForm bookingId={booking.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Submitted reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your review history will appear here after the first attended event.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={`${review.rating}/5`} tone="warning" />
                  <StatusBadge
                    label={review.isVisible ? "Visible publicly" : "Hidden by admin"}
                    tone={review.isVisible ? "success" : "muted"}
                  />
                </div>
                <p className="mt-3 font-heading text-xl font-semibold text-slate-950">
                  {review.event.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {review.comment || "No written comment provided."}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
