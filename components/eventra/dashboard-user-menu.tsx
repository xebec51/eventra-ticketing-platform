"use client";

import Link from "next/link";
import { ChevronDown, ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/eventra/sign-out-button";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole, UserStatus } from "@/lib/types";

export function DashboardUserMenu({
  name,
  email,
  role,
  status,
}: {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
        <ShieldCheck className="size-4" />
        {name}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="space-y-2">
            <p className="font-heading text-sm font-semibold text-slate-950">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <div className="flex items-center gap-2">
              <StatusBadge label={role} tone="default" />
              <StatusBadge
                label={status}
                tone={status === "ACTIVE" ? "success" : status === "PENDING" ? "warning" : "danger"}
              />
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
          Profile settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          Workspace settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
