"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { createActivityLog } from "@/lib/activity-log";
import {
  approveBooking,
  createUniqueBookingCode,
  expirePendingBookings,
  generateTicketsForBooking,
  getReservedQuantities,
  lockTicketTypesForUpdate,
} from "@/lib/booking-service";
import { requireRole, requireSessionUser } from "@/lib/auth";
import {
  canApproveBooking,
  createInitialBookingState,
  isBookingExpired,
  validatePaymentMethod,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { withSerializableRetry } from "@/lib/prisma-transaction";

export type BookingFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function parseQuantities(formData: FormData) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("quantity_"))
    .map(([key, value]) => ({
      ticketTypeId: key.replace("quantity_", ""),
      quantity: Number(value),
    }))
    .filter((entry) => Number.isFinite(entry.quantity) && entry.quantity > 0);
}

async function getScopedOperatorBooking(bookingId: string) {
  const user = await requireSessionUser();

  if (user.role === "ADMIN") {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            title: true,
            organizerProfileId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    return { user, booking };
  }

  const organizer = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: organizer.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    throw new Error("Organizer profile not found.");
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      event: {
        organizerProfileId: organizerProfile.id,
      },
    },
    include: {
      event: { select: { title: true, organizerProfileId: true } },
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  return { user: organizer, booking };
}

export async function createBookingAction(
  _: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const user = await requireRole("USER");
  const eventId = String(formData.get("eventId") || "");
  const paymentMethod = String(formData.get("paymentMethod") || "") as PaymentMethod;
  const notes = String(formData.get("notes") || "").trim();
  const quantities = parseQuantities(formData);

  if (quantities.length === 0) {
    return {
      message: "Choose at least one ticket quantity before continuing.",
    };
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!event) {
    return { message: "This event is no longer available for booking." };
  }

  const bookingCode = await createUniqueBookingCode();
  const selectedTicketTypeIds = [
    ...new Set(quantities.map((entry) => entry.ticketTypeId)),
  ];

  const bookingResult = await withSerializableRetry(() =>
    prisma.$transaction(
      async (tx) => {
      await lockTicketTypesForUpdate(tx, selectedTicketTypeIds);

      const ticketTypes = await tx.ticketType.findMany({
        where: {
          id: { in: selectedTicketTypeIds },
          eventId: event.id,
          isActive: true,
        },
      });

      const activeTicketTypes = new Map(
        ticketTypes.map((ticketType) => [ticketType.id, ticketType])
      );
      const selectedItems = quantities
        .map((entry) => ({
          ...entry,
          ticketType: activeTicketTypes.get(entry.ticketTypeId),
        }))
        .filter((entry) => !!entry.ticketType);

      if (selectedItems.length === 0) {
        return {
          ok: false as const,
          state: { message: "No valid ticket types were selected." },
        };
      }

      const reservedMap = await getReservedQuantities(
        selectedItems.map((item) => item.ticketTypeId),
        tx
      );
      const now = new Date();

      for (const item of selectedItems) {
        if (!item.ticketType) {
          continue;
        }

        if (
          item.ticketType.salesStartAt &&
          item.ticketType.salesStartAt.getTime() > now.getTime()
        ) {
          return {
            ok: false as const,
            state: { message: `${item.ticketType.name} is not on sale yet.` },
          };
        }

        if (
          item.ticketType.salesEndAt &&
          item.ticketType.salesEndAt.getTime() < now.getTime()
        ) {
          return {
            ok: false as const,
            state: { message: `${item.ticketType.name} is no longer on sale.` },
          };
        }

        if (item.quantity > item.ticketType.maxPerBooking) {
          return {
            ok: false as const,
            state: {
              message: `${item.ticketType.name} exceeds the max per booking limit.`,
            },
          };
        }

        const reserved = reservedMap.get(item.ticketTypeId) ?? 0;
        if (reserved + item.quantity > item.ticketType.quota) {
          return {
            ok: false as const,
            state: {
              message: `${item.ticketType.name} does not have enough remaining quota.`,
            },
          };
        }
      }

      const totalAmount = selectedItems.reduce((sum, item) => {
        return sum + item.quantity * item.ticketType!.price.toNumber();
      }, 0);

      try {
        validatePaymentMethod(totalAmount, paymentMethod);
      } catch (error) {
        return {
          ok: false as const,
          state: {
            message:
              error instanceof Error ? error.message : "Invalid payment method.",
          },
        };
      }

      const initialState = createInitialBookingState(totalAmount, paymentMethod);
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId: user.id,
          eventId: event.id,
          status: initialState.status,
          paymentStatus: initialState.paymentStatus,
          paymentMethod,
          totalAmount,
          notes: notes || undefined,
          expiresAt: initialState.expiresAt,
          approvedAt: initialState.autoApprove ? new Date() : undefined,
          approvedBy: initialState.autoApprove ? user.id : undefined,
          items: {
            create: selectedItems.map((item) => ({
              ticketTypeId: item.ticketTypeId,
              quantity: item.quantity,
              unitPrice: item.ticketType!.price,
              subtotal: item.quantity * item.ticketType!.price.toNumber(),
            })),
          },
        },
        select: {
          id: true,
          bookingCode: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "CREATE",
          module: "bookings",
          description: `Created booking ${booking.bookingCode} for ${event.title}.`,
        },
      });

      return {
        ok: true as const,
        autoApprove: initialState.autoApprove,
        bookingId: booking.id,
      };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
  );

  if (!bookingResult.ok) {
    return bookingResult.state;
  }

  if (bookingResult.autoApprove) {
    await generateTicketsForBooking(bookingResult.bookingId);
  }

  revalidatePath(`/dashboard/user/bookings/${bookingResult.bookingId}`);
  revalidatePath("/dashboard/user/bookings");
  redirect(`/dashboard/user/bookings/${bookingResult.bookingId}`);
}

