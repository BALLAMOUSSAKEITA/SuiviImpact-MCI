import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FolderArchive,
  Target,
} from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { PageHeader } from "@/components/page-header";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

const objectifs = [
  {
    href: "/admin/oct",
    year: "2025",
    code: "OCT",
    title: "Objectifs clés de transformation",
    desc: "Priorités stratégiques à court terme pour le développement des MPME.",
  },
  {
    href: "/admin/omt",
    year: "2026",
    code: "OMT",
    title: "Objectifs moyen terme",
    desc: "Cibles intermédiaires et jalons de mise en œuvre.",
  },
  {
    href: "/admin/olt",
    year: "2027",
    code: "OLT",
    title: "Objectifs long terme",
    desc: "Vision structurelle et transformation du secteur privé.",
  },
];

const modules = [
  {
    href: "/admin/planification",
    icon: CalendarDays,
    label: "Planification",
    desc: "Activités et tâches par trimestre",
  },
  {
    href: "/admin/suivi/1",
    icon: ClipboardList,
    label: "Suivi PAO",
    desc: "Exécution et finalisation des tâches",
  },
  {
    href: "/admin/stats",
    icon: BarChart3,
    label: "Statistiques",
    desc: "Indicateurs et tableaux de bord",
  },
  {
    href: "/admin/archive",
    icon: FolderArchive,
    label: "Archive GED",
    desc: "Documents et dossiers partagés",
  },
];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
            title="Tableau de bord"
            description={`Pilotage du plan d'action MIPME — ${BRAND.bureau}.`}
            display
          />

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fog">
              Objectifs stratégiques
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {objectifs.map((obj) => (
                <Card key={obj.code} className="transition-colors hover:border-smoke">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-btn)] bg-paper-mist">
                        <Target className="h-3.5 w-3.5 text-electric-blue" />
                      </span>
                      <div>
                        <CardTitle>{obj.code} {obj.year}</CardTitle>
                        <CardDescription>{obj.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-steel">{obj.desc}</p>
                    <Link href={obj.href}>
                      <Button variant="outline" size="sm">
                        Ouvrir
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fog">
              Modules
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group dub-card flex flex-col gap-3 transition-colors hover:border-smoke hover:bg-paper-mist/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] border border-ash bg-canvas-white">
                    <Icon className="h-4 w-4 text-charcoal group-hover:text-electric-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{label}</p>
                    <p className="mt-0.5 text-xs text-fog">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
