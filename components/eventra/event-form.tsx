"use client";

import { useActionState } from "react";

import type { ManagementFormState } from "@/app/actions/management";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EventFormValues = {
  eventId?: string;
  title?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
  locationName?: string;
  locationAddress?: string;
  city?: string;
  imageUrl?: string;
  visibility?: "PUBLIC" | "PRIVATE";
};

const initialState: ManagementFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function EventForm({
  action,
  categories,
  submitLabel,
  loadingLabel,
  initialValues,
}: {
  action: (
    state: ManagementFormState,
    payload: FormData
  ) => Promise<ManagementFormState>;
  categories: { id: string; name: string }[];
  submitLabel: string;
  loadingLabel: string;
  initialValues?: EventFormValues;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {initialValues?.eventId ? (
        <input type="hidden" name="eventId" value={initialValues.eventId} />
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
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialValues?.title}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug override</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={initialValues?.slug}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialValues?.categoryId || ""}
          className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError message={state.errors?.categoryId} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description}
          className="min-h-36 border-black/10"
        />
        <FieldError message={state.errors?.description} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDatetime">Start date and time</Label>
        <Input
          id="startDatetime"
          name="startDatetime"
          type="datetime-local"
          defaultValue={initialValues?.startDatetime}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.startDatetime} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDatetime">End date and time</Label>
        <Input
          id="endDatetime"
          name="endDatetime"
          type="datetime-local"
          defaultValue={initialValues?.endDatetime}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.endDatetime} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locationName">Location name</Label>
        <Input
          id="locationName"
          name="locationName"
          defaultValue={initialValues?.locationName}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.locationName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          defaultValue={initialValues?.city}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.city} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="locationAddress">Location address</Label>
        <Textarea
          id="locationAddress"
          name="locationAddress"
          defaultValue={initialValues?.locationAddress}
          className="min-h-24 border-black/10"
        />
        <FieldError message={state.errors?.locationAddress} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialValues?.imageUrl}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.imageUrl} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          name="visibility"
          defaultValue={initialValues?.visibility || "PUBLIC"}
          className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <FieldError message={state.errors?.visibility} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel={loadingLabel}>
          {submitLabel}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
