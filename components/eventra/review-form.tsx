"use client";

import { useActionState } from "react";

import {
  createReviewAction,
  type ReviewFormState,
} from "@/app/actions/reviews";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Label } from "@/components/ui/label";

const initialState: ReviewFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState(createReviewAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
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
        <Label htmlFor={`rating-${bookingId}`}>Rating</Label>
        <select
          id={`rating-${bookingId}`}
          name="rating"
          defaultValue="5"
          className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>
        <FieldError message={state.errors?.rating} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`comment-${bookingId}`}>Comment</Label>
        <textarea
          id={`comment-${bookingId}`}
          name="comment"
          className="min-h-24 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
          placeholder="Share what worked well, and what could be improved."
        />
        <FieldError message={state.errors?.comment} />
      </div>
      <AuthSubmitButton loadingLabel="Submitting review...">
        Submit review
      </AuthSubmitButton>
    </form>
  );
}
