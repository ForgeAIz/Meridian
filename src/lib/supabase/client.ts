// ─── Supabase Client ─────────────────────────────────────────────────────────
// Browser-side client for Next.js App Router.
// Uses @supabase/ssr for cookie-based session handling.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
