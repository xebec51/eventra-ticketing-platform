import type { PaymentStatus } from "@/lib/types";

import { StatusBadge } from "@/components/eventra/status-badge";

const paymentToneMap: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  UNPAID: "muted",
  WAITING_CONFIRMATION: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "muted",
  NOT_REQUIRED: "default",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadge label={status} tone={paymentToneMap[status]} />;
}
