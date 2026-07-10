import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-black/10 bg-white/70">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 text-white">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
