export const BOOKING_STATUS_ORDER = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export const PAYMENT_STATUS_ORDER = [
  "UNPAID",
  "WAITING_CONFIRMATION",
  "PAID",
  "FAILED",
  "REFUNDED",
  "NOT_REQUIRED",
] as const;

export const TICKET_STATUS_ORDER = [
  "VALID",
  "USED",
  "CANCELLED",
  "EXPIRED",
] as const;

export function prettyLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toCountRecord<
  T extends {
    _count?: { _all?: number };
    _sum?: { quantity?: number | null };
    [key: string]: unknown;
  },
>(rows: T[], key: keyof T, mode: "count" | "sum" = "count") {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const label = String(row[key]);
    const value =
      mode === "sum"
        ? Number(row._sum?.quantity ?? 0)
        : Number(row._count?._all ?? 0);

    accumulator[label] = value;
    return accumulator;
  }, {});
}

export function buildDistribution(
  order: readonly string[],
  counts: Record<string, number>
) {
  return order.map((label) => ({
    label: prettyLabel(label),
    value: counts[label] ?? 0,
  }));
}
