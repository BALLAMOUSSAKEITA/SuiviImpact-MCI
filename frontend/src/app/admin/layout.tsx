import { AdminShell } from "@/components/admin-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { RoleRouteGuard } from "@/components/role-route-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleRouteGuard>
        <AdminShell>{children}</AdminShell>
      </RoleRouteGuard>
    </ProtectedRoute>
  );
}
