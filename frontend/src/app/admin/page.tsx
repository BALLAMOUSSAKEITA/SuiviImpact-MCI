import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-zinc-900">Plan d&apos;Action</h1>
          <p className="mt-2 text-zinc-600">
            Hub de gestion des objectifs OCT / OMT / OLT — BSD MIPME.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objectifs 2025 (OCT)</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/oct">
                  <Button variant="outline">Consulter</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objectifs 2026 (OMT)</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/omt">
                  <Button variant="outline">Consulter</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objectifs 2027 (OLT)</CardTitle>
              </CardHeader>
              <CardContent>
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
