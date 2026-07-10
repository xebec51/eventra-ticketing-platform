"use client";

import { useActionState } from "react";

import {
  updateUserProfileAction,
  type AccountFormState,
} from "@/app/actions/accounts";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AccountFormState = {};

function FieldError({ message }: { message?: string[] }) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function UserProfileForm({
  initialValues,
}: {
  initialValues: {
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
  };
}) {
  const [state, formAction] = useActionState(
    updateUserProfileAction,
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
      <div className="space-y-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={initialValues.name}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          value={initialValues.email}
          disabled
          className="h-11 border-black/10 bg-slate-100"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-phone">Phone</Label>
        <Input
          id="profile-phone"
          name="phone"
          defaultValue={initialValues.phone ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-avatar">Avatar URL</Label>
        <Input
          id="profile-avatar"
          name="avatarUrl"
          defaultValue={initialValues.avatarUrl ?? ""}
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.avatarUrl} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel="Saving profile...">
          Save profile
        </AuthSubmitButton>
      </div>
    </form>
  );
}
