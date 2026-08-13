import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-hairline bg-white px-5 py-5 sm:px-7 lg:px-10">
      <p className="font-display text-sm font-semibold text-graphite">{BRAND.motto}</p>
      <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate">
        © {year} {BRAND.country} — {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName}.
        Usage réservé aux personnels habilités.
      </p>
    </footer>
  );
}
