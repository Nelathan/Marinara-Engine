import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

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
  description?: ReactNode;
  status?: ReactNode;
  tags?: readonly ReactNode[];
  secondaryState?: ReactNode;
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
                  "group min-h-11 w-full min-w-0 overflow-hidden rounded-md border bg-[var(--card)] text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:bg-[var(--accent)]/35 active:translate-y-0 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  result.groupVisual,
                  selected
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                    : "border-[var(--border)]",
                )}
              >
                <div
                  className={cn(
                    "w-full overflow-hidden bg-[var(--muted)]",
                    result.media?.kind === "artwork"
                      ? "aspect-[16/10]"
                      : result.media?.kind === "avatar"
                        ? "aspect-square"
                        : "aspect-[4/3]",
                  )}
                >
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
                <div className="min-w-0 px-2.5 pb-2.5 pt-2">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div
                      data-command-center-browse-title
                      className="line-clamp-2 min-h-10 min-w-0 break-words text-sm font-semibold leading-5 text-[var(--foreground)]"
                    >
                      {result.title}
                    </div>
                  </div>
                  {result.metadata ? (
                    <div className="mt-1 line-clamp-2 break-words text-xs leading-4 text-[var(--muted-foreground)]">
                      {result.metadata}
                    </div>
                  ) : null}
                  {result.description ? (
                    <div className="mt-1 line-clamp-2 break-words text-xs leading-4 text-[var(--muted-foreground)]/80">
                      {result.description}
                    </div>
                  ) : null}
                  {result.status || result.tags?.length ? (
                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                      {result.status ? (
                        <span className="min-w-0 max-w-full break-words text-[0.6875rem] font-semibold leading-4 text-[var(--primary)]">
                          {result.status}
                        </span>
                      ) : null}
                      {result.tags?.map((tag, tagIndex) => (
                        <span
                          key={`${result.id}-tag-${tagIndex}`}
                          className="max-w-full break-words rounded-sm border border-[var(--border)] bg-[var(--secondary)] px-1.5 py-0.5 text-[0.6875rem] leading-4 text-[var(--muted-foreground)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {result.secondaryState ? (
                    <div className="mt-2 flex min-h-11 items-center justify-between gap-2 border-t border-[var(--border)]/70 pt-1.5 text-xs text-[var(--muted-foreground)]">
                      <span className="min-w-0 flex-1 break-words">{result.secondaryState}</span>
                      <ChevronRight className="size-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="flex min-h-11 items-end justify-end pt-1">
                      <ChevronRight className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                    </div>
                  )}
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
