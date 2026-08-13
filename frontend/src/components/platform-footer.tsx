import { BRAND } from "@/lib/brand";

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-hairline pt-5">
      <p className="app-footer-motto text-sm">{BRAND.motto}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate">
        © {year} {BRAND.country} — {BRAND.ministry} — {BRAND.bureau}. {BRAND.appName}.
        Usage réservé aux personnels habilités.
      </p>
    </footer>
  );
}
