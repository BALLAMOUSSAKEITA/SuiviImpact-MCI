import Link from "next/link";
import { ArrowRight, ClipboardList, FolderKanban, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    href: "/admin/objectifs",
    title: "Objectifs",
    description: "Créer et gérer les objectifs du plan d'action, puis leurs activités.",
    icon: Target,
  },
  {
    href: "/admin/taches",
    title: "Tâches",
    description: "Créer et gérer les tâches du plan d'action (code et description).",
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

      <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border bg-gray-200 sm:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col justify-between bg-white p-5 transition-colors hover:bg-gray-50"
          >
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                <span className="text-sm font-medium text-gray-900">{title}</span>
              </div>
              <p className="text-[13px] leading-relaxed text-gray-500">{description}</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Ouvrir
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
