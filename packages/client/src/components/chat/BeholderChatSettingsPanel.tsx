import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Settings2 } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { api } from "../../lib/api-client";
import BeholderDoll, { type BeholderDollLayout } from "./beholder/BeholderDoll";

type BeholderStateResponse = {
  state: {
    characters: Array<{
      name: string;
      species?: string;
      body: Record<string, unknown>;
    }>;
  };
  messageId: string | null;
  createdAt: string | null;
};

const LAYOUT_STORAGE_KEY = "marinara.beholder.layout";
const LAYOUTS: readonly BeholderDollLayout[] = ["paired", "columns", "list"];

function readStoredLayout(): BeholderDollLayout {
  if (typeof window === "undefined") return "paired";
  const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  return LAYOUTS.includes(stored as BeholderDollLayout) ? (stored as BeholderDollLayout) : "paired";
}

export default function BeholderChatSettingsPanel({
  chatId,
  onOpenAgentSettings,
}: {
  chatId: string;
  onOpenAgentSettings: () => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const queryClient = useQueryClient();
  const [layout, setLayout] = useState<BeholderDollLayout>(readStoredLayout);
  const [activeName, setActiveName] = useState<string | null>(null);
  const queryKey = useMemo(() => ["beholder-state", chatId] as const, [chatId]);
  const stateQuery = useQuery({
    queryKey,
    queryFn: () => api.get<BeholderStateResponse>(`/agents/beholder-state/${encodeURIComponent(chatId)}`),
    staleTime: 30_000,
  });

  useEffect(() => {
    const handleGenerationComplete = (event: Event) => {
      const detail = (event as CustomEvent<{ chatId?: string }>).detail;
      if (detail?.chatId === chatId) void queryClient.invalidateQueries({ queryKey });
    };
    window.addEventListener("marinara:generation-complete", handleGenerationComplete);
    return () => window.removeEventListener("marinara:generation-complete", handleGenerationComplete);
  }, [chatId, queryClient, queryKey]);

  const chooseLayout = useCallback((next: BeholderDollLayout) => {
    setLayout(next);
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    } catch {
      // A blocked storage write must not break the panel.
    }
  }, []);

  const characters = stateQuery.data?.state.characters ?? [];

  return (
    <div className="mt-2 space-y-2 border-t border-[var(--border)] pt-2.5">
      <div className="flex gap-2 rounded-lg bg-[var(--primary)]/8 px-2.5 py-2 ring-1 ring-[var(--primary)]/20">
        <AlertTriangle size="0.75rem" className="mt-0.5 shrink-0 text-[var(--primary)]" />
        <p className="text-[0.59375rem] leading-snug text-[var(--muted-foreground)]">
          {localizeUi("ui.chat.beholder.sotaRecommendation")}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenAgentSettings}
        className="flex w-full items-center gap-2 rounded-lg bg-[var(--secondary)]/70 px-2.5 py-2 text-left transition-colors hover:bg-[var(--accent)]"
      >
        <Settings2 size="0.75rem" className="shrink-0 text-[var(--primary)]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.625rem] font-medium text-[var(--foreground)]">
            {localizeUi("ui.chat.beholder.configureAgent")}
          </span>
          <span className="block text-[0.5625rem] text-[var(--muted-foreground)]">
            {localizeUi("ui.chat.beholder.configureAgentDescription")}
          </span>
        </span>
      </button>

      {stateQuery.isLoading ? (
        <div className="flex items-center gap-1.5 py-1 text-[0.59375rem] text-[var(--muted-foreground)]">
          <Loader2 size="0.6875rem" className="animate-spin" />
          {localizeUi("ui.chat.beholder.loadingState")}
        </div>
      ) : stateQuery.isError ? (
        <p className="text-[0.59375rem] text-[var(--destructive)]">{localizeUi("ui.chat.beholder.stateUnavailable")}</p>
      ) : (
        <>
          <BeholderDoll
            characters={characters}
            activeName={activeName}
            layout={layout}
            onSelectCharacter={setActiveName}
            onSelectLayout={chooseLayout}
          />
          {characters.length === 0 ? (
            <p className="text-[0.59375rem] leading-snug text-[var(--muted-foreground)]">
              {localizeUi("ui.chat.beholder.emptyState")}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
