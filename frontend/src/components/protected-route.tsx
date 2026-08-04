"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/connexion");
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isLoading, isAdmin, adminOnly, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-fog">
        Chargement…
      </div>
    );
  }

  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
