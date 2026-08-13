import { FlagMark } from "@/components/flag-stripe";
import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-[3px] border-[#0d4f38] bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3">
        <FlagMark className="mt-0.5 h-8 w-[4px] self-auto" />
        <div>
          <p className="font-display text-sm font-semibold text-[#0d4f38]">{BRAND.motto}</p>
          <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-[#4a6b5c]">
            © {year} {BRAND.country} — {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName}.
            Usage réservé aux personnels habilités.
          </p>
        </div>
      </div>
    </footer>
  );
}
