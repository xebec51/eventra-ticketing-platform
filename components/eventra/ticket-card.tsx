import Link from "next/link";

import { QRCodeDisplay } from "@/components/eventra/qr-code-display";
import { StatusBadge } from "@/components/eventra/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type TicketCardProps = {
  ticketCode: string;
  qrPayload: string;
  status: "VALID" | "USED" | "CANCELLED" | "EXPIRED";
  eventTitle: string;
  eventCity: string;
  eventVenue: string;
  eventStart: Date;
  ticketTypeName: string;
  checkedInAt?: Date | null;
};

export async function TicketCard({
  ticketCode,
  qrPayload,
  status,
  eventTitle,
  eventCity,
  eventVenue,
  eventStart,
  ticketTypeName,
  checkedInAt,
}: TicketCardProps) {
  const tone =
    status === "VALID"
      ? "success"
      : status === "USED"
        ? "default"
        : status === "EXPIRED"
          ? "warning"
          : "danger";

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-none">
      <div className="h-1 bg-primary" />
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-heading text-2xl">{eventTitle}</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {ticketCode} • {ticketTypeName} • {eventCity}
          </p>
        </div>
        <StatusBadge label={status} tone={tone} />
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="flex justify-center xl:justify-start">
          <QRCodeDisplay value={qrPayload} />
        </div>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCell label="Venue" value={eventVenue} />
            <InfoCell label="Starts" value={formatDateTime(eventStart)} />
            <InfoCell label="QR payload" value={qrPayload} />
            <InfoCell
              label="Checked in at"
              value={checkedInAt ? formatDateTime(checkedInAt) : "Not checked in yet"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/verify/${ticketCode}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Open verification page
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/55 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
