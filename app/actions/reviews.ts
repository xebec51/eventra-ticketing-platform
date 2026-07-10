"use server";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/lib/activity-log";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/reviews";

export type ReviewFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  success?: string;
};

function optionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export async function createReviewAction(
  _: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await requireRole("USER");
  const parsed = reviewSchema.safeParse({
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted review fields.",
    };
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: parsed.data.bookingId,
      userId: user.id,
      status: "APPROVED",
    },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          endDatetime: true,
        },
      },
      tickets: {
        select: { status: true },
      },
      review: {
        select: { id: true },
      },
    },
  });

  if (!booking) {
    return { message: "Booking not found or not eligible for review." };
  }

  if (booking.event.endDatetime.getTime() > Date.now()) {
    return { message: "You can only review events after they have ended." };
  }

  if (!booking.tickets.some((ticket) => ticket.status === "USED")) {
    return {
      message: "A used ticket is required before this event can be reviewed.",
    };
  }

  if (booking.review) {
    return { message: "This booking has already been reviewed." };
  }

  const existingReview = await prisma.eventReview.findFirst({
    where: {
      userId: user.id,
      eventId: booking.event.id,
    },
    select: { id: true },
  });

  if (existingReview) {
    return { message: "You have already reviewed this event." };
  }

  await prisma.eventReview.create({
    data: {
      userId: user.id,
      eventId: booking.event.id,
      bookingId: booking.id,
      rating: parsed.data.rating,
      comment: optionalString(parsed.data.comment),
      isVisible: true,
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "CREATE_REVIEW",
    module: "reviews",
    description: `Submitted review for ${booking.event.title}.`,
  });

  revalidatePath("/dashboard/user/reviews");
  revalidatePath(`/events/${booking.event.slug}`);

  return { success: "Review submitted successfully." };
}

export async function toggleReviewVisibilityAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const reviewId = String(formData.get("reviewId") || "");
  const nextVisibility = String(formData.get("nextVisibility") || "") === "true";

  const review = await prisma.eventReview.update({
    where: { id: reviewId },
    data: { isVisible: nextVisibility },
    include: {
      event: {
        select: { slug: true, title: true },
      },
      user: {
        select: { name: true },
      },
    },
  });

  await createActivityLog({
    userId: admin.id,
    action: nextVisibility ? "SHOW_REVIEW" : "HIDE_REVIEW",
    module: "reviews",
    description: `${nextVisibility ? "Made" : "Hid"} review from ${review.user.name} for ${review.event.title}.`,
  });

  revalidatePath("/dashboard/admin/reports");
  revalidatePath(`/events/${review.event.slug}`);
}
