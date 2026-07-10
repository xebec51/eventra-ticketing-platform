import { BookingOperatorActions } from "@/components/eventra/booking-operator-actions";
import { PaymentStatusBadge } from "@/components/eventra/payment-status-badge";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  await requireRole("ADMIN");
  const bookings = await prisma.booking.findMany({
    where: {
      paymentMethod: {
        in: ["BANK_TRANSFER", "E_WALLET", "CASH_ON_VENUE"],
      },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      event: {
        select: { title: true },
      },
    },
    orderBy: [{ paymentStatus: "asc" }, { createdAt: "desc" }],
  });

  const waitingConfirmations = bookings.filter(
    (booking) => booking.paymentStatus === "WAITING_CONFIRMATION"
  ).length;
  const unpaidManual = bookings.filter(
    (booking) => booking.paymentStatus === "UNPAID"
  ).length;
  const failedProofs = bookings.filter(
    (booking) => booking.paymentStatus === "FAILED"
  ).length;
  const paidManualRevenue = bookings
    .filter((booking) => booking.paymentStatus === "PAID")
    .reduce((sum, booking) => sum + booking.totalAmount.toNumber(), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Waiting proofs" value={String(waitingConfirmations)} change="Ready for admin verification" tone="warning" />
        <StatCard label="Still unpaid" value={String(unpaidManual)} change="Manual bookings before proof upload" />
        <StatCard label="Failed proofs" value={String(failedProofs)} change="Can be corrected and resubmitted" tone="danger" />
        <StatCard label="Paid manual revenue" value={formatCurrency(paidManualRevenue)} change="Verified transfer volume" tone="success" />
      </div>

      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Payment verification queue</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review uploaded proofs, approve cash-on-venue reservations, and leave
            operator notes that are visible in attendee booking detail.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid gap-4 rounded-3xl border border-black/5 bg-slate-50 p-5 xl:grid-cols-[1.15fr_0.85fr]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={booking.bookingCode} tone="default" />
                  <PaymentStatusBadge status={booking.paymentStatus} />
                  <StatusBadge label={booking.paymentMethod} tone="muted" />
                </div>
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {booking.event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.user.name} • {booking.user.email}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCell label="Amount" value={formatCurrency(booking.totalAmount.toNumber())} />
                  <InfoCell label="Created at" value={formatDateTime(booking.createdAt)} />
                  <InfoCell
                    label="Proof URL"
                    value={booking.paymentProofUrl ?? "No proof uploaded yet"}
                  />
                  <InfoCell
                    label="Operator note"
                    value={booking.paymentNotes ?? "No note yet"}
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
      <p className="mt-2 text-sm font-medium text-slate-950 break-all">{value}</p>
    </div>
  );
}
