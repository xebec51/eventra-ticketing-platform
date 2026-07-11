"use client";

import { Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { localeLabels, type Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/use-i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Languages className="size-4" />
        {localeLabels[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["en", "id"] as const).map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setLocale(option as Locale)}
          >
            {option === "en" ? t("common.english") : t("common.indonesian")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

