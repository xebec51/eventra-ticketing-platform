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
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-5 px-3 py-4 sm:px-4 lg:flex-row lg:px-5">
        {sidebar}
        <div className={cn("min-w-0 flex-1 space-y-6", className)}>
          {header}
          {children}
        </div>
      </div>
    </div>
  );
}
