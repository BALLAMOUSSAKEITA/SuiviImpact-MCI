import { AdminShell } from "@/components/admin-shell";
import { ProtectedRoute } from "@/components/protected-route";

export default function ActiviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
