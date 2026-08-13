"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface InstitutionalMastheadProps {
  prenom?: string;
  nom?: string;
  hasAvatar?: boolean;
  mobileOpen?: boolean;
  onToggleMobile?: () => void;
}

export function InstitutionalMasthead({
  prenom = "",
  nom,
  hasAvatar,
  mobileOpen,
  onToggleMobile,
}: InstitutionalMastheadProps) {
  return (
    <>
      <header className="app-masthead">
        <div className="flex items-center gap-3 px-3 py-2 sm:gap-4 sm:px-5 lg:px-6">
          {onToggleMobile && (
            <button
              type="button"
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline text-graphite transition-colors hover:bg-pebble lg:hidden"
              onClick={onToggleMobile}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/branding/armoiries-guinee.jpg"
              alt="Armoiries de la République de Guinée"
              width={48}
              height={54}
              className="h-10 w-auto shrink-0 object-contain sm:h-12"
              priority
            />
            <div className="min-w-0">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite sm:text-[11px]">
                {BRAND.country}
              </p>
              <p className="font-display truncate text-[13px] font-semibold leading-snug text-graphite sm:text-[15px]">
                {BRAND.ministry}
              </p>
              <p className="hidden truncate text-[12px] text-slate sm:block">
                {BRAND.bureau}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={90}
              height={30}
              className="h-7 w-auto object-contain"
            />
            <Image
              src="/branding/simandou-2040.png"
              alt="Programme Simandou 2040"
              width={140}
              height={56}
              className="h-10 w-auto object-contain"
            />
          </div>

          <Link
            href="/admin/profil"
            className="flex shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-ink/30"
            aria-label="Mon profil"
          >
            <UserAvatar prenom={prenom} nom={nom} hasAvatar={hasAvatar} size="sm" />
          </Link>
        </div>
      </header>

      <div className="app-banner">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2 sm:px-5 lg:px-6">
          <p className="font-display text-[1.05rem] font-semibold leading-none text-white sm:text-lg">
            {BRAND.appName}
          </p>
          <p
            className={cn(
              "hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:block",
            )}
          >
            Espace agents — {BRAND.bureauShort}
          </p>
        </div>
      </div>
    </>
  );
}
