"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/use-i18n";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const successMessage = useMemo(() => {
    if (searchParams.get("registered") !== "1") {
      return null;
    }

    if (searchParams.get("role") === "organizer") {
      return t("auth.organizerRegistered");
    }

    return t("auth.accountCreated");
  }, [searchParams, t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result || result.error) {
        setError(t("auth.invalidCredentials"));
        return;
      }

      router.replace(result.url || "/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {successMessage ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@eventra.demo"
          className="h-11 border-black/10"
          disabled={isPending}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password123!"
          className="h-11 border-black/10"
          disabled={isPending}
          required
        />
      </div>
      <Button className="h-11 w-full" disabled={isPending} type="submit">
        {isPending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  );
}
