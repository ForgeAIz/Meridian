// ─── OnboardingWizard ────────────────────────────────────────────────────────
// First-time user experience: guided setup with template snapshots.

"use client";

import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  assets: { name: string; category: string; currency: string; value: number }[];
  liabilities: { name: string; category: string; currency: string; value: number }[];
}

const TEMPLATES: Template[] = [
  {
    id: "uk-homeowner",
    name: "Typical UK Homeowner",
    description: "Property, mortgage, ISA, and savings",
    emoji: "\ud83c\udfe0",
    assets: [
      { name: "Main Property", category: "Property", currency: "GBP", value: 450000 },
      { name: "S&S ISA", category: "Investments", currency: "GBP", value: 42000 },
      { name: "Emergency Fund", category: "Cash", currency: "GBP", value: 15000 },
      { name: "Work Pension", category: "Retirement", currency: "GBP", value: 85000 },
    ],
    liabilities: [
      { name: "Mortgage", category: "Mortgage", currency: "GBP", value: 380000 },
    ],
  },
  {
    id: "digital-nomad",
    name: "Digital Nomad",
    description: "Global cash, crypto, no fixed property",
    emoji: "\ud83c\udf0d",
    assets: [
      { name: "Savings Account", category: "Cash", currency: "USD", value: 35000 },
      { name: "Crypto Portfolio", category: "Investments", currency: "USD", value: 50000 },
      { name: "Index Funds", category: "Investments", currency: "USD", value: 45000 },
    ],
    liabilities: [],
  },
  {
    id: "recent-grad",
    name: "Recent Graduate",
    description: "Student loan, starter savings",
    emoji: "\ud83c\udf93",
    assets: [
      { name: "Current Account", category: "Cash", currency: "GBP", value: 4500 },
      { name: "Starter ISA", category: "Investments", currency: "GBP", value: 2000 },
    ],
    liabilities: [
      { name: "Student Loan", category: "Student Debt", currency: "GBP", value: 45000 },
    ],
  },
  {
    id: "empty-start",
    name: "Start from Scratch",
    description: "Blank slate \u2014 add your own entries",
    emoji: "\u2728",
    assets: [],
    liabilities: [],
  },
];

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const router = useRouter();

  function handleSelect(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      sessionStorage.setItem("meridian-onboarding-template", JSON.stringify(template));
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/entry?month=${currentMonth}&onboarding=true`);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl text-ink">Welcome to Meridian</h2>
        <p className="mt-2 text-sm text-slate">
          Pick a starting point, or start from scratch. You can edit everything later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            className="rounded-lg border-2 border-slate/15 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-slate/30 hover:shadow-md"
          >
            <div className="text-2xl mb-2">{template.emoji}</div>
            <h3 className="font-display text-base text-ink">{template.name}</h3>
            <p className="mt-1 text-xs text-slate">{template.description}</p>
            <div className="mt-3 flex gap-3 text-[10px] text-slate/50 font-mono">
              <span>{template.assets.length} assets</span>
              <span>{template.liabilities.length} liabilities</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-slate/50">
        Your data stays on your device until you save. No bank linking needed.
      </p>
    </div>
  );
}
