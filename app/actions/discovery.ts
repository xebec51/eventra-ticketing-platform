"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavoriteEventAction(formData: FormData) {
  const user = await requireRole("USER");
  const eventId = String(formData.get("eventId") || "");
  const redirectPath = String(formData.get("redirectPath") || "/events");

  const existingFavorite = await prisma.favoriteEvent.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId,
      },
    },
    select: { id: true },
  });

  if (existingFavorite) {
    await prisma.favoriteEvent.delete({
      where: { id: existingFavorite.id },
    });
  } else {
    await prisma.favoriteEvent.create({
      data: {
        userId: user.id,
        eventId,
      },
    });
  }

  revalidatePath(redirectPath);
  revalidatePath("/events");
  revalidatePath("/dashboard/user/favorites");
}
