// ─── Login Page ─────────────────────────────────────────────────────────────
// Handles email/password sign-in and signup.
// useSearchParams must be wrapped in a Suspense boundary per Next.js 15+.

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/queries";
import { LogoLockup } from "@/components/shared/Logo";

type AuthMode = "signin" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to") ?? "/dashboard";

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) throw signInError;
        router.push(returnTo);
      } else {
        const { error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) throw signUpError;
        setSuccessMessage("Check your email to confirm your account.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <LogoLockup size="md" color="brass" />
        </div>

        <p className="mb-8 text-center text-xs text-slate">
          Track your line. Own your trajectory.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
            {error}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 rounded border border-signal-sage/30 bg-signal-sage/10 px-4 py-3 text-sm text-signal-sage">
            {successMessage}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded border border-slate/30 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate/50 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              className="mt-1 w-full rounded border border-slate/30 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate/50 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#8B6B2E] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#7A5D28] disabled:opacity-50"
          >
            {loading
              ? "Please wait\u2026"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="mt-6 text-center text-sm text-slate">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-brass hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-brass hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
