import { CheckCircle2, QrCode, ShieldCheck } from "lucide-react";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { StatusBadge } from "@/components/eventra/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyTicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;

  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border border-black/5 bg-white/92">
          <div className="bg-[linear-gradient(135deg,#231942_0%,#d46d42_45%,#ffcb69_100%)] p-8 text-white">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/12">
              <QrCode className="size-6" />
            </div>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight">
              Ticket verification
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              This public route will validate ticket code ownership, status, and check-in readiness after the ticket domain flow is connected.
            </p>
          </div>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Verification preview for {ticketCode}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <VerificationBlock title="Status" badge={<StatusBadge label="VALID" tone="success" />} />
            <VerificationBlock title="Ownership" badge={<StatusBadge label="Approved booking" tone="default" />} />
            <VerificationBlock title="Check-in" badge={<StatusBadge label="Unused" tone="warning" />} />
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
                    Eventra stores only `ticketCode` and `qrPayload`. The QR image itself is rendered on the frontend, keeping the database lean while still enabling public verification and organizer check-in.
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
                    Final check-in flow will reject any ticket that is already marked `USED`, protecting attendance integrity at the ticket level instead of the booking level.
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
