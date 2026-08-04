import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
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
      <div className="flex min-h-screen bg-zinc-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-zinc-900">Statistiques</h1>
          <p className="mt-2 text-zinc-600">
            Tableaux de bord et indicateurs de suivi — BSD MIPME.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DASHBOARDS.map(({ href, label, desc }) => (
              <Card key={href}>
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </CardHeader>
                <CardContent>
                  <Link href={href}>
                    <Button variant="outline">Consulter</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
