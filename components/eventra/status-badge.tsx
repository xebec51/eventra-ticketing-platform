import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "border-slate-200 bg-slate-950 text-white shadow-sm",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  muted: "border-slate-200 bg-slate-100 text-slate-700",
};

export function StatusBadge({
  label,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <Badge className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", toneClasses[tone])}>
      {label}
    </Badge>
  );
}
