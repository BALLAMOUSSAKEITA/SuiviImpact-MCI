"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { defaultHomeForRole, isPathAllowed } from "@/lib/roles";

export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isPathAllowed(user.role, pathname, user.allowed_tabs)) {
      router.replace(defaultHomeForRole(user.role, user.allowed_tabs));
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) return null;

  if (!isPathAllowed(user.role, pathname, user.allowed_tabs)) {
    return (
      <div className="py-12 text-center text-sm text-ash">
        Redirection…
      </div>
    );
  }

  return <>{children}</>;
}
