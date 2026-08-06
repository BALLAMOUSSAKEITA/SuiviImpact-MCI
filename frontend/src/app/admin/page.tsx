import Link from "next/link";
import { ClipboardList, FolderKanban, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    href: "/admin/objectifs",
    title: "Objectifs",
    description:
      "Créer et gérer les objectifs du plan d'action, puis leurs activités.",
    icon: Target,
  },
  {
    href: "/admin/taches",
    title: "Tâches",
    description:
      "Ajouter et planifier les tâches par trimestre, liées aux activités.",
    icon: ClipboardList,
  },
  {
    href: "/admin/projets",
    title: "Projets",
    description: "Suivre les projets et leur exécution financière / physique.",
    icon: FolderKanban,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Plan d'Action"
        description={`Objectifs, tâches et projets — ${BRAND.bureau}.`}
        display
      />
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-forest-ink" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate">{description}</p>
              <Link href={href}>
                <Button variant="outline">Ouvrir</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
