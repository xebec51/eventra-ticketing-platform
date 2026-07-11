import type {
  BookingStatus,
  EventStatus,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
  UserRole,
  UserStatus,
} from "@/lib/types";
import { defaultLocale, type Locale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/dictionary";

export function translateRole(role: UserRole, locale: Locale = defaultLocale) {
  return translate(locale, `roles.${role}`);
}

export function translateUserStatus(status: UserStatus, locale: Locale = defaultLocale) {
  return translate(locale, `status.user.${status}`);
}

export function translateBookingStatus(status: BookingStatus, locale: Locale = defaultLocale) {
  return translate(locale, `status.booking.${status}`);
}

export function translatePaymentStatus(status: PaymentStatus, locale: Locale = defaultLocale) {
  return translate(locale, `status.payment.${status}`);
}

export function translateTicketStatus(status: TicketStatus, locale: Locale = defaultLocale) {
  return translate(locale, `status.ticket.${status}`);
}

export function translateEventStatus(status: EventStatus, locale: Locale = defaultLocale) {
  return translate(locale, `status.event.${status}`);
}

export function translatePaymentMethod(method: PaymentMethod, locale: Locale = defaultLocale) {
  return translate(locale, `status.paymentMethod.${method}`);
}
