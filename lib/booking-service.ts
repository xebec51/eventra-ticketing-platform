import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateBookingCode, generateTicketCode } from "@/lib/codes";
import { buildQrPayload } from "@/lib/qr";

type QuotaClient = Pick<typeof prisma, "$queryRaw" | "bookingItem">;
type BookingClient = Pick<typeof prisma, "$queryRaw" | "booking" | "bookingItem">;

async function createUniqueCode(
  generator: () => string,
  model: "booking" | "ticket"
) {
  let code = generator();

  // Low collision risk, but guard to keep unique constraints smooth in dev data.
  while (true) {
    const existing =
      model === "booking"
        ? await prisma.booking.findUnique({
            where: { bookingCode: code },
            select: { id: true },
          })
        : await prisma.ticket.findUnique({
            where: { ticketCode: code },
            select: { id: true },
          });

    if (!existing) {
      return code;
    }

    code = generator();
  }
}

export async function createUniqueBookingCode() {
  return createUniqueCode(generateBookingCode, "booking");
}

export async function createUniqueTicketCode() {
  return createUniqueCode(generateTicketCode, "ticket");
}

export async function lockTicketTypesForUpdate(
  client: Pick<typeof prisma, "$queryRaw">,
  ticketTypeIds: string[]
) {
  if (ticketTypeIds.length === 0) {
    return;
  }

  await client.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM ticket_types
    WHERE id IN (${Prisma.join(ticketTypeIds)})
    FOR UPDATE
  `;
}

export async function getReservedQuantities(
  ticketTypeIds: string[],
  client: QuotaClient = prisma
) {
  if (ticketTypeIds.length === 0) {
    return new Map<string, number>();
  }

  const reservations = await client.bookingItem.groupBy({
    by: ["ticketTypeId"],
    _sum: { quantity: true },
    where: {
      ticketTypeId: { in: ticketTypeIds },
      booking: {
        status: {
          in: [BookingStatus.PENDING, BookingStatus.APPROVED],
        },
      },
    },
  });

  return new Map(
    reservations.map((entry) => [entry.ticketTypeId, entry._sum.quantity ?? 0])
  );
}

export async function generateTicketsForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      items: true,
      event: { select: { id: true } },
      tickets: { select: { id: true } },
    },
  });

  if (!booking || booking.status !== BookingStatus.APPROVED) {
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

  for (const item of booking.items) {
    const existingTickets = await prisma.ticket.count({
      where: { bookingItemId: item.id },
    });

    const missingTickets = item.quantity - existingTickets;

    for (let index = 0; index < missingTickets; index += 1) {
      const ticketCode = await createUniqueTicketCode();

      await prisma.ticket.create({
        data: {
          ticketCode,
          bookingId: booking.id,
          bookingItemId: item.id,
          eventId: booking.eventId,
          userId: booking.userId,
          ticketTypeId: item.ticketTypeId,
          qrPayload: buildQrPayload(ticketCode, appUrl),
        },
      });
    }
  }
}

export async function expirePendingBookings() {
  await prisma.booking.updateMany({
    where: {
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      expiresAt: { lt: new Date() },
    },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledReason: "Payment deadline expired",
      cancelledAt: new Date(),
    },
  });
}

export async function approveBooking({
  bookingId,
  approverId,
}: {
  bookingId: string;
  approverId: string;
}) {
  await prisma.$transaction(
    async (tx: BookingClient) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          items: {
            include: {
              ticketType: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error("Booking not found.");
      }

      if (
        booking.paymentMethod === PaymentMethod.BANK_TRANSFER ||
        booking.paymentMethod === PaymentMethod.E_WALLET
      ) {
        if (booking.paymentStatus !== PaymentStatus.PAID) {
          throw new Error("Paid bookings must be marked PAID before approval.");
        }
      }

      if (
        booking.paymentMethod === PaymentMethod.FREE &&
        booking.totalAmount.toNumber() !== 0
      ) {
        throw new Error(
          "FREE payment method is only valid for zero-value bookings."
        );
      }

      const ticketTypeIds = booking.items.map((item) => item.ticketTypeId);

      await lockTicketTypesForUpdate(tx, ticketTypeIds);

      const reservedMap = await getReservedQuantities(ticketTypeIds, tx);

      for (const item of booking.items) {
        const reserved = reservedMap.get(item.ticketTypeId) ?? 0;

        if (reserved > item.ticketType.quota) {
          throw new Error(
            `Ticket quota exceeded for ${item.ticketType.name}. Please review inventory before approving this booking.`
          );
        }
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: approverId,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  await generateTicketsForBooking(bookingId);
}
