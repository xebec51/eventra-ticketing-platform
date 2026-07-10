"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { UserStatus } from "@/app/generated/prisma/enums";
import { createActivityLog } from "@/lib/activity-log";
import { requireRole, requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  organizerProfileSchema,
  userProfileSchema,
} from "@/lib/validations/account";

export type AccountFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
  success?: string;
};

function optionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export async function updateUserProfileAction(
  _: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireSessionUser();
  const parsed = userProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted profile fields.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: optionalString(parsed.data.phone),
      avatarUrl: optionalString(parsed.data.avatarUrl),
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "UPDATE_PROFILE",
    module: "users",
    description: "Updated personal profile details.",
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/user/profile");
  revalidatePath("/dashboard/organizer/profile");

  return { success: "Profile updated successfully." };
}

export async function updateOrganizerProfileAction(
  _: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const user = await requireRole("ORGANIZER");
  const parsed = organizerProfileSchema.safeParse({
    organizationName: formData.get("organizationName"),
    description: formData.get("description"),
    contactPerson: formData.get("contactPerson"),
    phone: formData.get("phone"),
    websiteUrl: formData.get("websiteUrl"),
    logoUrl: formData.get("logoUrl"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted organizer profile fields.",
    };
  }

  await prisma.organizerProfile.update({
    where: { userId: user.id },
    data: {
      organizationName: parsed.data.organizationName,
      description: optionalString(parsed.data.description),
      contactPerson: optionalString(parsed.data.contactPerson),
      phone: optionalString(parsed.data.phone),
      websiteUrl: optionalString(parsed.data.websiteUrl),
      logoUrl: optionalString(parsed.data.logoUrl),
      address: optionalString(parsed.data.address),
    },
  });

  await createActivityLog({
    userId: user.id,
    action: "UPDATE_PROFILE",
    module: "organizers",
    description: "Updated organizer profile details.",
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/organizer/profile");

  return { success: "Organizer profile updated successfully." };
}

export async function approveOrganizerAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const organizerProfileId = String(formData.get("organizerProfileId") || "");

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  if (!organizerProfile) {
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: organizerProfile.user.id },
      data: { status: UserStatus.ACTIVE },
    }),
    prisma.organizerProfile.update({
      where: { id: organizerProfile.id },
      data: {
        approvedAt: new Date(),
        approvedBy: admin.id,
        rejectionReason: null,
      },
    }),
  ]);

  await createActivityLog({
    userId: admin.id,
    action: "APPROVE",
    module: "organizers",
    description: `Approved organizer profile for ${organizerProfile.user.name}.`,
  });

  revalidatePath("/dashboard/admin/organizers");
  revalidatePath("/dashboard/admin/users");
}

export async function rejectOrganizerAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const organizerProfileId = String(formData.get("organizerProfileId") || "");
  const rejectionReason =
    String(formData.get("rejectionReason") || "").trim() ||
    "Application did not meet organizer requirements.";

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { id: organizerProfileId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  if (!organizerProfile) {
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: organizerProfile.user.id },
      data: { status: UserStatus.REJECTED },
    }),
    prisma.organizerProfile.update({
      where: { id: organizerProfile.id },
      data: {
        approvedAt: null,
        approvedBy: null,
        rejectionReason,
      },
    }),
  ]);

  await createActivityLog({
    userId: admin.id,
    action: "REJECT",
    module: "organizers",
    description: `Rejected organizer profile for ${organizerProfile.user.name}.`,
  });

  revalidatePath("/dashboard/admin/organizers");
  revalidatePath("/dashboard/admin/users");
}

export async function updateUserStatusAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  const nextStatus = String(formData.get("status") || "") as UserStatus;

  if (!Object.values(UserStatus).includes(nextStatus)) {
    return;
  }

  if (userId === admin.id) {
    return;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!targetUser) {
    return;
  }

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { status: nextStatus },
  });

  await createActivityLog({
    userId: admin.id,
    action: "UPDATE_STATUS",
    module: "users",
    description: `Updated user status for ${targetUser.name} to ${nextStatus}.`,
  });

  revalidatePath("/dashboard/admin/users");
}

export async function goToRoleProfileAction() {
  const user = await requireSessionUser();

  if (user.role === "USER") {
    redirect("/dashboard/user/profile");
  }

  if (user.role === "ORGANIZER") {
    redirect("/dashboard/organizer/profile");
  }

  redirect("/dashboard/profile");
}
