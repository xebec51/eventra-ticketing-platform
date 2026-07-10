import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { PaymentProofForm } from "@/components/eventra/payment-proof-form";
import { PaymentStatusBadge } from "@/components/eventra/payment-status-badge";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function UserBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("USER");
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          locationName: true,
          startDatetime: true,
          endDatetime: true,
        },
      },
      items: {
        include: {
          ticketType: {
            select: {
              name: true,
            },
          },
        },
      },
      tickets: {
        include: {
          ticketType: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      paymentVerifier: {
        select: { name: true },
      },
      approver: {
        select: { name: true },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const canSubmitProof =
    booking.status === "PENDING" &&
    ["BANK_TRANSFER", "E_WALLET"].includes(booking.paymentMethod) &&
    ["UNPAID", "FAILED", "WAITING_CONFIRMATION"].includes(booking.paymentStatus);

  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl">
              {booking.event.title}
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {booking.bookingCode} • {booking.event.locationName} •{" "}
              {formatDateTime(booking.event.startDatetime)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
            <StatusBadge label={booking.paymentMethod} tone="muted" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Booking summary
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow label="Total amount" value={formatCurrency(booking.totalAmount.toNumber())} />
                <DetailRow label="Created at" value={formatDateTime(booking.createdAt)} />
                <DetailRow
                  label="Payment deadline"
                  value={booking.expiresAt ? formatDateTime(booking.expiresAt) : "Not applicable"}
                />
                <DetailRow label="Tickets issued" value={String(booking.tickets.length)} />
                <DetailRow
                  label="Approved by"
                  value={booking.approver?.name ?? "Waiting approval"}
                />
                <DetailRow
                  label="Payment verified by"
                  value={booking.paymentVerifier?.name ?? "Not verified yet"}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">Selected ticket types</p>
              <div className="mt-3 space-y-3">
                {booking.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-950">
                        {item.ticketType.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice.toNumber())}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-950">
                      {formatCurrency(item.subtotal.toNumber())}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {booking.tickets.length > 0 ? (
              <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">Issued tickets</p>
                <div className="mt-3 space-y-3">
                  {booking.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {ticket.ticketCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.ticketType.name} • {ticket.status}
                        </p>
                      </div>
                      <Link
                        href={`/verify/${ticket.ticketCode}`}
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                      >
                        Verify ticket
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {canSubmitProof ? (
              <Card className="border border-black/5 bg-white">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">
                    Payment proof submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentProofForm
                    bookingId={booking.id}
                    currentValue={booking.paymentProofUrl}
                  />
                </CardContent>
              </Card>
            ) : null}

            <Card className="border border-black/5 bg-white">
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  Booking notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>{booking.notes || "No attendee note was submitted."}</p>
                {booking.paymentProofUrl ? (
                  <p>
                    Payment proof URL:{" "}
                    <a
                      href={booking.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-950 underline"
                    >
                      {booking.paymentProofUrl}
                    </a>
                  </p>
                ) : null}
                {booking.paymentNotes ? (
                  <p>Payment notes: {booking.paymentNotes}</p>
                ) : null}
                {booking.rejectedReason ? (
                  <p>Rejected reason: {booking.rejectedReason}</p>
                ) : null}
                {booking.cancelledReason ? (
                  <p>Cancelled reason: {booking.cancelledReason}</p>
                ) : null}
              </CardContent>
            </Card>

            <Link
              href={`/events/${booking.event.slug}`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Back to public event page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
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
      <p className="mt-2 font-medium text-slate-950">{value}</p>
    </div>
  );
}
