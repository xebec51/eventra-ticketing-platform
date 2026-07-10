import Link from "next/link";
import { format } from "date-fns";

import { runBookingExpirySyncAction } from "@/app/actions/bookings";
import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { EmptyState } from "@/components/eventra/empty-state";
import { PaymentStatusBadge } from "@/components/eventra/payment-status-badge";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function UserBookingsPage() {
  const user = await requireRole("USER");
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startDatetime: true,
          city: true,
        },
      },
      items: {
        include: {
          ticketType: {
            select: { name: true },
          },
        },
      },
      tickets: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeBookings = bookings.filter((booking) =>
    ["PENDING", "APPROVED"].includes(booking.status)
  ).length;
  const waitingPayments = bookings.filter(
    (booking) => booking.paymentStatus === "WAITING_CONFIRMATION"
  ).length;
  const approvedTickets = bookings.reduce((sum, booking) => {
    return sum + booking.tickets.length;
  }, 0);
  const totalSpent = bookings.reduce((sum, booking) => {
    return sum + booking.totalAmount.toNumber();
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Active bookings" value={String(activeBookings)} change="Pending or approved reservations" />
        <StatCard
          label="Waiting confirmation"
          value={String(waitingPayments)}
          change="Proof already submitted"
          tone="warning"
        />
        <StatCard
          label="Issued tickets"
          value={String(approvedTickets)}
          change="Generated only after approval"
          tone="success"
        />
        <StatCard
          label="Total spend"
          value={formatCurrency(totalSpent)}
          change="All-time booking value"
        />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl">My bookings</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Track expiry deadlines, payment proof status, organizer decisions,
              and the moment tickets become available.
            </p>
          </div>
          <form action={runBookingExpirySyncAction}>
            <Button type="submit" variant="outline">
              Sync expiry states
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Reserve your first event from the public catalog to start building your ticket history."
            />
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-black/5 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <BookingStatusBadge status={booking.status} />
                      <PaymentStatusBadge status={booking.paymentStatus} />
                      <StatusBadge label={booking.paymentMethod} tone="muted" />
                    </div>
                    <div>
                      <p className="font-heading text-xl font-semibold text-slate-950">
                        {booking.event.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.bookingCode} • {booking.event.city} •{" "}
                        {format(booking.event.startDatetime, "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{formatCurrency(booking.totalAmount.toNumber())}</span>
                      <span>{booking.items.reduce((sum, item) => sum + item.quantity, 0)} tickets</span>
                      <span>{booking.tickets.length} issued</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.items
                        .map((item) => `${item.ticketType.name} x${item.quantity}`)
                        .join(" • ")}
                    </p>
                    {booking.expiresAt ? (
                      <p className="text-sm text-amber-700">
                        Payment deadline: {formatDateTime(booking.expiresAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 xl:items-end">
                    <Link
                      href={`/dashboard/user/bookings/${booking.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Open details
                    </Link>
                    <Link
                      href={`/events/${booking.event.slug}`}
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" })
                      )}
                    >
                      View event page
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
