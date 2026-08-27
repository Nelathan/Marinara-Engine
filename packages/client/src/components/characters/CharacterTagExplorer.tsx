// ──────────────────────────────────────────────
// Character Tag Explorer
// ──────────────────────────────────────────────
import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Minus, Search, Trash2, X } from "lucide-react";
import { characterTagKey, type CharacterTagIndexEntry, type CharacterTagMatchMode } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";

/**
 * How many rows render before the user has to narrow with the search box.
 * An imported library can carry several hundred tags; rendering them all is
 * both unreadable and slow, and the search box is the intended way through.
 */
const VISIBLE_TAG_LIMIT = 60;

type CharacterTagExplorerProps = {
  entries: readonly CharacterTagIndexEntry[];
  includedKeys: ReadonlySet<string>;
  excludedKeys: ReadonlySet<string>;
  matchMode: CharacterTagMatchMode;
  /** Counts within the current result set, keyed by canonical tag key. */
  resultCounts?: ReadonlyMap<string, number>;
  onToggleIncluded: (key: string) => void;
  onToggleExcluded: (key: string) => void;
  onMatchModeChange: (mode: CharacterTagMatchMode) => void;
  onClear: () => void;
  /** Remove the tag from every character that carries any spelling of it. */
  onDelete?: (key: string) => void;
  isLoading?: boolean;
};

export function CharacterTagExplorer({
  entries,
  includedKeys,
  excludedKeys,
  matchMode,
  resultCounts,
  onToggleIncluded,
  onToggleExcluded,
  onMatchModeChange,
  onClear,
  onDelete,
  isLoading = false,
}: CharacterTagExplorerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const hasFilters = includedKeys.size > 0 || excludedKeys.size > 0;

  const { visible, hiddenCount } = useMemo(() => {
    const query = characterTagKey(deferredSearch);
    // Selected tags stay pinned at the top so a filter never scrolls out of
    // reach once the user starts searching for the next one.
    const selected: CharacterTagIndexEntry[] = [];
    const rest: CharacterTagIndexEntry[] = [];
    for (const entry of entries) {
      const isSelected = includedKeys.has(entry.key) || excludedKeys.has(entry.key);
      if (
        !isSelected &&
        query &&
        !entry.key.includes(query) &&
        !entry.variants.some((v) => characterTagKey(v).includes(query))
      ) {
        continue;
      }
      (isSelected ? selected : rest).push(entry);
    }
    const ordered = [...selected, ...rest];
    return {
      visible: ordered.slice(0, VISIBLE_TAG_LIMIT),
      hiddenCount: Math.max(0, ordered.length - VISIBLE_TAG_LIMIT),
    };
  }, [entries, deferredSearch, includedKeys, excludedKeys]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Search
            size="0.6875rem"
            aria-hidden="true"
            className="mari-chrome-field-icon absolute top-1/2 left-2.5 -translate-y-1/2"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("characters.tagExplorer.searchPlaceholder")}
            aria-label={t("characters.tagExplorer.searchPlaceholder")}
            className="mari-chrome-field h-8 w-full py-0 pr-2 pl-7 text-[0.6875rem]"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="mari-chrome-control mari-chrome-control--compact mari-chrome-control--danger"
          >
            <X size="0.5rem" aria-hidden="true" /> {t("characters.tagExplorer.clear")}
          </button>
        )}
      </div>

      {includedKeys.size > 1 && (
        <div className="flex items-center gap-1" role="group" aria-label={t("characters.tagExplorer.matchMode")}>
          {(["any", "all"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={matchMode === mode}
              onClick={() => onMatchModeChange(mode)}
              className={cn(
                "mari-chrome-control mari-chrome-control--compact",
                matchMode === mode && "mari-chrome-control--selected",
              )}
            >
              {mode === "any" ? t("characters.tagExplorer.matchAny") : t("characters.tagExplorer.matchAll")}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="px-1 py-2 text-[0.625rem] text-[var(--muted-foreground)]">
          {t("characters.tagExplorer.loading")}
        </p>
      ) : visible.length === 0 ? (
        <p className="px-1 py-2 text-[0.625rem] text-[var(--muted-foreground)]">
          {entries.length === 0 ? t("characters.tagExplorer.empty") : t("characters.tagExplorer.noMatches")}
        </p>
      ) : (
        <ul className="flex max-h-64 flex-col gap-px overflow-y-auto">
          {visible.map((entry) => {
            const included = includedKeys.has(entry.key);
            const excluded = excludedKeys.has(entry.key);
            const resultCount = resultCounts?.get(entry.key);
            return (
              <li key={entry.key} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-pressed={included}
                  onClick={() => onToggleIncluded(entry.key)}
                  title={entry.variants.length > 1 ? entry.variants.join(", ") : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 rounded px-1.5 py-1 text-left text-[0.6875rem] transition-colors hover:bg-[var(--secondary)]",
                    included && "bg-[var(--secondary)] text-[var(--foreground)]",
                    excluded && "text-[var(--muted-foreground)] line-through",
                  )}
                >
                  {/* Shape, not colour alone, carries include/exclude state. */}
                  <span aria-hidden="true" className="w-2.5 shrink-0 text-[var(--muted-foreground)]">
                    {included ? <Check size="0.625rem" /> : excluded ? <Minus size="0.625rem" /> : null}
                  </span>
                  <span className="truncate">{entry.label}</span>
                  <span className="ml-auto shrink-0 tabular-nums text-[0.625rem] text-[var(--muted-foreground)]">
                    {resultCount === undefined
                      ? entry.count
                      : t("characters.tagExplorer.countValue1Value2", { value1: resultCount, value2: entry.count })}
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={excluded}
                  onClick={() => onToggleExcluded(entry.key)}
                  title={t("characters.tagExplorer.excludeValue1", { value1: entry.label })}
                  aria-label={t("characters.tagExplorer.excludeValue1", { value1: entry.label })}
                  className={cn(
                    "shrink-0 rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/20 hover:text-[var(--destructive)]",
                    excluded && "bg-[var(--destructive)]/20 text-[var(--destructive)]",
                  )}
                >
                  <Minus size="0.625rem" aria-hidden="true" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(entry.key)}
                    title={t("characters.tagExplorer.deleteValue1", { value1: entry.label })}
                    aria-label={t("characters.tagExplorer.deleteValue1", { value1: entry.label })}
                    className="shrink-0 rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/20 hover:text-[var(--destructive)]"
                  >
                    <Trash2 size="0.625rem" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p className="px-1 text-[0.625rem] text-[var(--muted-foreground)]">
          {t("characters.tagExplorer.hiddenValue1", { value1: hiddenCount })}
        </p>
      )}
    </div>
  );
}
