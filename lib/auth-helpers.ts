import { UserRole, UserStatus } from "@/app/generated/prisma/enums";

type SessionRole = keyof typeof UserRole;
type SessionStatus = keyof typeof UserStatus;

export function getDashboardHome(role: SessionRole) {
  switch (role) {
    case UserRole.ADMIN:
      return "/dashboard/admin";
    case UserRole.ORGANIZER:
      return "/dashboard/organizer";
    default:
      return "/dashboard/user";
  }
}

export function getOrganizerStatusRedirect(status: SessionStatus) {
  if (status === UserStatus.PENDING) {
    return "/pending-organizer";
  }

  if (status === UserStatus.REJECTED) {
    return "/rejected-organizer";
  }

  return null;
}

export function canAccessRolePath(
  role: SessionRole,
  pathname: string,
  status: SessionStatus
) {
  if (pathname.startsWith("/dashboard/admin")) {
    return role === UserRole.ADMIN;
  }

  if (pathname.startsWith("/dashboard/organizer")) {
    return role === UserRole.ORGANIZER && status === UserStatus.ACTIVE;
  }

  if (pathname.startsWith("/dashboard/user")) {
    return role === UserRole.USER;
  }

  return true;
}
