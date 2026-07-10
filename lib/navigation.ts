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
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const publicNavItems: NavItem[] = [
  { href: "/", label: "Overview", icon: Sparkles },
  { href: "/events", label: "Events", icon: Compass },
  { href: "/register/organizer", label: "Become Organizer", icon: ShieldCheck },
  { href: "/login", label: "Sign In", icon: UserRoundCog },
];

export const sharedDashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: UserRoundCog },
  { href: "/dashboard/settings", label: "Settings", icon: ListChecks },
];

export const roleDashboardNav: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/organizers", label: "Organizers", icon: ShieldCheck },
    { href: "/dashboard/admin/events", label: "Events", icon: Compass },
    { href: "/dashboard/admin/categories", label: "Categories", icon: ClipboardList },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: Ticket },
    { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/admin/reports", label: "Reports", icon: FileSpreadsheet },
    { href: "/dashboard/admin/activity-logs", label: "Activity Logs", icon: Activity },
  ],
  ORGANIZER: [
    { href: "/dashboard/organizer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/organizer/events", label: "My Events", icon: Compass },
    { href: "/dashboard/organizer/bookings", label: "Bookings", icon: Ticket },
    { href: "/dashboard/organizer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/organizer/check-in", label: "Check-in", icon: CalendarCheck2 },
    { href: "/dashboard/organizer/reports", label: "Reports", icon: ChartColumn },
    { href: "/dashboard/organizer/profile", label: "Organizer Profile", icon: UserRoundCog },
  ],
  USER: [
    { href: "/dashboard/user", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/user/bookings", label: "Bookings", icon: Ticket },
    { href: "/dashboard/user/tickets", label: "Tickets", icon: CalendarCheck2 },
    { href: "/dashboard/user/favorites", label: "Favorites", icon: Heart },
    { href: "/dashboard/user/reviews", label: "Reviews", icon: ClipboardList },
    { href: "/dashboard/user/profile", label: "Profile", icon: UserRoundCog },
  ],
};
