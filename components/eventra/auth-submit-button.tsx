"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function AuthSubmitButton({
  children,
  loadingLabel,
}: {
  children: React.ReactNode;
  loadingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-11 w-full" disabled={pending} type="submit">
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {pending ? loadingLabel : children}
    </Button>
  );
}
