import Link from "next/link";
import { BarChart3, Briefcase, ClipboardList, FolderKanban, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DASHBOARDS = [
  { href: "/admin/stats/pao", label: "Plan d'Action (PAO)", desc: "Activités et progression", icon: ClipboardList, color: "text-emerald-600 bg-emerald-50" },
  { href: "/admin/stats/rcc", label: "Recommandations RCC", desc: "Exécution des RCC", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
  { href: "/admin/stats/missions", label: "Missions", desc: "Exécution des missions", icon: BarChart3, color: "text-violet-600 bg-violet-50" },
  { href: "/admin/stats/ppm", label: "PPM", desc: "Statuts des marchés", icon: ShoppingCart, color: "text-amber-600 bg-amber-50" },
  { href: "/admin/stats/projets", label: "Projets", desc: "Exécution financière et physique", icon: FolderKanban, color: "text-rose-600 bg-rose-50" },
];

export default function StatsHubPage() {
  return (
    <>
      <PageHeader
        eyebrow="BSD · MIPME"
        title="Statistiques"
        description="Tableaux de bord et indicateurs de suivi."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARDS.map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="group block">
            <Card className="h-full transition-all duration-[var(--duration-normal)] group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${color}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-fog">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-ink group-hover:gap-2 transition-all">
                  Consulter
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
