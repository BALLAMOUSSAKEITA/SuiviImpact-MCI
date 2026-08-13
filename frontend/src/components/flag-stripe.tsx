import { cn } from "@/lib/utils";

export function FlagStripe({ className = "app-flag" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <span className="bg-[#ce1126]" />
      <span className="bg-[#fcd116]" />
      <span className="bg-[#009460]" />
    </div>
  );
}

/** Filet tricolore vertical — signature des titres et du pied de page. */
export function FlagMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex w-[5px] shrink-0 flex-col self-stretch", className)}
      aria-hidden
    >
      <span className="flex-1 bg-[#ce1126]" />
      <span className="flex-1 bg-[#fcd116]" />
      <span className="flex-1 bg-[#009460]" />
    </span>
  );
}
