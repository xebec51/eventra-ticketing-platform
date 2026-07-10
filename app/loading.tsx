import { MarketingShell } from "@/components/eventra/marketing-shell";
import { LoadingState } from "@/components/eventra/loading-state";

export default function Loading() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <LoadingState />
      </div>
    </MarketingShell>
  );
}
