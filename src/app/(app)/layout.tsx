// ─── Authenticated Layout Group ─────────────────────────────────────────────
// All authenticated pages use this layout, which includes the nav shell.

import AppLayout from "@/components/shared/AppLayout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
