type QuotaInput = {
  quota: number;
  reservedOrIssued: number;
};

export function getRemainingQuota({ quota, reservedOrIssued }: QuotaInput) {
  return Math.max(quota - reservedOrIssued, 0);
}

export function hasEnoughQuota(input: QuotaInput, requestedQuantity: number) {
  return getRemainingQuota(input) >= requestedQuantity;
}

export function ensureQuotaAvailable(input: QuotaInput, requestedQuantity: number) {
  if (!hasEnoughQuota(input, requestedQuantity)) {
    throw new Error("Insufficient ticket quota for this request.");
  }
}
