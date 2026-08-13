export function FlagStripe({ className = "app-flag" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <span className="bg-[#ce1126]" />
      <span className="bg-[#fcd116]" />
      <span className="bg-[#009460]" />
    </div>
  );
}
