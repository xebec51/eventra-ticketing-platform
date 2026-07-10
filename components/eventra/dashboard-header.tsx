"use client";

import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";

import { DashboardUserMenu } from "@/components/eventra/dashboard-user-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/lib/types";

const roleCopy: Record<UserRole, string> = {
  ADMIN: "Platform-wide governance, analytics, and moderation controls.",
  ORGANIZER: "Own your event pipeline from draft to check-in with clean attendee ops.",
  USER: "Keep bookings, tickets, favorites, and post-event actions in one place.",
};

export function DashboardHeader({
  role,
  title,
  name,
  email,
  status,
}: {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  status: UserStatus;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#d46d42]">
          <Sparkles className="size-3.5" />
          {role}
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {roleCopy[role]}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Quick search" className="h-11 border-black/10 pl-10" />
        </div>
        <Button variant="outline" size="lg">
          <Bell className="size-4" />
          Alerts
        </Button>
        <Link
          href="/events"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          View catalog
        </Link>
        <DashboardUserMenu
          name={name}
          email={email}
          role={role}
          status={status}
        />
      </div>
    </div>
  );
}
