import Link from "next/link";

import { AdminShell } from "@/components/admin-shell";
import { PageHeader } from "@/components/page-header";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DASHBOARDS = [
  { href: "/admin/stats/pao", label: "Plan d'Action (PAO)", desc: "Activités et progression" },
  { href: "/admin/stats/rcc", label: "Recommandations RCC", desc: "Exécution des RCC" },
  { href: "/admin/stats/missions", label: "Missions", desc: "Exécution des missions" },
  { href: "/admin/stats/ppm", label: "PPM", desc: "Statuts des marchés" },
  { href: "/admin/stats/projets", label: "Projets", desc: "Exécution financière et physique" },
];

export default function StatsHubPage() {
  return (
    <ProtectedRoute>
      <AdminShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Pilotage"
            title="Statistiques"
            description="Tableaux de bord et indicateurs de suivi — BSD MIPME."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DASHBOARDS.map(({ href, label, desc }) => (
              <Card key={href} className="transition-colors hover:border-smoke">
                <CardHeader>
                  <CardTitle className="text-base">{label}</CardTitle>
                  <p className="text-sm text-fog">{desc}</p>
                </CardHeader>
                <CardContent>
                  <Link href={href}>
                    <Button variant="outline" size="sm">
                      Consulter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
