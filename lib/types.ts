export type UserRole = "ADMIN" | "ORGANIZER" | "USER";

export type UserStatus = "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type EventVisibility = "PUBLIC" | "PRIVATE";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "WAITING_CONFIRMATION"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "NOT_REQUIRED";

export type PaymentMethod =
  | "BANK_TRANSFER"
  | "E_WALLET"
  | "CASH_ON_VENUE"
  | "FREE";

export type TicketStatus = "VALID" | "USED" | "CANCELLED" | "EXPIRED";

export type EventCategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  eventCount: number;
};

export type EventSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  locationName: string;
  startDate: string;
  endDate: string;
  priceLabel: string;
  priceValue: number;
  attendees: number;
  favorites: number;
  rating: number;
  status: EventStatus;
  imageAccent: string;
  excerpt: string;
  featured?: boolean;
};

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type DashboardTableRow = Record<string, string>;
