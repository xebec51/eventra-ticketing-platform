import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AppShell({
  sidebar,
  header,
  children,
  className,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.18),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#f6f8fc_100%)]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        {sidebar}
        <div className={cn("min-w-0 flex-1 space-y-6", className)}>
          {header}
          {children}
        </div>
      </div>
    </div>
  );
}
