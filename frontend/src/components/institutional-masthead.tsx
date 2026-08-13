"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import { BRAND } from "@/lib/brand";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/types";

interface InstitutionalMastheadProps {
  prenom?: string;
  nom?: string;
  hasAvatar?: boolean;
  role?: UserRole;
  mobileOpen?: boolean;
  onToggleMobile?: () => void;
}

export function InstitutionalMasthead({
  prenom = "",
  nom,
  hasAvatar,
  role,
  mobileOpen,
  onToggleMobile,
}: InstitutionalMastheadProps) {
  const displayName = [prenom, nom].filter(Boolean).join(" ") || "Mon profil";
  const roleLabel = role ? ROLE_LABELS[role] : null;

  return (
    <header className="app-masthead">
      <div className="flex items-center gap-3 px-3 py-2 sm:gap-4 sm:px-5 lg:px-6">
        {onToggleMobile && (
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline text-graphite transition-colors hover:bg-pebble lg:hidden"
            onClick={onToggleMobile}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Image
            src="/branding/armoiries-guinee.jpg"
            alt="Armoiries de la République de Guinée"
            width={48}
            height={54}
            className="h-10 w-auto shrink-0 object-contain sm:h-11"
            priority
          />
          <div className="min-w-0">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">
              {BRAND.country}
            </p>
            <p className="font-display truncate text-[13px] font-semibold leading-tight text-graphite sm:text-[15px]">
              <span className="sm:hidden">
                {BRAND.ministryShort} · {BRAND.bureauShort}
              </span>
              <span className="hidden sm:inline">{BRAND.ministry}</span>
            </p>
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-hairline sm:block" aria-hidden />

          <div className="hidden min-w-0 sm:block">
            <p className="font-display text-[1.15rem] font-semibold leading-none text-forest-ink">
              {BRAND.appName}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate">Espace agents</p>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Image
            src="/branding/guinee-nimba.png"
            alt="Guinée"
            width={88}
            height={28}
            className="h-6 w-auto object-contain"
          />
          <Image
            src="/branding/simandou-2040.png"
            alt="Programme Simandou 2040"
            width={120}
            height={48}
            className="h-9 w-auto object-contain"
          />
        </div>

        <Link
          href="/admin/profil"
          className="flex shrink-0 items-center gap-2.5 text-graphite transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-ink/30"
          aria-label="Mon profil"
        >
          <span className="hidden text-right md:block">
            <span className="block text-[13px] font-semibold leading-tight">{displayName}</span>
            {roleLabel && (
              <span className="mt-0.5 block text-[11px] text-slate">{roleLabel}</span>
            )}
          </span>
          <UserAvatar prenom={prenom} nom={nom} hasAvatar={hasAvatar} size="sm" />
        </Link>
      </div>
    </header>
  );
}
