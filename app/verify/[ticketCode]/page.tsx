import { notFound } from "next/navigation";
import { CheckCircle2, QrCode, ShieldCheck } from "lucide-react";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  translateBookingStatus,
  translateTicketStatus,
} from "@/lib/i18n/status";
import { prisma } from "@/lib/prisma";

export default async function VerifyTicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;
  const { locale, t } = await getServerTranslator();
  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode: ticketCode.toUpperCase() },
    include: {
      event: {
        select: {
          title: true,
          startDatetime: true,
          locationName: true,
          city: true,
        },
      },
      user: {
        select: { name: true },
      },
      booking: {
        select: {
          status: true,
          bookingCode: true,
        },
      },
      ticketType: {
        select: { name: true },
      },
      checker: {
        select: { name: true },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const statusTone =
    ticket.status === "VALID"
      ? "success"
      : ticket.status === "USED"
        ? "default"
        : ticket.status === "EXPIRED"
          ? "warning"
          : "danger";
  const heroClass =
    ticket.status === "VALID"
      ? "bg-[linear-gradient(135deg,#064e3b_0%,#059669_48%,#34d399_100%)] p-8 text-white"
      : ticket.status === "USED"
        ? "bg-[linear-gradient(135deg,#0f172a_0%,#334155_55%,#64748b_100%)] p-8 text-white"
        : "bg-[linear-gradient(135deg,#7f1d1d_0%,#e11d48_50%,#fb7185_100%)] p-8 text-white";
  const verificationHeadline =
    ticket.status === "VALID"
      ? "Ready for entry"
      : ticket.status === "USED"
        ? "Already checked in"
        : "Not eligible for entry";

  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border border-black/5 bg-white/92">
          <div className={heroClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/12">
                <QrCode className="size-6" />
              </div>
              <StatusBadge
                label={translateTicketStatus(ticket.status, locale)}
                tone={statusTone}
              />
            </div>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight">
              {verificationHeadline}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              {t("nav.verifyTicket")} confirms whether this ticket belongs to
              an approved booking and whether it is still eligible for entry.
            </p>
          </div>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Verification result for {ticket.ticketCode}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <VerificationBlock
              title="Status"
              badge={<StatusBadge label={translateTicketStatus(ticket.status, locale)} tone={statusTone} />}
            />
            <VerificationBlock
              title="Booking"
              badge={<StatusBadge label={translateBookingStatus(ticket.booking.status, locale)} tone="default" />}
            />
            <VerificationBlock
              title="Check-in"
              badge={
                <StatusBadge
                  label={ticket.checkedInAt ? translateTicketStatus("USED", locale) : "Ready for entry"}
                  tone={ticket.checkedInAt ? "default" : "success"}
                />
              }
            />
            <div className="rounded-3xl border border-black/5 bg-slate-50 p-5 md:col-span-3">
              <div className="grid gap-3 md:grid-cols-2">
                <VerificationDetail
                  label="Attendee"
                  value={ticket.user.name}
                />
                <VerificationDetail
                  label="Ticket type"
                  value={ticket.ticketType.name}
                />
                <VerificationDetail label="Event" value={ticket.event.title} />
                <VerificationDetail
                  label="Schedule"
                  value={formatDateTime(ticket.event.startDatetime, locale)}
                />
                <VerificationDetail
                  label="Venue"
                  value={`${ticket.event.locationName}, ${ticket.event.city}`}
                />
                <VerificationDetail
                  label="Booking code"
                  value={ticket.booking.bookingCode}
                />
                <VerificationDetail
                  label="Checked in by"
                  value={ticket.checker?.name ?? "Not checked in yet"}
                />
                <VerificationDetail
                  label="Checked in at"
                  value={
                    ticket.checkedInAt
                      ? formatDateTime(ticket.checkedInAt, locale)
                      : "Not checked in yet"
                  }
                />
              </div>
            </div>
            <div className="rounded-3xl border border-black/5 bg-slate-50 p-5 md:col-span-3">
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-slate-950">
                    Frontend-generated QR strategy
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Eventra stores only `ticketCode` and `qrPayload`. The QR
                    image itself is rendered on the frontend, keeping the
                    database lean while still enabling public verification and
                    organizer check-in.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-black/5 bg-slate-50 p-5 md:col-span-3">
              <div className="flex items-start gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-slate-950">
                    Duplicate protection
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Check-in rejects any ticket already marked `USED`,
                    protecting attendance integrity at the ticket level instead
                    of the booking level.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}

function VerificationDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function VerificationBlock({
  title,
  badge,
}: {
  title: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3">{badge}</div>
    </div>
  );
}
