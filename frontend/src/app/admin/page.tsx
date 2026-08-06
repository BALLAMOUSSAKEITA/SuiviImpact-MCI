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
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    href: "/admin/taches",
    title: "Tâches",
    description: "Créer et gérer les tâches du plan d'action (code et description).",
    icon: ClipboardList,
    color: "text-blue-600 bg-blue-50",
  },
  {
    href: "/admin/projets",
    title: "Projets",
    description: "Suivre les projets et leur exécution financière / physique.",
    icon: FolderKanban,
    color: "text-violet-600 bg-violet-50",
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
        {sections.map(({ href, title, description, icon: Icon, color }, i) => (
          <Link key={href} href={href} className="group block">
            <Card className="h-full transition-all duration-[var(--duration-normal)] group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${color}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-relaxed text-fog">{description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-ink group-hover:gap-2 transition-all">
                  Ouvrir
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
