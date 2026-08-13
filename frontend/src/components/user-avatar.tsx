"use client";

import { useEffect, useState } from "react";

import { fetchMyAvatarBlob } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  prenom: string;
  nom?: string;
  hasAvatar?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "h-9 w-9 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
};

export function UserAvatar({ prenom, nom, hasAvatar, className, size = "sm" }: UserAvatarProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const initial = (prenom?.charAt(0) || nom?.charAt(0) || "U").toUpperCase();

  useEffect(() => {
    if (!hasAvatar) {
      setObjectUrl(null);
      return;
    }
    let cancelled = false;
    let url: string | null = null;

    void (async () => {
      try {
        const blob = await fetchMyAvatarBlob();
        url = URL.createObjectURL(blob);
        if (!cancelled) setObjectUrl(url);
        else URL.revokeObjectURL(url);
      } catch {
        if (!cancelled) setObjectUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [hasAvatar, prenom, nom]);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[#0d4f38] text-white",
        sizeClass[size],
        className,
      )}
    >
      {objectUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={objectUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold">{initial}</span>
      )}
    </div>
  );
}
