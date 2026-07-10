import { LoaderCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({
  title = "Loading Eventra workspace",
  description = "Preparing event data, dashboards, and action controls.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border border-black/5 bg-white/80">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 text-white">
          <LoaderCircle className="size-6 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
