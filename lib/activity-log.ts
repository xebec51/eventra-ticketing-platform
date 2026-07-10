import { prisma } from "@/lib/prisma";

type ActivityLogInput = {
  userId?: string | null;
  action: string;
  module: string;
  description: string;
  ipAddress?: string | null;
};

export async function createActivityLog({
  userId,
  action,
  module,
  description,
  ipAddress,
}: ActivityLogInput) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        description,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create activity log", error);
  }
}