export async function submitPaymentProofAction(
  _: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const user = await requireRole("USER");
  const bookingId = String(formData.get("bookingId") || "");
  const paymentProofUrl = String(formData.get("paymentProofUrl") || "").trim();

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
    },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      expiresAt: true,
    },
  });

  if (!booking) {
    return { message: "Booking not found." };
  }

  if (
    booking.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
    booking.paymentMethod !== PaymentMethod.E_WALLET
  ) {
    return { message: "This booking does not require payment proof upload." };
  }

  if (!paymentProofUrl.startsWith("http")) {
    return { message: "Enter a valid payment proof URL." };
  }

  if (booking.status !== BookingStatus.PENDING) {
    return { message: "Only pending bookings can accept payment proof uploads." };
  }

  if (
    booking.paymentStatus !== PaymentStatus.UNPAID &&
    booking.paymentStatus !== PaymentStatus.FAILED &&
    booking.paymentStatus !== PaymentStatus.WAITING_CONFIRMATION
  ) {
    return { message: "This booking is no longer accepting payment proof updates." };
  }

  if (
    isBookingExpired({
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      expiresAt: booking.expiresAt,
    })
  ) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledReason: "Payment deadline expired",
        cancelledAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/user/bookings/${booking.id}`);
    revalidatePath("/dashboard/user/bookings");

    return { message: "This booking already expired before the proof was uploaded." };
  }

  const proofUpdate = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      status: BookingStatus.PENDING,
      paymentStatus: {
        in: [
          PaymentStatus.UNPAID,
          PaymentStatus.FAILED,
          PaymentStatus.WAITING_CONFIRMATION,
        ],
      },
    },
    data: {
      paymentProofUrl,
      paymentStatus: PaymentStatus.WAITING_CONFIRMATION,
      paymentNotes: null,
    },
  });

  if (proofUpdate.count === 0) {
    return { message: "This booking is no longer accepting payment proof updates." };
  }

  await createActivityLog({
    userId: user.id,
    action: "SUBMIT_PAYMENT_PROOF",
    module: "payments",
    description: `Submitted payment proof for booking ${booking.bookingCode}.`,
  });

  revalidatePath(`/dashboard/user/bookings/${booking.id}`);
  revalidatePath("/dashboard/user/bookings");

  return { message: "Payment proof submitted successfully." };
}

export async function verifyPaymentAction(formData: FormData) {
  await requireSessionUser();
  const bookingId = String(formData.get("bookingId") || "");
  const paymentNotes = String(formData.get("paymentNotes") || "").trim();
  const { user, booking } = await getScopedOperatorBooking(bookingId);

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Only pending bookings can be verified.");
  }

  if (
    booking.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
    booking.paymentMethod !== PaymentMethod.E_WALLET
  ) {
    throw new Error("Only manual transfer bookings can be verified.");
  }

  if (booking.paymentStatus !== PaymentStatus.WAITING_CONFIRMATION) {
    throw new Error("This booking is not currently waiting for confirmation.");
  }

  const paymentUpdate = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.WAITING_CONFIRMATION,
    },
    data: {
      paymentStatus: PaymentStatus.PAID,
      paymentVerifiedAt: new Date(),
      paymentVerifiedBy: user.id,
      paymentNotes: paymentNotes || undefined,
    },
  });

  if (paymentUpdate.count === 0) {
    throw new Error("This payment has already been processed.");
  }

  const approval = await approveBooking({
    bookingId: booking.id,
    approverId: user.id,
  });

  if (approval.approved) {
    await createActivityLog({
      userId: user.id,
      action: "VERIFY_PAYMENT",
      module: "payments",
      description: `Verified payment and approved booking ${booking.bookingCode}.`,
    });
  }

  revalidatePath(`/dashboard/user/bookings/${booking.id}`);
  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/organizer/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/organizer/bookings");
  revalidatePath("/dashboard/user/tickets");
}

export async function failPaymentVerificationAction(formData: FormData) {
  await requireSessionUser();
  const bookingId = String(formData.get("bookingId") || "");
  const paymentNotes = String(formData.get("paymentNotes") || "").trim();
  const { user, booking } = await getScopedOperatorBooking(bookingId);

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Only pending bookings can have payment verification failed.");
  }

  if (
    booking.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
    booking.paymentMethod !== PaymentMethod.E_WALLET
  ) {
    throw new Error("This booking does not use a proof-based payment method.");
  }

  const failureUpdate = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.WAITING_CONFIRMATION,
    },
    data: {
      paymentStatus: PaymentStatus.FAILED,
      paymentNotes: paymentNotes || "Invalid payment proof.",
    },
  });

  if (failureUpdate.count === 0) {
    throw new Error("This payment has already been processed.");
  }

  await createActivityLog({
    userId: user.id,
    action: "FAIL_PAYMENT",
    module: "payments",
    description: `Marked payment verification as failed for booking ${booking.bookingCode}.`,
  });

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/organizer/payments");
  revalidatePath(`/dashboard/user/bookings/${booking.id}`);
}

export async function approveCashBookingAction(formData: FormData) {
  await requireSessionUser();
  const bookingId = String(formData.get("bookingId") || "");
  const { user, booking } = await getScopedOperatorBooking(bookingId);

  if (
    booking.status !== BookingStatus.PENDING ||
    booking.paymentMethod !== PaymentMethod.CASH_ON_VENUE ||
    !canApproveBooking({
      totalAmount: booking.totalAmount.toNumber(),
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
    })
  ) {
    throw new Error("This booking is not eligible for cash-on-venue approval.");
  }

  const approval = await approveBooking({
    bookingId: booking.id,
    approverId: user.id,
  });

  if (approval.approved) {
    await createActivityLog({
      userId: user.id,
      action: "APPROVE_BOOKING",
      module: "bookings",
      description: `Approved cash-on-venue booking ${booking.bookingCode}.`,
    });
  }

  revalidatePath(`/dashboard/user/bookings/${booking.id}`);
  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/organizer/payments");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/organizer/bookings");
  revalidatePath("/dashboard/user/tickets");
}

export async function rejectBookingAction(formData: FormData) {
  await requireSessionUser();
  const bookingId = String(formData.get("bookingId") || "");
  const rejectedReason =
    String(formData.get("rejectedReason") || "").trim() || "Rejected by organizer.";
  const { user, booking } = await getScopedOperatorBooking(bookingId);

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Only pending bookings can be rejected.");
  }

  const rejection = await prisma.booking.updateMany({
    where: { id: booking.id, status: BookingStatus.PENDING },
    data: {
      status: BookingStatus.REJECTED,
      rejectedReason,
      rejectedAt: new Date(),
      paymentStatus:
        booking.paymentMethod === PaymentMethod.CASH_ON_VENUE
          ? booking.paymentStatus
          : PaymentStatus.FAILED,
      paymentNotes:
        booking.paymentMethod === PaymentMethod.CASH_ON_VENUE
          ? booking.paymentNotes
          : rejectedReason,
    },
  });

  if (rejection.count === 0) {
    throw new Error("This booking has already been processed.");
  }

  await createActivityLog({
    userId: user.id,
    action: "REJECT_BOOKING",
    module: "bookings",
    description: `Rejected booking ${booking.bookingCode}.`,
  });

  revalidatePath(`/dashboard/user/bookings/${booking.id}`);
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/organizer/bookings");
  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/organizer/payments");
}

export async function runBookingExpirySyncAction() {
  await requireSessionUser();
  await expirePendingBookings();
  revalidatePath("/events");
  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/organizer/bookings");
  revalidatePath("/dashboard/user/bookings");
}
