// ─── App Layout Group ────────────────────────────────────────────────────────
// All authenticated pages use this layout, which includes the nav shell.

import AppLayout from "@/components/shared/AppLayout";
import QueryProvider from "@/components/shared/QueryProvider";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AppLayout>{children}</AppLayout>
    </QueryProvider>
  );
}
