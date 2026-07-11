"use client";

import { useActionState } from "react";

import {
  registerUserAction,
  type AuthFormState,
} from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/use-i18n";
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
  const { t } = useI18n();

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      {state.message ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 sm:col-span-2">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="name">{t("auth.fullName")}</Label>
        <Input id="name" name="name" placeholder="Alya Setiawan" className="h-11 border-black/10 bg-slate-50" />
        <FieldError message={state.errors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">{t("auth.email")}</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="h-11 border-black/10 bg-slate-50"
        />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("auth.phone")}</Label>
        <Input id="phone" name="phone" placeholder="+65 8123 4567" className="h-11 border-black/10 bg-slate-50" />
        <FieldError message={state.errors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t("auth.createStrongPassword")}
          className="h-11 border-black/10 bg-slate-50"
        />
        <FieldError message={state.errors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder={t("auth.repeatPassword")}
          className="h-11 border-black/10 bg-slate-50"
        />
        <FieldError message={state.errors?.confirmPassword} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel={t("auth.creatingAccount")}>
          {t("auth.createAccount")}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
