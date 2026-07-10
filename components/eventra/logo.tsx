import Link from "next/link";

import { cn } from "@/lib/utils";

type EventraLogoProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function EventraLogo({
  className,
  href = "/",
  compact = false,
}: EventraLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top_left,_#fff8dd,_#ff9b71_60%,_#231942)] text-sm font-semibold text-white shadow-[0_18px_40px_rgba(255,138,91,0.35)]">
        Ev
      </span>
      {!compact ? (
        <span className="flex flex-col">
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Eventra
          </span>
          <span className="text-xs text-muted-foreground">
            Smart Event Ticketing Platform
          </span>
        </span>
      ) : null}
    </Link>
  );
}
