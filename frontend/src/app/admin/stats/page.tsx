import Link from "next/link";
import { BarChart3, Briefcase, ClipboardList, FolderKanban, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

const DASHBOARDS = [
  { href: "/admin/stats/pao", label: "Plan d'Action (PAO)", desc: "Activités et progression", icon: ClipboardList },
  { href: "/admin/stats/rcc", label: "Instructions IRC", desc: "Exécution des IRC", icon: Briefcase },
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
            <Card className="h-full p-4 transition-colors sm:p-5 group-hover:border-forest-ink">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-hairline bg-[#e0f5ea] text-graphite">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="mb-3 text-sm text-slate">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-graphite transition-all group-hover:gap-2">
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
