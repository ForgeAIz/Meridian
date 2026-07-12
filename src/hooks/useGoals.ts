// ─── useGoals Hook ──────────────────────────────────────────────────────────
// React Query wrapper for goal CRUD operations.

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchGoals, insertGoal, updateGoal, deleteGoal } from "@/lib/supabase/queries";
import type { Goal } from "@/lib/types";

export function useGoals() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery<Goal[]>({
    queryKey: ["goals", userId],
    queryFn: () => fetchGoals(userId),
    enabled: !authLoading && !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (goal: Omit<Goal, "id" | "createdAt">) => insertGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: Partial<Pick<Goal, "label" | "targetNetWorth" | "targetDate">>;
    }) => updateGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  return {
    goals,
    isLoading,
    error,
    createMutation,
    editMutation,
    removeMutation,
  };
}
