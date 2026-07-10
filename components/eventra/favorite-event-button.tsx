import Link from "next/link";
import { Heart } from "lucide-react";

import { toggleFavoriteEventAction } from "@/app/actions/discovery";
import { Button } from "@/components/ui/button";

export function FavoriteEventButton({
  eventId,
  redirectPath,
  isFavorite,
  canFavorite,
  count,
}: {
  eventId: string;
  redirectPath: string;
  isFavorite: boolean;
  canFavorite: boolean;
  count: number;
}) {
  if (!canFavorite) {
    return (
      <Link href="/login">
        <Button type="button" variant="outline">
          <Heart className="size-4" />
          Save ({count})
        </Button>
      </Link>
    );
  }

  return (
    <form action={toggleFavoriteEventAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="redirectPath" value={redirectPath} />
      <Button type="submit" variant={isFavorite ? "default" : "outline"}>
        <Heart className="size-4" />
        {isFavorite ? `Saved (${count})` : `Save (${count})`}
      </Button>
    </form>
  );
}
