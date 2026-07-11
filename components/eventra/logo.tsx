import Link from "next/link";

import { cn } from "@/lib/utils";

type EventraLogoProps = {
  className?: string;
  href?: string;
  compact?: boolean;
  variant?: "default" | "mono" | "inverse";
};

type EventraMarkProps = {
  className?: string;
  variant?: "default" | "mono" | "inverse";
};

export function EventraMark({
  className,
  variant = "default",
}: EventraMarkProps) {
  const foreground = variant === "default" ? "#FFFFFF" : "currentColor";
  const background = variant === "default" ? "#5B3FF3" : "none";

  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Eventra"
      className={cn("size-10 shrink-0", className)}
    >
      <title>Eventra</title>
      <path
        d="M7 5.5h26a2 2 0 0 1 2 2v6.1a6.4 6.4 0 0 0 0 12.8v6.1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6.1a6.4 6.4 0 0 0 0-12.8V7.5a2 2 0 0 1 2-2Z"
        fill={background}
        stroke={variant === "default" ? "#5B3FF3" : foreground}
        strokeWidth="2"
      />
      <path
        d="M14 13.5h13M14 20h10M14 26.5h13"
        fill="none"
        stroke={foreground}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M10 10.5v19"
        stroke={variant === "default" ? "#F6A935" : foreground}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function EventraLogo({
  className,
  href = "/",
  compact = false,
  variant = "default",
}: EventraLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Eventra"
      className={cn(
        "inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "inverse" && "text-white",
        className
      )}
    >
      <EventraMark variant={variant} />
      {!compact ? (
        <span className="flex flex-col">
          <span className={cn("font-heading text-lg font-semibold tracking-tight", variant === "inverse" ? "text-white" : "text-foreground")}>
            Eventra
          </span>
          <span className={cn("text-xs", variant === "inverse" ? "text-white/60" : "text-muted-foreground")}>
            Smart Event Ticketing Platform
          </span>
        </span>
      ) : null}
    </Link>
  );
}
