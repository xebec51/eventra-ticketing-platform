import {
  approveCashBookingAction,
  failPaymentVerificationAction,
  rejectBookingAction,
  verifyPaymentAction,
} from "@/app/actions/bookings";
import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { PaymentStatusBadge } from "@/components/eventra/payment-status-badge";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button } from "@/components/ui/button";

type OperatorBooking = {
  id: string;
  bookingCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  paymentMethod: "BANK_TRANSFER" | "E_WALLET" | "CASH_ON_VENUE" | "FREE";
  paymentStatus:
    | "UNPAID"
    | "WAITING_CONFIRMATION"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "NOT_REQUIRED";
};

export function BookingOperatorActions({
  booking,
}: {
  booking: OperatorBooking;
}) {
  const canVerify =
    booking.status === "PENDING" &&
    ["BANK_TRANSFER", "E_WALLET"].includes(booking.paymentMethod) &&
    booking.paymentStatus === "WAITING_CONFIRMATION";
  const canApproveCash =
    booking.status === "PENDING" &&
    booking.paymentMethod === "CASH_ON_VENUE" &&
    booking.paymentStatus === "NOT_REQUIRED";
  const canReject = booking.status === "PENDING";

  return (
    <div className="space-y-3 rounded-3xl border border-black/5 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <BookingStatusBadge status={booking.status} />
        <PaymentStatusBadge status={booking.paymentStatus} />
        <StatusBadge label={booking.paymentMethod} tone="muted" />
      </div>

      {canVerify ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <form action={verifyPaymentAction} className="space-y-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <textarea
              name="paymentNotes"
              className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="Optional verification note"
            />
            <Button type="submit" className="w-full">
              Verify payment and approve
            </Button>
          </form>

          <form action={failPaymentVerificationAction} className="space-y-3">
            <input type="hidden" name="bookingId" value={booking.id} />
            <textarea
              name="paymentNotes"
              className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="Reason for failed verification"
            />
            <Button type="submit" variant="destructive" className="w-full">
              Mark proof invalid
            </Button>
          </form>
        </div>
      ) : null}

      {canApproveCash ? (
        <form action={approveCashBookingAction}>
          <input type="hidden" name="bookingId" value={booking.id} />
          <Button type="submit" className="w-full">
            Approve cash-on-venue booking
          </Button>
        </form>
      ) : null}

      {canReject ? (
        <form action={rejectBookingAction} className="space-y-3">
          <input type="hidden" name="bookingId" value={booking.id} />
          <textarea
            name="rejectedReason"
            className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
            placeholder="Reason for rejection"
          />
          <Button type="submit" variant="outline" className="w-full">
            Reject booking
          </Button>
        </form>
      ) : null}

      {!canVerify && !canApproveCash && !canReject ? (
        <p className="text-sm text-muted-foreground">
          No manual action is currently available for this booking state.
        </p>
      ) : null}
    </div>
  );
}
