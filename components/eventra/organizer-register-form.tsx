"use client";

import { useActionState } from "react";

import {
  registerOrganizerAction,
  type AuthFormState,
} from "@/app/actions/auth";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/use-i18n";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export function OrganizerRegisterForm() {
  const [state, action] = useActionState(registerOrganizerAction, initialState);
  const { t } = useI18n();

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      {state.message ? (
        <div className="sm:col-span-2 rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="organizationName">{t("auth.organizationName")}</Label>
        <Input
          id="organizationName"
          name="organizationName"
          placeholder="Design Society Chapter"
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.organizationName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t("auth.accountOwnerName")}</Label>
        <Input id="name" name="name" placeholder="Maya Chen" className="h-11 border-black/10" />
        <FieldError message={state.errors?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPerson">{t("auth.contactPerson")}</Label>
        <Input
          id="contactPerson"
          name="contactPerson"
          placeholder="Maya Chen"
          className="h-11 border-black/10"
        />
        <FieldError message={state.errors?.contactPerson} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.accountEmail")}</Label>
        <Input id="email" name="email" type="email" placeholder="team@organization.id" className="h-11 border-black/10" />
        <FieldError message={state.errors?.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("auth.phone")}</Label>
        <Input id="phone" name="phone" placeholder="+62 812 0000 0000" className="h-11 border-black/10" />
        <FieldError message={state.errors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input id="password" name="password" type="password" placeholder={t("auth.createStrongPassword")} className="h-11 border-black/10" />
        <FieldError message={state.errors?.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder={t("auth.repeatPassword")} className="h-11 border-black/10" />
        <FieldError message={state.errors?.confirmPassword} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="websiteUrl">{t("auth.website")}</Label>
        <Input id="websiteUrl" name="websiteUrl" placeholder="https://organization.id" className="h-11 border-black/10" />
        <FieldError message={state.errors?.websiteUrl} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">{t("auth.description")}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t("auth.description")}
          className="min-h-32 border-black/10"
        />
        <FieldError message={state.errors?.description} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="address">{t("auth.address")}</Label>
        <Textarea
          id="address"
          name="address"
          placeholder={t("auth.address")}
          className="min-h-24 border-black/10"
        />
        <FieldError message={state.errors?.address} />
      </div>
      <div className="sm:col-span-2">
        <AuthSubmitButton loadingLabel={t("auth.submittingApplication")}>
          {t("auth.submitApplication")}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
