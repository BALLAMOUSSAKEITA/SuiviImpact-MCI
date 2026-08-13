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
      <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-5 lg:px-7">
        {onToggleMobile && (
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#0d4f38] text-[#0d4f38] hover:bg-[#e0f5ea] lg:hidden"
            onClick={onToggleMobile}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Image
            src="/branding/armoiries-guinee.jpg"
            alt="Armoiries de la République de Guinée"
            width={52}
            height={58}
            className="h-11 w-auto shrink-0 object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a6b5c]">
              {BRAND.country}
            </p>
            <p className="font-display truncate text-[13px] font-semibold leading-snug text-[#0d4f38] sm:text-[15px]">
              <span className="sm:hidden">
                {BRAND.ministryShort} · {BRAND.bureauShort}
              </span>
              <span className="hidden sm:inline">{BRAND.ministry}</span>
            </p>
          </div>

          <div className="hidden h-10 w-px shrink-0 bg-[#d4e5dc] sm:block" aria-hidden />

          <div
            className="hidden shrink-0 bg-[#0d4f38] px-3.5 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] sm:block"
            title={BRAND.tagline}
          >
            <p className="font-display text-[1.05rem] font-semibold leading-none text-white">
              {BRAND.appName}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
              {BRAND.bureauShort} · Espace agents
            </p>
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
          className="flex shrink-0 items-center gap-2.5 border-l border-[#d4e5dc] pl-3 text-[#0d4f38] hover:bg-[#f6faf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d4f38]/30"
          aria-label="Mon profil"
        >
          <span className="hidden text-right md:block">
            <span className="block text-[13px] font-semibold leading-tight">{displayName}</span>
            {roleLabel && (
              <span className="mt-0.5 block text-[11px] text-[#4a6b5c]">{roleLabel}</span>
            )}
          </span>
          <UserAvatar prenom={prenom} nom={nom} hasAvatar={hasAvatar} size="sm" />
        </Link>
      </div>
    </header>
  );
}
