// ─── AuthGate ───────────────────────────────────────────────────────────────
// Provides auth context to the app. The middleware.ts handles route protection
// at the server level; this component provides the user object to all children.
// It also handles the loading state while the initial session is resolved.

"use client";

import { AuthProvider } from "@/hooks/useAuth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
