"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/use-i18n";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/login" });
        })
      }
    >
      <LogOut className="size-4" />
      {isPending ? t("auth.signingOut") : t("auth.signOut")}
    </DropdownMenuItem>
  );
}
