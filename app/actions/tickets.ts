"use server";

import { revalidatePath } from "next/cache";

import { TicketStatus } from "@/app/generated/prisma/enums";
import { createActivityLog } from "@/lib/activity-log";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CheckInFormState = {
  message?: string;
  success?: string;
  ticketCode?: string;
  attendeeName?: string;
  eventTitle?: string;
  checkedInAt?: string;
};

const initialState: CheckInFormState = {};

export async function checkInTicketAction(
  previousState: CheckInFormState = initialState,
  formData: FormData
): Promise<CheckInFormState> {
  void previousState;
  const user = await requireSessionUser();
  const ticketCode = String(formData.get("ticketCode") || "").trim().toUpperCase();

  if (!ticketCode) {
    return { message: "Enter a ticket code before checking in." };
  }

  if (!["ADMIN", "ORGANIZER"].includes(user.role)) {
    return { message: "Only admins or organizers can check in tickets." };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerProfile: {
            select: { userId: true },
          },
        },
      },
      user: {
        select: { name: true },
      },
    },
  });

  if (!ticket) {
    return { message: "Ticket code not found." };
  }

  if (
    user.role === "ORGANIZER" &&
    ticket.event.organizerProfile.userId !== user.id
  ) {
    return {
      message: "You can only check in attendees for events owned by your organizer account.",
    };
  }

  if (ticket.status !== TicketStatus.VALID) {
    return {
      message:
        ticket.status === TicketStatus.USED
          ? `Ticket ${ticket.ticketCode} has already been checked in.`
          : `Ticket ${ticket.ticketCode} is not eligible for check-in because it is ${ticket.status}.`,
    };
  }

  const checkedInAt = new Date();

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: TicketStatus.USED,
      checkedInAt,
      checkedInBy: user.id,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "CHECK_IN",
    module: "tickets",
    description: `Checked in ticket ${ticket.ticketCode} for ${ticket.event.title}.`,
  });

  revalidatePath("/dashboard/organizer/check-in");
  revalidatePath("/dashboard/user/tickets");
  revalidatePath(`/verify/${ticket.ticketCode}`);

  return {
    success: `Ticket ${ticket.ticketCode} checked in successfully.`,
    ticketCode: ticket.ticketCode,
    attendeeName: ticket.user.name,
    eventTitle: ticket.event.title,
    checkedInAt: checkedInAt.toISOString(),
  };
}
