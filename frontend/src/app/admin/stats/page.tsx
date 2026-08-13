import Link from "next/link";
import { BarChart3, Briefcase, ClipboardList, FolderKanban, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { BRAND } from "@/lib/brand";

const DASHBOARDS = [
  { href: "/admin/stats/pao", label: "Plan d'Action (PAO)", desc: "Activités et progression", icon: ClipboardList },
  { href: "/admin/stats/rcc", label: "Recommandations RCC", desc: "Exécution des RCC", icon: Briefcase },
  { href: "/admin/stats/missions", label: "Missions", desc: "Exécution des missions", icon: BarChart3 },
  { href: "/admin/stats/ppm", label: "PPM", desc: "Statuts des marchés", icon: ShoppingCart },
  { href: "/admin/stats/projets", label: "Projets", desc: "Exécution financière et physique", icon: FolderKanban },
];

export default function StatsHubPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Statistiques"
        description="Tableaux de bord et indicateurs de suivi."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARDS.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group block">
            <article className="flex h-full flex-col border border-[#0d4f38] bg-white transition-colors hover:bg-[#f6faf7]">
              <header className="flex items-center gap-3 bg-[#0d4f38] px-4 py-3">
                <Icon className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />
                <h2 className="font-display text-[15px] font-semibold text-white">{label}</h2>
              </header>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-sm leading-relaxed text-[#4a6b5c]">{desc}</p>
                <span className="mt-4 text-sm font-semibold text-[#0d4f38] group-hover:underline">
                  Consulter
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </>
  );
}
