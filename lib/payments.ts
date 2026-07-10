import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/generated/prisma/enums";

type InitialBookingState = {
  status: keyof typeof BookingStatus;
  paymentStatus: keyof typeof PaymentStatus;
  expiresAt: Date | null;
  autoApprove: boolean;
  requiresProofUpload: boolean;
};

type BookingApprovalInput = {
  totalAmount: number;
  paymentMethod: keyof typeof PaymentMethod;
  paymentStatus: keyof typeof PaymentStatus;
};

const EXPIRY_WINDOW_HOURS = 24;

export function createInitialBookingState(
  totalAmount: number,
  paymentMethod: keyof typeof PaymentMethod,
  now = new Date()
): InitialBookingState {
  if (totalAmount === 0 && paymentMethod === PaymentMethod.FREE) {
    return {
      status: BookingStatus.APPROVED,
      paymentStatus: PaymentStatus.NOT_REQUIRED,
      expiresAt: null,
      autoApprove: true,
      requiresProofUpload: false,
    };
  }

  if (paymentMethod === PaymentMethod.CASH_ON_VENUE) {
    return {
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.NOT_REQUIRED,
      expiresAt: null,
      autoApprove: false,
      requiresProofUpload: false,
    };
  }

  return {
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    expiresAt: new Date(now.getTime() + EXPIRY_WINDOW_HOURS * 60 * 60 * 1000),
    autoApprove: false,
    requiresProofUpload: true,
  };
}

export function validatePaymentMethod(
  totalAmount: number,
  paymentMethod: keyof typeof PaymentMethod
) {
  if (totalAmount === 0 && paymentMethod !== PaymentMethod.FREE) {
    throw new Error("Free bookings must use the FREE payment method.");
  }

  if (totalAmount > 0 && paymentMethod === PaymentMethod.FREE) {
    throw new Error("Paid bookings cannot use the FREE payment method.");
  }
}

export function canApproveBooking({
  totalAmount,
  paymentMethod,
  paymentStatus,
}: BookingApprovalInput) {
  if (totalAmount === 0 && paymentMethod === PaymentMethod.FREE) {
    return true;
  }

  if (paymentMethod === PaymentMethod.CASH_ON_VENUE) {
    return true;
  }

  return paymentStatus === PaymentStatus.PAID;
}

export function isBookingExpired({
  status,
  paymentStatus,
  expiresAt,
  now = new Date(),
}: {
  status: keyof typeof BookingStatus;
  paymentStatus: keyof typeof PaymentStatus;
  expiresAt: Date | null;
  now?: Date;
}) {
  return (
    status === BookingStatus.PENDING &&
    paymentStatus === PaymentStatus.UNPAID &&
    !!expiresAt &&
    expiresAt.getTime() < now.getTime()
  );
}
