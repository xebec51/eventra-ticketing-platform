import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Clock4,
  FileBadge2,
  Heart,
  Layers3,
  ShieldAlert,
  Ticket,
} from "lucide-react";

import { BookingStatusBadge } from "@/components/eventra/booking-status-badge";
import { DataTable } from "@/components/eventra/data-table";
import { EmptyState } from "@/components/eventra/empty-state";
import { PaymentStatusBadge } from "@/components/eventra/payment-status-badge";
import { StatCard } from "@/components/eventra/stat-card";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminStats,
  bookingRows,
  organizerRows,
  organizerStats,
  reviewRows,
  userStats,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function WorkspaceSelectorCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Card className="border border-black/5 bg-white/90">
      <CardContent className="space-y-4 pt-6">
        <StatusBadge label={badge} tone="default" />
        <div>
          <h3 className="font-heading text-xl font-semibold text-slate-950">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Link href={href} className={cn(buttonVariants({ size: "sm" }))}>
          Open workspace
        </Link>
      </CardContent>
    </Card>
  );
}

export function DashboardWorkspaceSelector() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <WorkspaceSelectorCard
          href="/dashboard/admin"
          title="Admin control center"
          badge="Governance"
          description="Moderate platform activity, approve organizers, inspect bookings, and export reports."
        />
        <WorkspaceSelectorCard
          href="/dashboard/organizer"
          title="Organizer mission control"
          badge="Operations"
          description="Manage event inventory, payment verification, attendee approvals, and check-in execution."
        />
        <WorkspaceSelectorCard
          href="/dashboard/user"
          title="Attendee workspace"
          badge="Experience"
          description="Track bookings, manage favorites, access QR tickets, and review attended events."
        />
      </div>
      <EmptyState
        title="Auth and database flows land next"
        description="This foundation pass establishes the Eventra information architecture, design system, and route map so every role already has a coherent destination."
        icon={<Layers3 className="size-6" />}
      />
    </div>
  );
}

export function DashboardOverview({
  mode,
}: {
  mode: "ADMIN" | "ORGANIZER" | "USER";
}) {
  const stats =
    mode === "ADMIN"
      ? adminStats
      : mode === "ORGANIZER"
        ? organizerStats
        : userStats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <DataTable
          title={mode === "ORGANIZER" ? "Event pipeline" : "Recent bookings"}
          description="Designed to become fully data-driven once Prisma and auth are wired in."
          data={mode === "ORGANIZER" ? organizerRows : bookingRows}
          columns={
            mode === "ORGANIZER"
              ? [
                  { key: "event", header: "Event" },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => (
                      <StatusBadge
                        label={String(row.status)}
                        tone={row.status === "PUBLISHED" ? "success" : "warning"}
                      />
                    ),
                  },
                  { key: "schedule", header: "Schedule" },
                  { key: "tickets", header: "Tickets" },
                  { key: "revenue", header: "Revenue" },
                ]
              : [
                  { key: "booking", header: "Booking code" },
                  { key: "event", header: "Event" },
                  { key: "buyer", header: "Buyer" },
                  {
                    key: "payment",
                    header: "Payment",
                    render: (row) => (
                      <PaymentStatusBadge status={row.payment as never} />
                    ),
                  },
                  {
                    key: "status",
                    header: "Booking",
                    render: (row) => (
                      <BookingStatusBadge status={row.status as never} />
                    ),
                  },
                  { key: "amount", header: "Amount" },
                ]
          }
        />
        <Card className="border border-black/5 bg-white/90">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Operational pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "ADMIN" ? (
              <>
                <InsightRow
                  icon={<ShieldAlert className="size-5" />}
                  title="Organizer queue"
                  value="6 pending approvals"
                  description="Approval lead time is below 12 hours, but two submissions need document follow-up."
                />
                <InsightRow
                  icon={<Clock4 className="size-5" />}
                  title="Payment reviews"
                  value="14 waiting confirmations"
                  description="Most pending proofs belong to two high-volume events scheduled next week."
                />
                <InsightRow
                  icon={<FileBadge2 className="size-5" />}
                  title="Moderation"
                  value="12 review flags"
                  description="Negative review cluster detected on community events with venue access complaints."
                />
              </>
            ) : mode === "ORGANIZER" ? (
              <>
                <InsightRow
                  icon={<Ticket className="size-5" />}
                  title="Sales momentum"
                  value="38 tickets sold this week"
                  description="Early-bird demand is strongest on summit and market segments."
                />
                <InsightRow
                  icon={<CheckCircle2 className="size-5" />}
                  title="Approval workload"
                  value="12 bookings awaiting review"
                  description="Cash-on-venue reservations are the main driver of pending approvals."
                />
                <InsightRow
                  icon={<CalendarClock className="size-5" />}
                  title="Upcoming deadline"
                  value="Workshop publish deadline in 2 days"
                  description="Finish ticket configuration and agenda details before public launch."
                />
              </>
            ) : (
              <>
                <InsightRow
                  icon={<Ticket className="size-5" />}
                  title="Upcoming access"
                  value="2 events in the next 7 days"
                  description="Your approved QR tickets are ready and can be opened from the tickets page."
                />
                <InsightRow
                  icon={<Heart className="size-5" />}
                  title="Saved discoveries"
                  value="3 favorites start this month"
                  description="Turn favorites into bookings quickly to avoid manual payment expiry windows."
                />
                <InsightRow
                  icon={<Clock4 className="size-5" />}
                  title="Pending action"
                  value="1 payment proof needs upload"
                  description="One reservation will expire if proof is not submitted before the deadline."
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightRow({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-slate-50/80 p-4">
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-heading text-lg font-semibold text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function GenericDashboardPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardContent className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <StatusBadge label="Foundation ready" tone="success" />
        </CardContent>
      </Card>
      <EmptyState
        title="Workflow page scaffolded"
        description="The route, shell, and visual language are now in place. Data operations and role-aware actions will be connected in the next implementation phases."
        icon={<Layers3 className="size-6" />}
      />
    </div>
  );
}

export function ReviewsModerationPreview() {
  return (
    <DataTable
      title="Review moderation preview"
      description="Admin review controls will surface here with visibility actions and moderation notes."
      data={reviewRows}
      columns={[
        { key: "reviewer", header: "Reviewer" },
        { key: "event", header: "Event" },
        { key: "rating", header: "Rating" },
        {
          key: "visibility",
          header: "Visibility",
          render: (row) => (
            <StatusBadge
              label={String(row.visibility)}
              tone={row.visibility === "VISIBLE" ? "success" : "warning"}
            />
          ),
        },
        { key: "note", header: "Note" },
      ]}
    />
  );
}
