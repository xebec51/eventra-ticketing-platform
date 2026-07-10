import { notFound } from "next/navigation";

import { BookingOperatorActions } from "@/components/eventra/booking-operator-actions";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function OrganizerBookingsPage() {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const bookings = await prisma.booking.findMany({
    where: {
      event: {
        organizerProfileId: organizerProfile.id,
      },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      event: {
        select: { title: true, city: true },
      },
      items: {
        include: {
          ticketType: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const waitingConfirmations = bookings.filter(
    (booking) => booking.paymentStatus === "WAITING_CONFIRMATION"
  ).length;
  const approvedBookings = bookings.filter((booking) => booking.status === "APPROVED").length;
  const revenue = bookings
    .filter((booking) => booking.paymentStatus === "PAID")
    .reduce((sum, booking) => sum + booking.totalAmount.toNumber(), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="All attendee bookings" value={String(bookings.length)} change="Across your published and completed events" />
        <StatCard label="Pending decisions" value={String(pendingBookings)} change="Reservation queue" tone="warning" />
        <StatCard label="Proofs to review" value={String(waitingConfirmations)} change="Manual payment verification" tone="warning" />
        <StatCard label="Paid revenue" value={formatCurrency(revenue)} change={`${approvedBookings} approved bookings`} tone="success" />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Organizer bookings</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review only the bookings connected to your events, approve offline
            reservations, and keep quota-sensitive inventory under control.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid gap-4 rounded-3xl border border-black/5 bg-slate-50 p-5 xl:grid-cols-[1.2fr_0.8fr]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={booking.bookingCode} tone="default" />
                  <StatusBadge label={booking.event.city} tone="muted" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {booking.event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buyer: {booking.user.name} • {booking.user.email}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCell label="Booked at" value={formatDateTime(booking.createdAt)} />
                  <InfoCell label="Amount" value={formatCurrency(booking.totalAmount.toNumber())} />
                  <InfoCell
                    label="Items"
                    value={booking.items
                      .map((item) => `${item.ticketType.name} x${item.quantity}`)
                      .join(" • ")}
                  />
                  <InfoCell
                    label="Deadline"
                    value={booking.expiresAt ? formatDateTime(booking.expiresAt) : "Not applicable"}
                  />
                </div>
              </div>
              <BookingOperatorActions
                booking={{
                  id: booking.id,
                  bookingCode: booking.bookingCode,
                  status: booking.status,
                  paymentMethod: booking.paymentMethod,
                  paymentStatus: booking.paymentStatus,
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}
