"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { OBJECTIF_LABELS, type ObjectifType } from "@/types";

const tabs: ObjectifType[] = ["oct", "omt", "olt"];

export function ObjectifTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((type) => {
        const href = `/admin/${type}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const { label, year } = OBJECTIF_LABELS[type];
        return (
          <Link
            key={type}
            href={href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-700 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-emerald-50",
            )}
          >
            {label} — {year}
          </Link>
        );
      })}
    </div>
  );
}
