import Link from "next/link";

import { MarketingShell } from "@/components/eventra/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border border-black/5 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">Create attendee account</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Register to browse favorites, reserve tickets, upload payment proofs, and access QR tickets after approval.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Alya Setiawan" className="h-11 border-black/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input id="register-email" type="email" placeholder="you@example.com" className="h-11 border-black/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+65 8123 4567" className="h-11 border-black/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" className="h-11 border-black/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" placeholder="Repeat password" className="h-11 border-black/10" />
            </div>
            <div className="sm:col-span-2">
              <Button className="h-11 w-full">Create account</Button>
            </div>
            <p className="sm:col-span-2 text-sm text-muted-foreground">
              Want to host events instead?{" "}
              <Link href="/register/organizer" className="font-medium text-slate-950 underline-offset-4 hover:underline">
                Apply as an organizer
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
