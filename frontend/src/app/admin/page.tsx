import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 space-y-8 p-8">
          <PageHeader
            eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
            title="Plan d'Action"
            description={`Hub de gestion des objectifs OCT / OMT / OLT — ${BRAND.bureau}.`}
            display
          />
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs 2025 (OCT)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate">
                  Objectifs clés de transformation pour l&apos;année 2025.
                </p>
                <Link href="/admin/oct">
                  <Button variant="outline">Consulter</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Objectifs 2026 (OMT)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate">
                  Objectifs moyen terme pour l&apos;année 2026.
                </p>
                <Link href="/admin/omt">
                  <Button variant="outline">Consulter</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Objectifs 2027 (OLT)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate">
                  Objectifs long terme pour l&apos;année 2027.
                </p>
                <Link href="/admin/olt">
                  <Button variant="outline">Consulter</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
