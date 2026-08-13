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
    <>
      <header className="app-masthead">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {onToggleMobile && (
            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-hairline text-graphite transition-colors hover:bg-pebble lg:hidden"
              onClick={onToggleMobile}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Image
              src="/branding/armoiries-guinee.jpg"
              alt="Armoiries de la République de Guinée"
              width={64}
              height={72}
              className="h-[3.35rem] w-auto shrink-0 object-contain sm:h-[3.75rem]"
              priority
            />
            <div className="min-w-0">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-graphite">
                {BRAND.country}
              </p>
              <p className="font-display mt-0.5 truncate text-[1.05rem] font-semibold leading-snug text-graphite sm:text-[1.2rem]">
                {BRAND.ministry}
              </p>
              <p className="mt-0.5 hidden truncate text-[13px] text-slate sm:block">
                {BRAND.bureau}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 border-l border-hairline pl-6 md:flex">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <Image
              src="/branding/simandou-2040.png"
              alt="Programme Simandou 2040"
              width={160}
              height={64}
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <div className="app-banner">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-[1.35rem] font-semibold leading-none text-white sm:text-[1.55rem]">
              {BRAND.appName}
            </p>
            <p className="mt-1.5 hidden text-[13px] leading-snug text-white/75 sm:block">
              {BRAND.tagline}
            </p>
          </div>

          <Link
            href="/admin/profil"
            className="flex shrink-0 items-center gap-3 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Mon profil"
          >
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold leading-tight">{displayName}</span>
              {roleLabel && (
                <span className="mt-0.5 block text-[11px] text-white/70">{roleLabel}</span>
              )}
            </span>
            <UserAvatar
              prenom={prenom}
              nom={nom}
              hasAvatar={hasAvatar}
              size="sm"
              className="bg-white/15 text-white"
            />
          </Link>
        </div>
      </div>
    </>
  );
}
