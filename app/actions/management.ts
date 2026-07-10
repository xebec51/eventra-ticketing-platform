"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { EventStatus } from "@/app/generated/prisma/enums";
import { createActivityLog } from "@/lib/activity-log";
import { requireRole, requireSessionUser } from "@/lib/auth";
import { getOrganizerStatusRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createUniqueSlug, slugify } from "@/lib/slugs";
import {
  categorySchema,
  eventSchema,
} from "@/lib/validations/management";

export type ManagementFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  success?: string;
};

function optionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function toDate(value: string) {
  return new Date(value);
}

async function buildCategorySlug(name: string, currentId?: string) {
  const base = slugify(name);
  const categories = await prisma.eventCategory.findMany({
    where: currentId ? { NOT: { id: currentId } } : undefined,
    select: { slug: true },
  });

  return createUniqueSlug(base, categories.map((category) => category.slug));
}

async function buildEventSlug(title: string, requestedSlug?: string, currentId?: string) {
  const base = slugify(requestedSlug || title);
  const events = await prisma.event.findMany({
    where: currentId ? { NOT: { id: currentId } } : undefined,
    select: { slug: true },
  });

  return createUniqueSlug(base, events.map((event) => event.slug));
}

async function requireOrganizerProfileContext() {
  const user = await requireRole("ORGANIZER");
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, organizationName: true },
  });

  if (!organizerProfile) {
    notFound();
  }

  return { user, organizerProfile };
}

async function getScopedEventForMutation(eventId: string) {
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
    include: {
      ticketTypes: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return { user, organizerProfile, event };
}

async function getEventForStatusAction(eventId: string) {
  const user = await requireSessionUser();

  if (user.role === "ADMIN") {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { isActive: true },
          select: { id: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event) {
      notFound();
    }

    return { user, event };
  }

  if (user.role !== "ORGANIZER") {
    redirect("/unauthorized");
  }

  const organizerRedirect = getOrganizerStatusRedirect(user.status);

  if (organizerRedirect) {
    redirect(organizerRedirect);
  }

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
    include: {
      ticketTypes: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return { user, event };
}

export async function createCategoryAction(
  _: ManagementFormState,
  formData: FormData
): Promise<ManagementFormState> {
  await requireRole("ADMIN");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted category fields.",
    };
  }

  const slug = await buildCategorySlug(
    parsed.data.slug || parsed.data.name
  );

  await prisma.eventCategory.create({
    data: {
      name: parsed.data.name,
      slug,
      description: optionalString(parsed.data.description),
      imageUrl: optionalString(parsed.data.imageUrl),
    },
  });

  await createActivityLog({
    action: "CREATE",
    module: "categories",
    description: `Created event category ${parsed.data.name}.`,
  });

  revalidatePath("/dashboard/admin/categories");

  return { success: "Category created successfully." };
}

export async function updateCategoryAction(formData: FormData) {
  await requireRole("ADMIN");

  const parsed = categorySchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success || !parsed.data.categoryId) {
    return;
  }

  const slug = await buildCategorySlug(
    parsed.data.slug || parsed.data.name,
    parsed.data.categoryId
  );

  await prisma.eventCategory.update({
    where: { id: parsed.data.categoryId },
    data: {
      name: parsed.data.name,
      slug,
      description: optionalString(parsed.data.description),
      imageUrl: optionalString(parsed.data.imageUrl),
    },
  });

  await createActivityLog({
    action: "UPDATE",
    module: "categories",
    description: `Updated event category ${parsed.data.name}.`,
  });

  revalidatePath("/dashboard/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole("ADMIN");

  const categoryId = String(formData.get("categoryId") || "");

  const category = await prisma.eventCategory.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { events: true } } },
  });

  if (!category) {
    return;
  }

  if (category._count.events > 0) {
    redirect("/dashboard/admin/categories?error=category-in-use");
  }

  await prisma.eventCategory.delete({ where: { id: categoryId } });

  await createActivityLog({
    action: "DELETE",
    module: "categories",
    description: `Deleted event category ${category.name}.`,
  });

  revalidatePath("/dashboard/admin/categories");
}

