"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { createActivityLog } from "@/lib/activity-log";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketTypeSchema } from "@/lib/validations/ticket-types";

export type TicketTypeFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  success?: string;
};

function toNullableDate(value?: string) {
  return value ? new Date(value) : null;
}

async function getOrganizerEventContext(eventId: string) {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerProfileId: organizerProfile.id,
    },
    select: { id: true, title: true },
  });

  if (!event) {
    notFound();
  }

  return { user, event };
}

async function getScopedTicketType(ticketTypeId: string) {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticketTypeId,
      event: {
        organizerProfileId: organizerProfile.id,
      },
    },
    include: {
      event: { select: { id: true, title: true } },
      _count: { select: { bookingItems: true } },
    },
  });

  if (!ticketType) {
    notFound();
  }

  return { user, ticketType };
}

export async function createTicketTypeAction(
  _: TicketTypeFormState,
  formData: FormData
): Promise<TicketTypeFormState> {
  await requireRole("ORGANIZER");

  const parsed = ticketTypeSchema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    quota: formData.get("quota"),
    maxPerBooking: formData.get("maxPerBooking"),
    salesStartAt: formData.get("salesStartAt"),
    salesEndAt: formData.get("salesEndAt"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  const { user, event } = await getOrganizerEventContext(parsed.data.eventId);
  const salesStartAt = toNullableDate(parsed.data.salesStartAt);
  const salesEndAt = toNullableDate(parsed.data.salesEndAt);

  if (salesStartAt && salesEndAt && salesEndAt <= salesStartAt) {
    return {
      errors: {
        salesEndAt: ["Sales end time must be later than the sales start time."],
      },
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  const duplicate = await prisma.ticketType.findFirst({
    where: {
      eventId: event.id,
      name: parsed.data.name,
    },
    select: { id: true },
  });

  if (duplicate) {
    return {
      errors: { name: ["A ticket type with this name already exists for the event."] },
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      price: parsed.data.price,
      quota: parsed.data.quota,
      maxPerBooking: parsed.data.maxPerBooking,
      salesStartAt,
      salesEndAt,
      isActive: parsed.data.isActive ?? true,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "CREATE",
    module: "ticket-types",
    description: `Created ticket type ${parsed.data.name} for ${event.title}.`,
  });

  revalidatePath(`/dashboard/organizer/events/${event.id}`);
  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");

  return { success: "Ticket type created successfully." };
}

export async function updateTicketTypeAction(
  _: TicketTypeFormState,
  formData: FormData
): Promise<TicketTypeFormState> {
  await requireRole("ORGANIZER");

  const parsed = ticketTypeSchema.safeParse({
    eventId: formData.get("eventId"),
    ticketTypeId: formData.get("ticketTypeId"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    quota: formData.get("quota"),
    maxPerBooking: formData.get("maxPerBooking"),
    salesStartAt: formData.get("salesStartAt"),
    salesEndAt: formData.get("salesEndAt"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success || !parsed.data.ticketTypeId) {
    return {
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  const { user, ticketType } = await getScopedTicketType(parsed.data.ticketTypeId);
  const salesStartAt = toNullableDate(parsed.data.salesStartAt);
  const salesEndAt = toNullableDate(parsed.data.salesEndAt);

  if (salesStartAt && salesEndAt && salesEndAt <= salesStartAt) {
    return {
      errors: {
        salesEndAt: ["Sales end time must be later than the sales start time."],
      },
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  const duplicate = await prisma.ticketType.findFirst({
    where: {
      eventId: ticketType.eventId,
      name: parsed.data.name,
      NOT: { id: ticketType.id },
    },
    select: { id: true },
  });

  if (duplicate) {
    return {
      errors: { name: ["A ticket type with this name already exists for the event."] },
      message: "Please fix the highlighted ticket type fields.",
    };
  }

  await prisma.ticketType.update({
    where: { id: ticketType.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      price: parsed.data.price,
      quota: parsed.data.quota,
      maxPerBooking: parsed.data.maxPerBooking,
      salesStartAt,
      salesEndAt,
      isActive: parsed.data.isActive ?? false,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "UPDATE",
    module: "ticket-types",
    description: `Updated ticket type ${parsed.data.name} for ${ticketType.event.title}.`,
  });

  revalidatePath(`/dashboard/organizer/events/${ticketType.event.id}`);
  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");

  return { success: "Ticket type updated successfully." };
}

export async function toggleTicketTypeAction(formData: FormData) {
  await requireRole("ORGANIZER");
  const ticketTypeId = String(formData.get("ticketTypeId") || "");
  const nextActive = String(formData.get("nextActive")) === "true";
  const { user, ticketType } = await getScopedTicketType(ticketTypeId);

  await prisma.ticketType.update({
    where: { id: ticketType.id },
    data: { isActive: nextActive },
  });

  await createActivityLog({
    userId: user.id,
    action: nextActive ? "ACTIVATE" : "DEACTIVATE",
    module: "ticket-types",
    description: `${nextActive ? "Activated" : "Deactivated"} ticket type ${ticketType.name}.`,
  });

  revalidatePath(`/dashboard/organizer/events/${ticketType.event.id}`);
  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");
}

export async function deleteTicketTypeAction(formData: FormData) {
  await requireRole("ORGANIZER");
  const ticketTypeId = String(formData.get("ticketTypeId") || "");
  const { user, ticketType } = await getScopedTicketType(ticketTypeId);

  if (ticketType._count.bookingItems > 0) {
    await prisma.ticketType.update({
      where: { id: ticketType.id },
      data: { isActive: false },
    });

    await createActivityLog({
      userId: user.id,
      action: "DEACTIVATE",
      module: "ticket-types",
      description: `Deactivated ticket type ${ticketType.name} because bookings already exist.`,
    });

    revalidatePath(`/dashboard/organizer/events/${ticketType.event.id}`);
    revalidatePath("/dashboard/organizer/events");
    revalidatePath("/dashboard/admin/events");
    redirect(
      `/dashboard/organizer/events/${ticketType.event.id}?notice=deactivated-ticket-type`
    );
  }

  await prisma.ticketType.delete({ where: { id: ticketType.id } });

  await createActivityLog({
    userId: user.id,
    action: "DELETE",
    module: "ticket-types",
    description: `Deleted ticket type ${ticketType.name}.`,
  });

  revalidatePath(`/dashboard/organizer/events/${ticketType.event.id}`);
  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");
}
