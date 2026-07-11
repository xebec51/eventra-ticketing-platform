import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarCheck2,
  ChartColumn,
  ClipboardList,
  Compass,
  CreditCard,
  FileSpreadsheet,
  Heart,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRoundCog,
  Users,
} from "lucide-react";

import type { UserRole } from "@/lib/types";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  description?: string;
};

export const publicNavItems: NavItem[] = [
  { href: "/", labelKey: "nav.overview", icon: Sparkles },
  { href: "/events", labelKey: "nav.events", icon: Compass },
  { href: "/register/organizer", labelKey: "nav.becomeOrganizer", icon: ShieldCheck },
  { href: "/login", labelKey: "nav.signIn", icon: UserRoundCog },
];

export const sharedDashboardNav: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.workspace", icon: LayoutDashboard },
  { href: "/dashboard/profile", labelKey: "common.profile", icon: UserRoundCog },
  { href: "/dashboard/settings", labelKey: "common.settings", icon: ListChecks },
];

export const roleDashboardNav: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard/admin", labelKey: "nav.overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", labelKey: "nav.users", icon: Users },
    { href: "/dashboard/admin/organizers", labelKey: "nav.organizers", icon: ShieldCheck },
    { href: "/dashboard/admin/events", labelKey: "nav.events", icon: Compass },
    { href: "/dashboard/admin/categories", labelKey: "nav.categories", icon: ClipboardList },
    { href: "/dashboard/admin/bookings", labelKey: "nav.bookings", icon: Ticket },
    { href: "/dashboard/admin/payments", labelKey: "nav.payments", icon: CreditCard },
    { href: "/dashboard/admin/reports", labelKey: "nav.reports", icon: FileSpreadsheet },
    { href: "/dashboard/admin/activity-logs", labelKey: "nav.activityLogs", icon: Activity },
  ],
  ORGANIZER: [
    { href: "/dashboard/organizer", labelKey: "nav.overview", icon: LayoutDashboard },
    { href: "/dashboard/organizer/events", labelKey: "nav.myEvents", icon: Compass },
    { href: "/dashboard/organizer/bookings", labelKey: "nav.bookings", icon: Ticket },
    { href: "/dashboard/organizer/payments", labelKey: "nav.payments", icon: CreditCard },
    { href: "/dashboard/organizer/check-in", labelKey: "nav.checkIn", icon: CalendarCheck2 },
    { href: "/dashboard/organizer/reports", labelKey: "nav.reports", icon: ChartColumn },
    { href: "/dashboard/organizer/profile", labelKey: "nav.organizerProfile", icon: UserRoundCog },
  ],
  USER: [
    { href: "/dashboard/user", labelKey: "nav.overview", icon: LayoutDashboard },
    { href: "/dashboard/user/bookings", labelKey: "nav.bookings", icon: Ticket },
    { href: "/dashboard/user/tickets", labelKey: "nav.tickets", icon: CalendarCheck2 },
    { href: "/dashboard/user/favorites", labelKey: "nav.favorites", icon: Heart },
    { href: "/dashboard/user/reviews", labelKey: "nav.reviews", icon: ClipboardList },
    { href: "/dashboard/user/profile", labelKey: "common.profile", icon: UserRoundCog },
  ],
};
