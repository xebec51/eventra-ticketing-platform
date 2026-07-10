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
    <Card className="border border-black/5 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <CardTitle className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          {icon ?? <TrendingUp className="size-5" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
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
