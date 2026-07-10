"use client";

import { useActionState } from "react";

import {
  submitPaymentProofAction,
  type BookingFormState,
} from "@/app/actions/bookings";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Label } from "@/components/ui/label";

const initialState: BookingFormState = {};

export function PaymentProofForm({
  bookingId,
  currentValue,
}: {
  bookingId: string;
  currentValue?: string | null;
}) {
  const [state, formAction] = useActionState(
    submitPaymentProofAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      {state.message ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`payment-proof-${bookingId}`}>Payment proof URL</Label>
        <input
          id={`payment-proof-${bookingId}`}
          name="paymentProofUrl"
          type="url"
          defaultValue={currentValue ?? ""}
          className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
          placeholder="https://..."
        />
      </div>
      <AuthSubmitButton loadingLabel="Submitting proof...">
        Submit payment proof
      </AuthSubmitButton>
    </form>
  );
}
