import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eye, Grip, List, Loader2, Settings2, Table2 } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { api } from "../../lib/api-client";
import {
  BEHOLDER_LAYOUTS,
  buildBeholderRows,
  slotLabel,
  withDependentMissing,
  type BeholderBodyView,
  type BeholderLayout,
  type BeholderSlotView,
} from "./beholder-doll";

type Damage = "pristine" | "damaged" | "cracked" | "broken";
type WoundSeverity = "minor" | "serious" | "critical";

type BeholderStateResponse = {
  state: {
    characters: Array<{
      name: string;
      species?: string;
      body: Record<string, BeholderSlotView>;
    }>;
  };
  messageId: string | null;
  createdAt: string | null;
};

const LAYOUT_STORAGE_KEY = "marinara.beholder.layout";

const LAYOUT_ICON = {
  paired: Grip,
  columns: Table2,
  list: List,
} as const;

function readStoredLayout(): BeholderLayout {
  if (typeof window === "undefined") return "paired";
  const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  return BEHOLDER_LAYOUTS.includes(stored as BeholderLayout) ? (stored as BeholderLayout) : "paired";
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
  const [layout, setLayout] = useState<BeholderLayout>(readStoredLayout);
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

  const chooseLayout = useCallback((next: BeholderLayout) => {
    setLayout(next);
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    } catch {
      // A blocked storage write must not break the panel.
    }
  }, []);

  const characters = stateQuery.data?.state.characters ?? [];
  const damageLabel = (damage: Damage) => localizeUi(`ui.chat.beholder.damage.${damage}`);
  const severityLabel = (severity: WoundSeverity) => localizeUi(`ui.chat.beholder.severity.${severity}`);

  const renderSlot = (slotName: string, slot: BeholderSlotView | undefined) => {
    const empty = !slot || (!slot.worn?.length && !slot.wounds?.length && !slot.holding && !slot.bare && !slot.missing);
    return (
      <div
        key={slotName}
        className={`min-w-0 rounded-md px-1.5 py-1 ring-1 ${
          empty ? "bg-transparent ring-[var(--border)]/40" : "bg-[var(--background)]/60 ring-[var(--border)]"
        }`}
      >
        <div className="truncate text-[0.5rem] uppercase tracking-wide text-[var(--muted-foreground)]">
          {slotLabel(slotName)}
        </div>
        {empty ? (
          <div className="text-[0.5625rem] text-[var(--muted-foreground)]/60">—</div>
        ) : (
          <div className="space-y-0.5">
            {slot?.missing ? (
              <div className="text-[0.5625rem] font-medium text-[var(--destructive)]">
                {slot.derivedMissing
                  ? localizeUi("ui.chat.beholder.missingDerived")
                  : localizeUi("ui.chat.beholder.missing")}
              </div>
            ) : null}
            {slot?.bare ? (
              <div className="text-[0.5625rem] italic text-[var(--muted-foreground)]">
                {localizeUi("ui.chat.beholder.bare")}
              </div>
            ) : null}
            {(slot?.worn ?? []).map((item, index) => (
              <div key={`${item.item}-${index}`} className="truncate text-[0.5625rem] text-[var(--foreground)]/85">
                {[item.color, item.material, item.item].filter(Boolean).join(" ")}
                {item.damage !== "pristine" ? (
                  <span className="text-[var(--destructive)]"> · {damageLabel(item.damage as Damage)}</span>
                ) : null}
              </div>
            ))}
            {slot?.holding ? (
              <div className="truncate text-[0.5625rem] text-[var(--primary)]">
                {localizeUi("ui.chat.beholder.holdingValue", {
                  value: `${slot.holding.item}${
                    slot.holding.damage !== "pristine" ? ` (${damageLabel(slot.holding.damage as Damage)})` : ""
                  }`,
                })}
              </div>
            ) : null}
            {(slot?.wounds ?? []).map((wound, index) => (
              <div key={`${wound.text}-${index}`} className="truncate text-[0.5625rem] text-[var(--destructive)]">
                {wound.text} ({severityLabel(wound.severity as WoundSeverity)}
                {wound.bleeding ? localizeUi("ui.chat.beholder.bleedingSuffix") : ""})
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

      <section className="rounded-lg bg-[var(--background)]/65 p-2.5 ring-1 ring-[var(--border)]">
        <div className="mb-2 flex items-center gap-1.5">
          <Eye size="0.75rem" className="text-[var(--primary)]" />
          <h4 className="flex-1 text-[0.625rem] font-semibold text-[var(--foreground)]">
            {localizeUi("ui.chat.beholder.latestState")}
          </h4>
          <div className="flex gap-0.5" role="group" aria-label={localizeUi("ui.chat.beholder.layoutGroup")}>
            {BEHOLDER_LAYOUTS.map((mode) => {
              const Icon = LAYOUT_ICON[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseLayout(mode)}
                  aria-pressed={layout === mode}
                  title={localizeUi(`ui.chat.beholder.layout.${mode}`)}
                  aria-label={localizeUi(`ui.chat.beholder.layout.${mode}`)}
                  className={`rounded p-1 transition-colors ${
                    layout === mode
                      ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  <Icon size="0.6875rem" />
                </button>
              );
            })}
          </div>
        </div>

        {stateQuery.isLoading ? (
          <div className="flex items-center gap-1.5 py-1 text-[0.59375rem] text-[var(--muted-foreground)]">
            <Loader2 size="0.6875rem" className="animate-spin" />
            {localizeUi("ui.chat.beholder.loadingState")}
          </div>
        ) : stateQuery.isError ? (
          <p className="text-[0.59375rem] text-[var(--destructive)]">
            {localizeUi("ui.chat.beholder.stateUnavailable")}
          </p>
        ) : characters.length === 0 ? (
          <p className="text-[0.59375rem] leading-snug text-[var(--muted-foreground)]">
            {localizeUi("ui.chat.beholder.emptyState")}
          </p>
        ) : (
          <div className="space-y-2">
            {characters.map((character) => {
              const body = withDependentMissing(character.body as BeholderBodyView);
              const rows = buildBeholderRows(body, layout);
              return (
                <div key={character.name} className="rounded-md bg-[var(--secondary)]/65 px-2 py-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-[0.625rem] font-semibold text-[var(--foreground)]">{character.name}</span>
                    {character.species ? (
                      <span className="text-[0.5625rem] text-[var(--muted-foreground)]">{character.species}</span>
                    ) : null}
                  </div>
                  {rows.length === 0 ? (
                    <p className="mt-1 text-[0.5625rem] text-[var(--muted-foreground)]">
                      {localizeUi("ui.chat.beholder.noSlots")}
                    </p>
                  ) : (
                    <div
                      className={`mt-1 gap-1 ${
                        layout === "list" ? "flex flex-col" : "grid grid-cols-1 sm:grid-cols-2"
                      }`}
                    >
                      {rows.map((row) => (
                        <div
                          key={row.slots.join("|")}
                          className={
                            layout === "paired" && row.slots.length === 2
                              ? "col-span-full grid grid-cols-2 gap-1"
                              : "contents sm:block"
                          }
                        >
                          {row.slots.map((slotName) => renderSlot(slotName, body[slotName]))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
