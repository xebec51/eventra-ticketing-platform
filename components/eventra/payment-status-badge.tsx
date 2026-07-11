"use client";

import type { PaymentStatus } from "@/lib/types";

import { StatusBadge } from "@/components/eventra/status-badge";
import { useI18n } from "@/lib/i18n/use-i18n";
import { translatePaymentStatus } from "@/lib/i18n/status";

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
  const { locale } = useI18n();

  return <StatusBadge label={translatePaymentStatus(status, locale)} tone={paymentToneMap[status]} />;
}
