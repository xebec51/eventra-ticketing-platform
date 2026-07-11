import type { ReactNode } from "react";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
};

export function StatCard({
  label,
  value,
  change,
  icon,
  tone = "default",
}: StatCardProps) {
  const positiveTone = tone === "success" || tone === "default";

  return (
    <Card className="eventra-panel overflow-hidden rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <CardTitle className="mt-2 font-heading text-3xl font-semibold">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
          {icon ?? <TrendingUp className="size-5" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={change} tone={tone} />
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              positiveTone ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {positiveTone ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            vs. last 30 days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
