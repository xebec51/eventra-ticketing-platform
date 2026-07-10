import type { BookingStatus } from "@/lib/types";

import { StatusBadge } from "@/components/eventra/status-badge";

const bookingToneMap: Record<
  BookingStatus,
  "default" | "success" | "warning" | "danger" | "muted"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "muted",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <StatusBadge label={status} tone={bookingToneMap[status]} />;
}
