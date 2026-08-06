import Link from "next/link";
import { ArrowRight, ClipboardList, FolderKanban, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    href: "/admin/objectifs",
    title: "Objectifs",
    description: "Créer et gérer les objectifs, puis leurs activités.",
    icon: Target,
  },
  {
    href: "/admin/taches",
    title: "Tâches",
    description: "Référentiel des tâches du plan d'action (code et description).",
    icon: ClipboardList,
  },
  {
    href: "/admin/projets",
    title: "Projets",
    description: "Suivi des projets et exécution financière / physique.",
    icon: FolderKanban,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Plan d'Action"
        description={`Vue d'ensemble — objectifs, tâches et projets du ${BRAND.bureau}.`}
        display
        aurora
      />
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="hub-card group block p-6">
            <div className="hub-card-icon mb-4">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="font-display text-lg text-canvas-white">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-warm-sand">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 font-mono-label text-bioluminescent-teal group-hover:gap-2.5 transition-all">
              Accéder
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
