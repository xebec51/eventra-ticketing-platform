"use client";

import { useActionState } from "react";

import {
  checkInTicketAction,
  type CheckInFormState,
} from "@/app/actions/tickets";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Label } from "@/components/ui/label";

const initialState: CheckInFormState = {};

export function CheckInForm() {
  const [state, formAction] = useActionState(checkInTicketAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="ticketCode">Ticket code</Label>
        <input
          id="ticketCode"
          name="ticketCode"
          type="text"
          className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm uppercase"
          placeholder="TKT-XXXXXXXX"
        />
      </div>
      <AuthSubmitButton loadingLabel="Checking in...">
        Check in attendee
      </AuthSubmitButton>

      {state.ticketCode ? (
        <div className="rounded-3xl border border-black/5 bg-slate-50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-slate-950">{state.ticketCode}</p>
          <p className="mt-1">{state.attendeeName}</p>
          <p>{state.eventTitle}</p>
          <p className="mt-2">Checked in at {state.checkedInAt}</p>
        </div>
      ) : null}
    </form>
  );
}
