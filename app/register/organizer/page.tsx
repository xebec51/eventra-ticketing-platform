import { MarketingShell } from "@/components/eventra/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OrganizerRegistrationPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="border border-black/5 bg-slate-950 text-white">
            <CardContent className="space-y-5 p-8">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                Apply to become an Eventra organizer
              </h1>
              <p className="text-sm leading-7 text-white/75">
                Organizer accounts enter a pending review state until an admin approves the organization profile.
                Approved organizers can then create events, manage payments, and run check-in.
              </p>
              <div className="grid gap-3">
                <Requirement title="Pending approval page" />
                <Requirement title="Rejected state with reason" />
                <Requirement title="Own-event ownership protection" />
                <Requirement title="Manual payment and attendee export support" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-black/5 bg-white/92">
            <CardHeader>
              <CardTitle className="font-heading text-3xl">Organizer profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input id="org-name" placeholder="Design Society Chapter" className="h-11 border-black/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Contact person</Label>
                <Input id="contact-person" placeholder="Maya Chen" className="h-11 border-black/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Phone</Label>
                <Input id="org-phone" placeholder="+62 812 0000 0000" className="h-11 border-black/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Account email</Label>
                <Input id="org-email" type="email" placeholder="team@organization.id" className="h-11 border-black/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://organization.id" className="h-11 border-black/10" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Tell Eventra about your organization and the events you run." className="min-h-32 border-black/10" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Campus building, office, or organizer address" className="min-h-24 border-black/10" />
              </div>
              <div className="sm:col-span-2">
                <Button className="h-11 w-full">Submit organizer application</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}

function Requirement({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/80">
      {title}
    </div>
  );
}
