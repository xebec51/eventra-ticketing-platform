"use client";

import type { BookingStatus } from "@/lib/types";

import { StatusBadge } from "@/components/eventra/status-badge";
import { useI18n } from "@/lib/i18n/use-i18n";
import { translateBookingStatus } from "@/lib/i18n/status";

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
  const { locale } = useI18n();

  return <StatusBadge label={translateBookingStatus(status, locale)} tone={bookingToneMap[status]} />;
}
