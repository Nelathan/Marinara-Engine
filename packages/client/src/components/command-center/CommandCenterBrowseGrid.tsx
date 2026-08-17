import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { CommandCenterMedia, type CommandCenterMediaKind } from "./CommandCenterMedia";

export interface CommandCenterBrowseMedia {
  src?: string | null;
  kind?: CommandCenterMediaKind;
  avatarCropStyle?: CSSProperties;
  accent?: string | null;
}

export interface CommandCenterBrowseResult {
  id: string;
  title: string;
  metadata?: ReactNode;
  media?: CommandCenterBrowseMedia;
  groupVisual?: string;
  icon: LucideIcon;
  onSelect: () => void;
}

export interface CommandCenterBrowseGridProps {
  ariaLabel: string;
  results: readonly CommandCenterBrowseResult[];
  selectedId?: string | null;
  onSelectedIdChange?: (id: string) => void;
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  hasMore?: boolean;
  loadMoreLabel?: string;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function CommandCenterBrowseGrid({
  ariaLabel,
  results,
  selectedId,
  onSelectedIdChange,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  hasMore = false,
  loadMoreLabel,
  loadingMore = false,
  onLoadMore,
  className,
}: CommandCenterBrowseGridProps) {
  const [localActiveId, setLocalActiveId] = useState<string | null>(results[0]?.id ?? null);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const gridRef = useRef<HTMLUListElement>(null);
  const activeId = selectedId ?? localActiveId;
  const setActiveId = (id: string) => {
    setLocalActiveId(id);
    onSelectedIdChange?.(id);
  };

  useEffect(() => {
    if (results.length === 0) {
      setLocalActiveId(null);
      return;
    }

    if (!results.some((result) => result.id === activeId)) {
      const firstId = results[0]?.id;
      if (firstId) {
        setLocalActiveId(firstId);
        onSelectedIdChange?.(firstId);
      }
    }
  }, [activeId, onSelectedIdChange, results]);

  const moveFocus = (currentIndex: number, key: string) => {
    let targetIndex = currentIndex;

    if (key === "Home") targetIndex = 0;
    if (key === "End") targetIndex = results.length - 1;
    if (key === "ArrowLeft") targetIndex = Math.max(0, currentIndex - 1);
    if (key === "ArrowRight") targetIndex = Math.min(results.length - 1, currentIndex + 1);

    if (key === "ArrowUp" || key === "ArrowDown") {
      const grid = gridRef.current;
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 2 : 2;
      targetIndex = key === "ArrowUp" ? Math.max(0, currentIndex - columns) : currentIndex + columns;
      if (targetIndex >= results.length) targetIndex = currentIndex;
    }

    const target = results[targetIndex];
    if (!target || targetIndex === currentIndex) return;

    setActiveId(target.id);
    cellRefs.current.get(target.id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, result: CommandCenterBrowseResult, index: number) => {
    if (event.key === "Enter") {
      event.preventDefault();
      result.onSelect();
      return;
    }

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    moveFocus(index, event.key);
  };

  if (results.length === 0) {
    return (
      <div className={cn("flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center", className)}>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{emptyTitle}</h2>
        {emptyDescription ? (
          <p className="mt-1 max-w-[65ch] text-sm leading-5 text-[var(--muted-foreground)]">{emptyDescription}</p>
        ) : null}
        {emptyActionLabel && onEmptyAction ? (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-[filter,transform] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98]"
          >
            {emptyActionLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <ul
        ref={gridRef}
        aria-label={ariaLabel}
        className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,minmax(132px,1fr))]"
      >
        {results.map((result, index) => {
          const selected = result.id === activeId;

          return (
            <li key={result.id} className="min-w-0">
              <button
                ref={(node) => {
                  if (node) cellRefs.current.set(result.id, node);
                  else cellRefs.current.delete(result.id);
                }}
                type="button"
                data-selected={selected || undefined}
                tabIndex={selected ? 0 : -1}
                onFocus={() => setActiveId(result.id)}
                onClick={result.onSelect}
                onKeyDown={(event) => handleKeyDown(event, result, index)}
                className={cn(
                  "group min-h-11 w-full min-w-0 overflow-hidden rounded-md border bg-[var(--card)] text-left transition-[border-color,background-color,box-shadow,transform]",
                  "hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:bg-[var(--accent)]/35 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  selected ? "border-[var(--primary)]" : "border-[var(--border)]",
                )}
              >
                <div className="h-24 w-full overflow-hidden bg-[var(--muted)]">
                  <CommandCenterMedia
                    size="grid"
                    icon={result.icon}
                    src={result.media?.src}
                    kind={result.media?.kind}
                    avatarCropStyle={result.media?.avatarCropStyle}
                    groupClassName={result.groupVisual}
                    accent={result.media?.accent}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 px-2.5 py-2">
                  <div
                    data-command-center-browse-title
                    className="truncate text-sm font-semibold leading-5 text-[var(--foreground)]"
                  >
                    {result.title}
                  </div>
                  {result.metadata ? (
                    <div className="mt-0.5 truncate text-xs leading-4 text-[var(--muted-foreground)]">
                      {result.metadata}
                    </div>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && loadMoreLabel && onLoadMore ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            aria-busy={loadingMore || undefined}
            disabled={loadingMore}
            onClick={onLoadMore}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--secondary)] px-4 text-sm font-semibold text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
