"use client";

import { useActionState, useState } from "react";

import {
  createBookingAction,
  type BookingFormState,
} from "@/app/actions/bookings";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";

type BookingTicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  maxPerBooking: number;
  available: number;
  salesWindowLabel: string | null;
};

const initialState: BookingFormState = {};

const paidPaymentMethods = [
  {
    value: "BANK_TRANSFER",
    label: "Bank transfer",
    description: "Pay offline and upload a payment proof URL within 24 hours.",
  },
  {
    value: "E_WALLET",
    label: "E-wallet",
    description: "Reserve now and submit your transfer screenshot for review.",
  },
  {
    value: "CASH_ON_VENUE",
    label: "Cash on venue",
    description: "Reserve the seat now and settle payment at the event venue.",
  },
] as const;

export function BookingForm({
  eventId,
  eventTitle,
  ticketTypes,
}: {
  eventId: string;
  eventTitle: string;
  ticketTypes: BookingTicketType[];
}) {
  const [state, formAction] = useActionState(createBookingAction, initialState);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    ticketTypes.every((ticketType) => ticketType.price === 0)
      ? "FREE"
      : "BANK_TRANSFER"
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totalAmount = ticketTypes.reduce((sum, ticketType) => {
    return sum + (quantities[ticketType.id] ?? 0) * ticketType.price;
  }, 0);
  const effectivePaymentMethod =
    totalAmount === 0
      ? "FREE"
      : paymentMethod === "FREE"
        ? "BANK_TRANSFER"
        : paymentMethod;

  return (
    <Card className="border border-black/5 bg-white/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Reserve tickets</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Book {eventTitle} with the payment method that matches your total.
          Free reservations are approved instantly, while paid flows stay pending
          until reviewed.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="eventId" value={eventId} />

          {state.message ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
              {state.message}
            </div>
          ) : null}

          <div className="space-y-3">
            {ticketTypes.map((ticketType) => {
              const quantity = quantities[ticketType.id] ?? 0;

              return (
                <div
                  key={ticketType.id}
                  className="rounded-3xl border border-black/5 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          {ticketType.name}
                        </p>
                        <StatusBadge
                          label={`${ticketType.available} left`}
                          tone={ticketType.available > 10 ? "success" : "warning"}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticketType.description || "Organizer-defined ticket tier."}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Max {ticketType.maxPerBooking} / booking</span>
                        {ticketType.salesWindowLabel ? (
                          <span>{ticketType.salesWindowLabel}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div>
                        <Label
                          htmlFor={`quantity-${ticketType.id}`}
                          className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
                        >
                          Quantity
                        </Label>
                        <input
                          id={`quantity-${ticketType.id}`}
                          name={`quantity_${ticketType.id}`}
                          type="number"
                          min="0"
                          max={Math.min(
                            ticketType.maxPerBooking,
                            Math.max(ticketType.available, 0)
                          )}
                          value={quantity}
                          onChange={(event) => {
                            const nextQuantity = Number(event.target.value || 0);
                            setQuantities((current) => ({
                              ...current,
                              [ticketType.id]: nextQuantity,
                            }));
                          }}
                          className="mt-2 h-11 w-24 rounded-lg border border-black/10 bg-white px-3 text-sm"
                        />
                      </div>
                      <div className="min-w-28 text-right">
                        <p className="font-heading text-xl font-semibold text-slate-950">
                          {ticketType.price > 0
                            ? formatCurrency(ticketType.price)
                            : "Free"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {quantity > 0
                            ? formatCurrency(quantity * ticketType.price)
                            : "No tickets selected"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-black/5 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Booking total
                </p>
                <p className="mt-2 font-heading text-3xl font-semibold text-slate-950">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <StatusBadge
                label={totalAmount === 0 ? "Instant approval eligible" : "Review required"}
                tone={totalAmount === 0 ? "success" : "warning"}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-950">
              Payment method
            </Label>
            {totalAmount === 0 ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                <input
                  checked
                  readOnly
                  name="paymentMethod"
                  type="radio"
                  value="FREE"
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-slate-950">Free booking</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Because the total is zero, Eventra will approve the booking
                    and issue tickets right away.
                  </p>
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                {paidPaymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className="flex cursor-pointer items-start gap-3 rounded-3xl border border-black/5 bg-slate-50 p-4"
                  >
                    <input
                      onChange={() => setPaymentMethod(method.value)}
                      name="paymentMethod"
                      type="radio"
                      value={method.value}
                      checked={effectivePaymentMethod === method.value}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-slate-950">{method.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for organizer</Label>
            <textarea
              id="notes"
              name="notes"
              className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              placeholder="Optional request, invoice note, or seating context."
            />
          </div>

          <AuthSubmitButton loadingLabel="Creating booking...">
            Create booking
          </AuthSubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
