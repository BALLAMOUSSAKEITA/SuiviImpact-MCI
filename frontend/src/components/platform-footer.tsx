import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-cloud/60 bg-paper/40 px-4 py-4 sm:px-6 lg:px-8">
      <p className="text-center text-[11px] leading-relaxed text-ash sm:text-xs">
        © {year} {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName} · {BRAND.country}.
        <span className="mt-1 block text-[10px] text-fog">
          Tous droits réservés. Usage réservé aux personnels habilités.
        </span>
      </p>
    </footer>
  );
}
