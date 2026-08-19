import { Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { OmnibarResult } from "../../../lib/omnibar-search";
import { CommandCenterBrowseGrid } from "../../command-center/CommandCenterBrowseGrid";
import type { CommandCenterVisual } from "../../command-center/command-center-visuals";
import { resultMetadata, type RankedOmnibarResult } from "./omnibar-result-view";

export interface OmnibarBrowsePaneProps {
  /** The detail pane takes over the narrow layout, so browse hides below the xl breakpoint. */
  detailOpen: boolean;
  filterLabel: string;
  /** Total matches, which can exceed the rendered `results` window. */
  totalCount: number;
  results: readonly OmnibarResult[];
  hasMore: boolean;
  mariEnabled: boolean;
  compareMode: boolean;
  compareIds: readonly string[];
  /** Number of selected rows that can be attached to the active chat, or null when none can. */
  batchAttachCount: number | null;
  selectedId: string | null;
  resultVisual: (result: RankedOmnibarResult) => CommandCenterVisual;
  resultIcon: (result: RankedOmnibarResult) => LucideIcon;
  onStartCompare: () => void;
  onCancelCompare: () => void;
  onAttachSelection: () => void;
  onCompareWithMari: () => void;
  onSelectedIdChange: (id: string) => void;
  onToggleCompareResult: (id: string) => void;
  onShowDetail: (result: RankedOmnibarResult) => void;
  onLoadMore: () => void;
}

export function OmnibarBrowsePane({
  detailOpen,
  filterLabel,
  totalCount,
  results,
  hasMore,
  mariEnabled,
  compareMode,
  compareIds,
  batchAttachCount,
  selectedId,
  resultVisual,
  resultIcon,
  onStartCompare,
  onCancelCompare,
  onAttachSelection,
  onCompareWithMari,
  onSelectedIdChange,
  onToggleCompareResult,
  onShowDetail,
  onLoadMore,
}: OmnibarBrowsePaneProps) {
  const { t } = useTranslation();
  return (
    <div
      data-component="GlobalOmnibar.Browse"
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-safe:animate-fade-in-up ${detailOpen ? "max-[85rem]:hidden" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">{filterLabel}</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {t("commandCenter.browseCount", "{{count}} items", {
              count: totalCount,
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!mariEnabled ? null : compareMode ? (
            <>
              <span aria-live="polite" className="text-xs text-[var(--muted-foreground)]">
                {t("commandCenter.compareSelectionCount", "{{count}}/5 selected", {
                  count: compareIds.length,
                })}
              </span>
              <button
                type="button"
                onClick={onCancelCompare}
                className="min-h-9 rounded-md px-2.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              >
                {t("common.cancel", "Cancel")}
              </button>
              {batchAttachCount !== null ? (
                <button
                  type="button"
                  onClick={onAttachSelection}
                  className="min-h-9 rounded-md border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]"
                >
                  {t("commandCenter.attachSelection", "Add {{count}} to this chat", {
                    count: batchAttachCount,
                  })}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onCompareWithMari}
                disabled={compareIds.length < 2}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Sparkles size={14} aria-hidden="true" />
                {t("commandCenter.compareWithMari", "Compare with Mari")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartCompare}
              className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              {t("commandCenter.selectToCompare", "Select to compare")}
            </button>
          )}
        </div>
      </div>
      <CommandCenterBrowseGrid
        ariaLabel={filterLabel}
        selectedId={selectedId}
        selectedIds={new Set(compareIds)}
        selectionMode={compareMode && mariEnabled}
        onSelectedIdChange={onSelectedIdChange}
        results={results.map((result) => {
          const command = {
            ...result,
            command: {
              id: result.id,
              title: result.title,
              kind: result.kind ?? "resource",
              icon: result.icon ?? "command",
              target: result.target,
              availability: { status: "available" as const },
            },
          } as RankedOmnibarResult;
          const visual = resultVisual(command);
          const preview = result.preview?.();
          return {
            id: result.id,
            title: result.title,
            metadata: resultMetadata(command, visual.label, preview),
            description: result.description ?? preview?.description,
            status: preview?.status?.label,
            tags: preview?.tags ?? preview?.badges,
            secondaryState: preview?.metadataLine ?? preview?.supportingInfo,
            icon: resultIcon(command),
            groupVisual: visual.groupClassName,
            media: preview?.media
              ? {
                  src: preview.media.src,
                  kind: preview.media.kind,
                  avatarCropStyle: preview.media.avatarCropStyle,
                  accent: preview.accent,
                }
              : undefined,
            onSelect: () => {
              onSelectedIdChange(result.id);
              if (compareMode) onToggleCompareResult(result.id);
              else onShowDetail(command);
            },
          };
        })}
        emptyTitle={t("commandCenter.browseEmpty", "No items in this category")}
        hasMore={hasMore}
        loadMoreLabel={t("commandCenter.loadMore", "Load more")}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}
