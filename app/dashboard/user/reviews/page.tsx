import { ReviewsModerationPreview } from "@/components/eventra/dashboard-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserReviewsPage() {
  return (
    <div className="space-y-6">
      <Card className="border border-black/5 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Review readiness</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Attendees will only be able to review an event after it ends and at least one ticket for that event has been checked in as `USED`.
        </CardContent>
      </Card>
      <ReviewsModerationPreview />
    </div>
  );
}
