// ─── Goals Page ──────────────────────────────────────────────────────────────
// Manage financial goals: create, edit, delete, view progress projections.

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { useDashboardData } from "@/hooks/useDashboardData";
import GoalList from "@/components/goals/GoalList";
import GoalForm from "@/components/goals/GoalForm";
import type { Goal, Currency } from "@/lib/types";

export default function GoalsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { goals, isLoading, error, createMutation, editMutation, removeMutation } =
    useGoals();
  const { data: dashboardData } = useDashboardData();
  const snapshots = dashboardData?.snapshots ?? [];

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ─── Create goal ───────────────────────────────────────────────────

  function handleCreate(data: {
    userId: string;
    label: string;
    targetNetWorth: number;
    targetDate: string;
    currency: Currency;
  }) {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  }

  // ─── Edit goal ─────────────────────────────────────────────────────

  function handleEdit(data: {
    userId: string;
    label: string;
    targetNetWorth: number;
    targetDate: string;
    currency: Currency;
  }) {
    if (!editingGoal) return;
    editMutation.mutate(
      {
        goalId: editingGoal.id,
        updates: {
          label: data.label,
          targetNetWorth: data.targetNetWorth,
          targetDate: data.targetDate,
        },
      },
      {
        onSuccess: () => {
          setEditingGoal(null);
          setShowForm(false);
        },
      }
    );
  }

  // ─── Delete goal ───────────────────────────────────────────────────

  function handleDelete(goalId: string) {
    if (window.confirm("Delete this goal? This cannot be undone.")) {
      removeMutation.mutate(goalId);
    }
  }

  const isSaving = createMutation.isPending || editMutation.isPending;

  // ─── Loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-clay/30 bg-clay/10 px-6 py-12 text-center">
        <p className="text-sm text-clay">Failed to load goals.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-ink"
        >
          Try again
        </button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Goals</h1>
          <p className="mt-1 text-sm text-slate">
            Set financial targets and track your progress.
          </p>
        </div>
        {!showForm && !editingGoal && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded bg-brass px-4 py-2 text-sm text-white transition-colors hover:bg-brass/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add goal
          </button>
        )}
      </div>

      {/* Form (create or edit) */}
      {(showForm || editingGoal) && (
        <GoalForm
          initialGoal={editingGoal}
          onSave={editingGoal ? handleEdit : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
          userId={userId}
          isSaving={isSaving}
        />
      )}

      {/* Goal list */}
      <GoalList
        goals={goals}
        snapshots={snapshots}
        onEdit={(goal) => {
          setEditingGoal(goal);
          setShowForm(false);
        }}
        onDelete={handleDelete}
        isDeleting={removeMutation.isPending}
      />
    </div>
  );
}
