"use client";

import Link from "next/link";
import {
  Code2,
  ExternalLink,
  Mail,
} from "lucide-react";

import { EventraLogo } from "@/components/eventra/logo";
import { useI18n } from "@/lib/i18n/use-i18n";

const productLinks = [
  { href: "/", labelKey: "footer.links.home" },
  { href: "/events", labelKey: "footer.links.events" },
  { href: "/login", labelKey: "footer.links.login" },
  { href: "/dashboard", labelKey: "footer.links.dashboard" },
  { href: "/verify/TKT-DEMO2026", labelKey: "footer.links.verifyTicket" },
] as const;

const techStack = [
  "Next.js",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Tailwind CSS",
  "shadcn/ui",
] as const;

const developerLinks = [
  {
    href: "https://github.com/xebec51",
    labelKey: "developer.github",
    icon: Code2,
  },
  {
    href: "https://www.linkedin.com/in/rinaldiruslan",
    labelKey: "developer.linkedin",
    icon: ExternalLink,
  },
  {
    href: "mailto:rinaldi.ruslan51@gmail.com",
    labelKey: "developer.email",
    icon: Mail,
  },
] as const;

export function AppFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-foreground text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.7fr_1fr] lg:px-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <EventraLogo compact variant="inverse" />
            <div>
              <p className="font-heading text-lg font-semibold">Eventra</p>
              <p className="text-xs text-white/56">
                Smart Event Ticketing Platform
              </p>
            </div>
          </div>
          <div className="max-w-md space-y-3">
            <p className="text-sm leading-6 text-white/68">
              {t("footer.description")}
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-amber">
              {t("developer.portfolioProject")}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
            {t("footer.product")}
          </h2>
          <nav className="mt-4 grid gap-3 text-sm">
            {productLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group inline-flex w-fit items-center gap-2 text-white/68 transition hover:text-brand-amber"
              >
                {t(item.labelKey)}
                <ExternalLink className="size-3.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-l border-white/10 pl-0 lg:pl-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-amber">
                {t("footer.developer")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">
                Muh. Rinaldi Ruslan
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {t("developer.role")}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/66">
            {t("developer.portfolioDescription")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {developerLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={t(link.labelKey)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-xs font-semibold text-white/72 transition hover:border-brand-amber/50 hover:text-brand-amber"
                >
                  <Icon className="size-3.5" />
                  {t(link.labelKey)}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{t("footer.rights", { year })}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Code2 className="size-4 text-brand-amber" />
            <span>{techStack.join(" · ")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
