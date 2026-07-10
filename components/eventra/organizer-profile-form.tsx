"use client";

import { useActionState } from "react";

import {
  updateOrganizerProfileAction,
  type AccountFormState,
} from "@/app/actions/accounts";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: AccountFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function OrganizerProfileForm({
  initialValues,
}: {
  initialValues: {
    organizationName: string;
    description?: string | null;
    contactPerson?: string | null;
    phone?: string | null;
    websiteUrl?: string | null;
    logoUrl?: string | null;
    address?: string | null;
  };
}) {
  const [state, formAction] = useActionState(
    updateOrganizerProfileAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {state.message ? (
        <div className="sm:col-span-2 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}
      {state.success ? (
        <div className="sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input
          id="organizationName"
          name="organizationName"
          defaultValue={initialValues.organizationName}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.organizationName} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialValues.description ?? ""}
          className="min-h-28 border-black/10"
        />
        <FieldError message={state.errors?.description} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact person</Label>
        <Input
          id="contactPerson"
          name="contactPerson"
          defaultValue={initialValues.contactPerson ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.contactPerson} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizerPhone">Phone</Label>
        <Input
          id="organizerPhone"
          name="phone"
          defaultValue={initialValues.phone ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          defaultValue={initialValues.websiteUrl ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.websiteUrl} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          name="logoUrl"
          defaultValue={initialValues.logoUrl ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.logoUrl} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={initialValues.address ?? ""}
          className="min-h-24 border-black/10"
        />
        <FieldError message={state.errors?.address} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel="Saving organizer profile...">
          Save organizer profile
        </AuthSubmitButton>
      </div>
    </form>
  );
}
