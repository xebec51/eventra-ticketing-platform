import * as XLSX from "xlsx";

import { prisma } from "@/lib/prisma";

type ExportUser = {
  id: string;
  role: "ADMIN" | "ORGANIZER" | "USER";
};

function buildScope(user: ExportUser, eventId?: string) {
  if (user.role === "ADMIN") {
    return eventId ? { eventId } : {};
  }

  if (user.role === "ORGANIZER") {
    return {
      ...(eventId ? { eventId } : {}),
      event: {
        organizerProfile: {
          userId: user.id,
        },
      },
    };
  }

  return null;
}

export async function getBookingExportRows(user: ExportUser, eventId?: string) {
  const scope = buildScope(user, eventId);

  if (!scope) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: scope,
    include: {
      user: {
        select: { name: true, email: true },
      },
      event: {
        select: { title: true, city: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings.map((booking) => ({
    bookingCode: booking.bookingCode,
    attendeeName: booking.user.name,
    attendeeEmail: booking.user.email,
    eventTitle: booking.event.title,
    city: booking.event.city,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    totalAmount: booking.totalAmount.toNumber(),
    createdAt: booking.createdAt.toISOString(),
    approvedAt: booking.approvedAt?.toISOString() ?? "",
    paymentVerifiedAt: booking.paymentVerifiedAt?.toISOString() ?? "",
    expiresAt: booking.expiresAt?.toISOString() ?? "",
    notes: booking.notes ?? "",
  }));
}

export async function getAttendeeExportRows(user: ExportUser, eventId?: string) {
  const scope = buildScope(user, eventId);

  if (!scope) {
    return null;
  }

  const tickets = await prisma.ticket.findMany({
    where: scope,
    include: {
      user: {
        select: { name: true, email: true },
      },
      event: {
        select: { title: true, city: true },
      },
      ticketType: {
        select: { name: true },
      },
      booking: {
        select: {
          bookingCode: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tickets.map((ticket) => ({
    ticketCode: ticket.ticketCode,
    attendeeName: ticket.user.name,
    attendeeEmail: ticket.user.email,
    eventTitle: ticket.event.title,
    city: ticket.event.city,
    ticketType: ticket.ticketType.name,
    ticketStatus: ticket.status,
    bookingCode: ticket.booking.bookingCode,
    paymentStatus: ticket.booking.paymentStatus,
    checkedInAt: ticket.checkedInAt?.toISOString() ?? "",
  }));
}

export function buildWorkbookBuffer(
  sheetName: string,
  rows: Record<string, string | number>[]
) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
}
