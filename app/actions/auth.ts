"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { UserRole, UserStatus } from "@/app/generated/prisma/enums";
import { createActivityLog } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";
import {
  registerOrganizerSchema,
  registerUserSchema,
} from "@/lib/validations/auth";

export type AuthFormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function parseOptionalString(value: FormDataEntryValue | null | undefined) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized.length > 0 ? normalized : undefined;
}

export async function registerUserAction(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      message: "An account with that email already exists.",
      errors: {
        email: ["An account with that email already exists."],
      },
    };
  }

  const password = await hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      phone: parseOptionalString(parsed.data.phone),
    },
    select: { id: true, email: true },
  });

  await createActivityLog({
    userId: user.id,
    action: "REGISTER",
    module: "auth",
    description: `Created attendee account for ${user.email}.`,
  });

  redirect("/login?registered=1");
}

export async function registerOrganizerAction(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerOrganizerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    organizationName: formData.get("organizationName"),
    contactPerson: formData.get("contactPerson"),
    websiteUrl: formData.get("websiteUrl"),
    description: formData.get("description"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      message: "An account with that email already exists.",
      errors: {
        email: ["An account with that email already exists."],
      },
    };
  }

  const password = await hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: UserRole.ORGANIZER,
      status: UserStatus.PENDING,
      phone: parseOptionalString(parsed.data.phone),
      organizerProfile: {
        create: {
          organizationName: parsed.data.organizationName,
          description: parsed.data.description,
          contactPerson: parseOptionalString(parsed.data.contactPerson),
          phone: parseOptionalString(parsed.data.phone),
          websiteUrl: parseOptionalString(parsed.data.websiteUrl),
          address: parsed.data.address,
        },
      },
    },
    select: { id: true, email: true },
  });

  await createActivityLog({
    userId: user.id,
    action: "REGISTER",
    module: "organizers",
    description: `Submitted organizer registration for ${user.email}.`,
  });

  redirect("/login?registered=1&role=organizer");
}
