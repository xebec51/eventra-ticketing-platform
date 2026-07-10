const currencyFormatter = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-SG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-SG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value));
}

export function formatShortDate(value: Date | string) {
  return shortDateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-SG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
