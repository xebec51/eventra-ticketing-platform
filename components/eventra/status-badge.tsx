import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
  muted: "bg-slate-100 text-slate-700",
};

export function StatusBadge({
  label,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <Badge className={cn("border-transparent", toneClasses[tone])}>
      {label}
    </Badge>
  );
}
