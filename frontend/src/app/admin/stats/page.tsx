import Link from "next/link";

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
    <>
      <h1 className="text-xl font-bold text-graphite sm:text-2xl">Statistiques</h1>
      <p className="mt-2 text-slate">
        Tableaux de bord et indicateurs de suivi — BSD MIPME.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARDS.map(({ href, label, desc }) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle className="text-lg">{label}</CardTitle>
              <p className="text-sm text-fog">{desc}</p>
            </CardHeader>
            <CardContent>
              <Link href={href}>
                <Button variant="outline">Consulter</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
