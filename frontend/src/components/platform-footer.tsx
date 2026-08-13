import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-[var(--surface-canvas)] px-4 py-5 sm:px-6 lg:px-10">
      <p className="text-center text-sm leading-relaxed text-slate">
        © {year} {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName} · {BRAND.country}.
        <span className="mt-1 block text-xs text-slate/80">
          Tous droits réservés. Usage réservé aux personnels habilités.
        </span>
      </p>
    </footer>
  );
}