export async function createEventAction(
  _: ManagementFormState,
  formData: FormData
): Promise<ManagementFormState> {
  const { user, organizerProfile } = await requireOrganizerProfileContext();
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    startDatetime: formData.get("startDatetime"),
    endDatetime: formData.get("endDatetime"),
    locationName: formData.get("locationName"),
    locationAddress: formData.get("locationAddress"),
    city: formData.get("city"),
    imageUrl: formData.get("imageUrl"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted event fields.",
    };
  }

  const startDatetime = toDate(parsed.data.startDatetime);
  const endDatetime = toDate(parsed.data.endDatetime);

  if (endDatetime <= startDatetime) {
    return {
      errors: {
        endDatetime: ["End date must be later than the start date."],
      },
      message: "Please fix the highlighted event fields.",
    };
  }

  const slug = await buildEventSlug(parsed.data.title, parsed.data.slug);

  await prisma.event.create({
    data: {
      organizerProfileId: organizerProfile.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      startDatetime,
      endDatetime,
      locationName: parsed.data.locationName,
      locationAddress: optionalString(parsed.data.locationAddress),
      city: parsed.data.city,
      imageUrl: optionalString(parsed.data.imageUrl),
      visibility: parsed.data.visibility,
      status: EventStatus.DRAFT,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "CREATE",
    module: "events",
    description: `Created draft event ${parsed.data.title}.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");

  return { success: "Draft event created successfully." };
}

export async function updateEventAction(
  _: ManagementFormState,
  formData: FormData
): Promise<ManagementFormState> {
  const eventId = String(formData.get("eventId") || "");
  const { user, event } = await getScopedEventForMutation(eventId);
  const parsed = eventSchema.safeParse({
    eventId,
    title: formData.get("title"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    startDatetime: formData.get("startDatetime"),
    endDatetime: formData.get("endDatetime"),
    locationName: formData.get("locationName"),
    locationAddress: formData.get("locationAddress"),
    city: formData.get("city"),
    imageUrl: formData.get("imageUrl"),
    visibility: formData.get("visibility"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted event fields.",
    };
  }

  const startDatetime = toDate(parsed.data.startDatetime);
  const endDatetime = toDate(parsed.data.endDatetime);

  if (endDatetime <= startDatetime) {
    return {
      errors: {
        endDatetime: ["End date must be later than the start date."],
      },
      message: "Please fix the highlighted event fields.",
    };
  }

  const slug = await buildEventSlug(
    parsed.data.title,
    parsed.data.slug,
    event.id
  );

  await prisma.event.update({
    where: { id: event.id },
    data: {
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      startDatetime,
      endDatetime,
      locationName: parsed.data.locationName,
      locationAddress: optionalString(parsed.data.locationAddress),
      city: parsed.data.city,
      imageUrl: optionalString(parsed.data.imageUrl),
      visibility: parsed.data.visibility,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "UPDATE",
    module: "events",
    description: `Updated event ${parsed.data.title}.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath(`/dashboard/organizer/events/${event.id}`);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);

  return { success: "Event details updated successfully." };
}

export async function publishEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const { user, event } = await getEventForStatusAction(eventId);

  if (event.ticketTypes.length === 0) {
    redirect(
      user.role === "ADMIN"
        ? "/dashboard/admin/events?error=missing-ticket-types"
        : `/dashboard/organizer/events/${eventId}?error=missing-ticket-types`
    );
  }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      status: EventStatus.PUBLISHED,
      publishedAt: event.publishedAt ?? new Date(),
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "PUBLISH",
    module: "events",
    description: `Published event ${event.title}.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath(`/dashboard/organizer/events/${event.id}`);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
}

export async function unpublishEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const { user, event } = await getEventForStatusAction(eventId);

  await prisma.event.update({
    where: { id: event.id },
    data: {
      status: EventStatus.DRAFT,
      publishedAt: null,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "UNPUBLISH",
    module: "events",
    description: `Moved event ${event.title} back to draft.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath(`/dashboard/organizer/events/${event.id}`);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
}

export async function cancelEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const { user, event } = await getEventForStatusAction(eventId);

  await prisma.event.update({
    where: { id: event.id },
    data: { status: EventStatus.CANCELLED },
  });

  await createActivityLog({
    userId: user.id,
    action: "CANCEL",
    module: "events",
    description: `Cancelled event ${event.title}.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath(`/dashboard/organizer/events/${event.id}`);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
}

export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const { user, event } = await getScopedEventForMutation(eventId);

  if (event._count.bookings > 0) {
    redirect(`/dashboard/organizer/events/${event.id}?error=event-has-bookings`);
  }

  await prisma.event.delete({ where: { id: event.id } });

  await createActivityLog({
    userId: user.id,
    action: "DELETE",
    module: "events",
    description: `Deleted draft event ${event.title}.`,
  });

  revalidatePath("/dashboard/organizer/events");
  revalidatePath("/dashboard/admin/events");
  redirect("/dashboard/organizer/events");
}
