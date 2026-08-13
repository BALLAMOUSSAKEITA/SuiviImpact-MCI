import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-hairline bg-white px-4 py-3.5 sm:px-6 lg:px-8">
      <p className="font-display text-[13px] font-semibold text-graphite">{BRAND.motto}</p>
      <p className="mt-0.5 max-w-3xl text-[11px] leading-relaxed text-slate">
        © {year} {BRAND.country} — {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName}.
        Usage réservé aux personnels habilités.
      </p>
    </footer>
  );
}
