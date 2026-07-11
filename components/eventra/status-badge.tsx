import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "border-primary/20 bg-primary/10 text-brand-primary-dark",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
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
