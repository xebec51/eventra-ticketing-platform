"use client";

import { useActionState } from "react";

import {
  registerUserAction,
  type AuthFormState,
} from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

function FieldError({
  message,
}: {
  message?: string[];
}) {
  if (!message?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{message[0]}</p>;
}

export function RegisterForm() {
  const [state, action] = useActionState(registerUserAction, initialState);

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      {state.message ? (
        <div className="sm:col-span-2 rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" placeholder="Alya Setiawan" className="h-11 border-black/10" />
        <FieldError message={state.errors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" placeholder="+65 8123 4567" className="h-11 border-black/10" />
        <FieldError message={state.errors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat password"
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.confirmPassword} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel="Creating account...">
          Create account
        </AuthSubmitButton>
      </div>
    </form>
  );
}
