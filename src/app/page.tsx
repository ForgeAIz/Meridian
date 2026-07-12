// ─── Landing Page ───────────────────────────────────────────────────────────
// Public homepage — instrument aesthetic, calm and precise.
// Shows the product immediately, builds trust, and drives signup.

import Link from "next/link";
import HeroChart from "@/components/landing/HeroChart";
import { LogoLockup } from "@/components/shared/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* ─── Navigation ──────────────────────────────────────────── */}
      <header className="border-b border-slate/15 px-6">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <LogoLockup size="sm" color="brass" />
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-slate transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-[#8B6B2E] px-4 py-2 text-sm text-white transition-all hover:bg-[#7A5D28] hover:shadow-sm"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-5 md:gap-16">
            {/* Copy */}
            <div className="md:col-span-3 flex flex-col justify-center">
              <h1 className="font-display text-4xl leading-tight tracking-tight text-ink md:text-6xl">
                Track your line.
                <br />
                <span className="text-[#8B6B2E]">Own your trajectory.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate md:text-base md:leading-[1.7]">
                Meridian is a net worth tracker built for clarity, not noise.
                One deliberate snapshot a month — see where you stand, where
                you&apos;re heading, and whether your money is actually moving
                the right direction.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/login"
                  className="rounded-md bg-[#8B6B2E] px-6 py-3 text-sm text-white transition-all hover:bg-[#7A5D28] hover:shadow-md active:translate-y-[1px]"
                >
                  Start your first month
                </Link>
                <Link
                  href="#how-it-works"
                  className="rounded-md border border-slate/30 px-6 py-3 text-sm text-slate transition-colors hover:border-slate/50 hover:text-ink"
                >
                  How it works
                </Link>
              </div>
            </div>

            {/* Product visualization */}
            <div className="md:col-span-2 flex items-center">
              <div className="w-full rounded-lg border border-slate/15 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#8B6B2E]" />
                    <span className="text-[10px] font-mono text-slate/60">Net Worth</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-slate/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-slate/20" />
                  </div>
                </div>
                <p className="font-mono text-lg font-medium text-ink">£130,500</p>
                <p className="font-mono text-xs text-signal-sage">+£1,700 (1.3%)</p>
                <div className="mt-3">
                  <HeroChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Line ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6">
        <svg className="w-full" height="2" viewBox="0 0 1200 2" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="1" x2="1200" y2="1" stroke="#8B6B2E" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="px-6 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl text-center text-ink md:text-3xl">
            Three minutes, once a month
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate">
            No bank linking. No daily noise. Just your financial position,
            captured month by month.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {/* Step 1 */}
            <div className="flex gap-4 md:flex-col md:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8B6B2E]/25 bg-[#8B6B2E]/8">
                <span className="font-display text-sm text-[#8B6B2E]">01</span>
              </div>
              <div>
                <h3 className="font-display text-base text-ink">Record</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  Each month, update what you own and what you owe. Your
                  previous month&apos;s entries are carried forward — you&apos;re
                  editing deltas, not starting from zero.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 md:flex-col md:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8B6B2E]/25 bg-[#8B6B2E]/8">
                <span className="font-display text-sm text-[#8B6B2E]">02</span>
              </div>
              <div>
                <h3 className="font-display text-base text-ink">Lock</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  Hit save and your snapshot is frozen with the day&apos;s
                  exchange rates. History stays accurate — no silent
                  recalculations, no drifting numbers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 md:flex-col md:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8B6B2E]/25 bg-[#8B6B2E]/8">
                <span className="font-display text-sm text-[#8B6B2E]">03</span>
              </div>
              <div>
                <h3 className="font-display text-base text-ink">See the trend</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  Your dashboard builds a time series automatically — net worth
                  trend, leverage ratio, asset allocation, goal projections.
                  The line tells the story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate/10 bg-white/50 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl text-center text-ink md:text-3xl">
            Built around the snapshot
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate">
            Every feature exists to answer one question: is my net worth moving
            the right direction?
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <FeatureCard
              title="Multi-currency"
              description="Hold assets in USD, GBP, EUR, AUD, or CAD. Everything converts to your base currency at lock time — rates are frozen, not floating."
              graphic={
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate">10,000</span>
                  <span className="text-ink font-medium">GBP</span>
                  <span className="text-slate/40">→</span>
                  <span className="text-[#8B6B2E] font-medium">12,700</span>
                  <span className="text-ink font-medium">USD</span>
                </div>
              }
            />
            <FeatureCard
              title="Net leverage ratio"
              description="See how much of your asset base is financed by debt. Track it monthly — a falling line means you&apos;re deleveraging."
              graphic={
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="flex items-center gap-1">
                    <span className="text-slate">£</span>
                    <span className="text-slate">507k</span>
                  </span>
                  <span className="text-slate/30">/</span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate">£</span>
                    <span className="text-slate">377k</span>
                  </span>
                  <span className="text-slate/30">=</span>
                  <span className="text-signal-sage font-medium">0.74</span>
                  <span className="text-signal-sage/60 text-[10px]">↓ improving</span>
                </div>
              }
            />
            <FeatureCard
              title="Goal projections"
              description="Set a target like Retire by 55 or House deposit and Meridian projects your pace using your trailing 6-month average growth."
              graphic={
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="h-1.5 w-24 rounded-full bg-slate/10 overflow-hidden">
                    <div className="h-full w-[62%] rounded-full bg-[#8B6B2E]" />
                  </div>
                  <span className="text-[#8B6B2E] font-medium">62%</span>
                  <span className="text-slate/50 text-[10px]">On track</span>
                </div>
              }
            />
            <FeatureCard
              title="Two-state snapshots"
              description="DRAFT while you edit — live totals, flexible rows, instant recalculation. LOCKED when you submit — frozen history, trustworthy charts."
              graphic={
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="rounded border border-slate/20 bg-white px-2 py-0.5 text-slate">DRAFT</span>
                  <span className="text-slate/30">→</span>
                  <span className="rounded border border-[#8B6B2E]/30 bg-[#8B6B2E]/8 px-2 py-0.5 text-[#8B6B2E]">LOCKED</span>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRUST */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate/10 px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-xl text-ink md:text-2xl">
            Your data, your control
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate">
            Meridian uses <strong className="text-ink">manual entry</strong> — no
            bank feeds, no live API connections to your accounts. Your financial
            data is encrypted at rest and isolated per user. You can export or
            delete everything at any time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate/50">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#8B6B2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              Encrypted at rest
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#8B6B2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>
              Full export &amp; delete
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#8B6B2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              No bank linking required
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate/10 bg-white/30 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Ready to find your line?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            No bank feeds. No setup fees. Just your numbers, your trajectory,
            and one quiet moment a month.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-md bg-[#8B6B2E] px-8 py-3 text-sm text-white transition-all hover:bg-[#7A5D28] hover:shadow-md active:translate-y-[1px]"
          >
            Start your first month
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate/15 bg-[#EDE8DF] px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <LogoLockup size="sm" color="brass" />
          </div>

          <nav className="flex items-center gap-6 text-xs text-slate/60">
            <Link href="#" className="hover:text-slate transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate transition-colors">Contact</Link>
          </nav>

          <p className="text-xs text-slate/40">
            &copy; {new Date().getFullYear()} Meridian. Track your line. Own your trajectory.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({
  title,
  description,
  graphic,
}: {
  title: string;
  description: string;
  graphic?: React.ReactNode;
}) {
  return (
    <div className="group rounded-lg border border-slate/15 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-slate/25 hover:shadow-sm space-y-3">
      {graphic && (
        <div className="rounded-md bg-paper border border-slate/10 px-3 py-2.5">
          {graphic}
        </div>
      )}
      <div>
        <h3 className="font-display text-sm text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate">{description}</p>
      </div>
    </div>
  );
}
