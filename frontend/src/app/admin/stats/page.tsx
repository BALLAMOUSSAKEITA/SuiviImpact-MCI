import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, ClipboardList, FolderKanban, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/page-header";

const DASHBOARDS = [
  { href: "/admin/stats/pao", label: "Plan d'Action", desc: "Activités et progression", icon: ClipboardList },
  { href: "/admin/stats/rcc", label: "Recommandations RCC", desc: "Exécution des RCC", icon: Briefcase },
  { href: "/admin/stats/missions", label: "Missions", desc: "Exécution des missions", icon: BarChart3 },
  { href: "/admin/stats/ppm", label: "PPM", desc: "Statuts des marchés", icon: ShoppingCart },
  { href: "/admin/stats/projets", label: "Projets", desc: "Exécution financière et physique", icon: FolderKanban },
];

export default function StatsHubPage() {
  return (
    <>
      <PageHeader
        eyebrow="BSD · MIPME"
        title="Statistiques"
        description="Tableaux de bord et indicateurs de suivi."
      />

      <div className="divide-y rounded-[var(--radius-lg)] border bg-white">
        {DASHBOARDS.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 px-5 py-4 transition-colors first:rounded-t-[var(--radius-lg)] last:rounded-b-[var(--radius-lg)] hover:bg-gray-50"
          >
            <Icon className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-[13px] text-gray-500">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />
          </Link>
        ))}
      </div>
    </>
  );
}
