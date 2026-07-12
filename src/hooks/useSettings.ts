// ─── useSettings Hook ───────────────────────────────────────────────────────
// Fetches and updates user settings (base currency, theme, etc.).

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchSettings, updateSettings as updateSettingsQuery } from "@/lib/supabase/queries";
import type { Currency, Settings } from "@/lib/types";

export function useSettings() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<Settings | null>({
    queryKey: ["settings", userId],
    queryFn: () => fetchSettings(userId),
    enabled: !authLoading && !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<Settings, "baseCurrency" | "theme" | "monthStartPrefill">>) =>
      updateSettingsQuery(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", userId] });
    },
  });

  return {
    settings,
    baseCurrency: settings?.baseCurrency ?? "GBP",
    isLoading,
    error,
    updateMutation,
  };
}
