"use client";

import { useActionState } from "react";

import type { TicketTypeFormState } from "@/app/actions/ticket-types";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: TicketTypeFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

type TicketTypeValues = {
  ticketTypeId?: string;
  eventId: string;
  name?: string;
  description?: string;
  price?: number | string;
  quota?: number;
  maxPerBooking?: number;
  salesStartAt?: string;
  salesEndAt?: string;
  isActive?: boolean;
};

export function TicketTypeForm({
  action,
  initialValues,
  submitLabel,
  loadingLabel,
}: {
  action: (
    state: TicketTypeFormState,
    payload: FormData
  ) => Promise<TicketTypeFormState>;
  initialValues: TicketTypeValues;
  submitLabel: string;
  loadingLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="eventId" value={initialValues.eventId} />
      {initialValues.ticketTypeId ? (
        <input
          type="hidden"
          name="ticketTypeId"
          value={initialValues.ticketTypeId}
        />
      ) : null}
      {state.success ? (
        <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
      {state.message ? (
        <div className="sm:col-span-2 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`name-${initialValues.ticketTypeId || "new"}`}>Name</Label>
        <Input
          id={`name-${initialValues.ticketTypeId || "new"}`}
          name="name"
          defaultValue={initialValues.name}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.name} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`description-${initialValues.ticketTypeId || "new"}`}>
          Description
        </Label>
        <Textarea
          id={`description-${initialValues.ticketTypeId || "new"}`}
          name="description"
          defaultValue={initialValues.description}
          className="min-h-20 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.description} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`price-${initialValues.ticketTypeId || "new"}`}>Price</Label>
        <Input
          id={`price-${initialValues.ticketTypeId || "new"}`}
          name="price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initialValues.price}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.price} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`quota-${initialValues.ticketTypeId || "new"}`}>Quota</Label>
        <Input
          id={`quota-${initialValues.ticketTypeId || "new"}`}
          name="quota"
          type="number"
          min="0"
          step="1"
          defaultValue={initialValues.quota}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.quota} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`max-${initialValues.ticketTypeId || "new"}`}>
          Max per booking
        </Label>
        <Input
          id={`max-${initialValues.ticketTypeId || "new"}`}
          name="maxPerBooking"
          type="number"
          min="1"
          step="1"
          defaultValue={initialValues.maxPerBooking}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.maxPerBooking} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`active-${initialValues.ticketTypeId || "new"}`}>Active</Label>
        <label className="flex h-10 items-center gap-3 rounded-lg border border-black/10 bg-white px-3 text-sm text-slate-700">
          <input
            id={`active-${initialValues.ticketTypeId || "new"}`}
            name="isActive"
            type="checkbox"
            defaultChecked={initialValues.isActive ?? true}
          />
          Available for sale
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`salesStart-${initialValues.ticketTypeId || "new"}`}>
          Sales start
        </Label>
        <Input
          id={`salesStart-${initialValues.ticketTypeId || "new"}`}
          name="salesStartAt"
          type="datetime-local"
          defaultValue={initialValues.salesStartAt}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.salesStartAt} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`salesEnd-${initialValues.ticketTypeId || "new"}`}>
          Sales end
        </Label>
        <Input
          id={`salesEnd-${initialValues.ticketTypeId || "new"}`}
          name="salesEndAt"
          type="datetime-local"
          defaultValue={initialValues.salesEndAt}
          className="h-10 border-black/10 bg-white"
        />
        <FieldError message={state.errors?.salesEndAt} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel={loadingLabel}>
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
