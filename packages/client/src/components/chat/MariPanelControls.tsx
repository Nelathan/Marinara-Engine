import { useTranslation as useUiTranslation } from "react-i18next";

import { type MariPanelSortMode } from "../../stores/ui.store";

/**
 * Shared controls for Professor Mari's management panels (Skills, Memories, and
 * the chat history list). The panels themselves are lazy, but the parent uses
 * the sort control too, so it stays in the eager chunk.
 */

// #4868: client-side sort for the Skills/Memories panels. Deliberately keyed on name or
// createdAt, never updatedAt, so saving or toggling a row does NOT reorder it (which used to
// snap the open editor out of view). Persistent memories are pinned above the rest by the caller.
export function compareMariPanelItems(
  a: { name: string; createdAt: string },
  b: { name: string; createdAt: string },
  mode: MariPanelSortMode,
): number {
  switch (mode) {
    case "za":
      return b.name.localeCompare(a.name);
    case "newest":
      return String(b.createdAt).localeCompare(String(a.createdAt));
    case "oldest":
      return String(a.createdAt).localeCompare(String(b.createdAt));
    default:
      return a.name.localeCompare(b.name);
  }
}

const MARI_PANEL_SORT_OPTIONS: MariPanelSortMode[] = ["az", "za", "newest", "oldest"];

export function MariPanelSortSelect({
  value,
  onChange,
}: {
  value: MariPanelSortMode;
  onChange: (mode: MariPanelSortMode) => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const labels: Record<MariPanelSortMode, string> = {
    az: localizeUi("ui.chat.homeprofessormarichat.sortAToZ"),
    za: localizeUi("ui.chat.homeprofessormarichat.sortZToA"),
    newest: localizeUi("ui.chat.homeprofessormarichat.sortNewest"),
    oldest: localizeUi("ui.chat.homeprofessormarichat.sortOldest"),
  };
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as MariPanelSortMode)}
      aria-label={localizeUi("ui.chat.homeprofessormarichat.sortLabel")}
      title={localizeUi("ui.chat.homeprofessormarichat.sortLabel")}
      className="h-8 shrink-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 text-[0.6875rem] text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/55"
    >
      {MARI_PANEL_SORT_OPTIONS.map((mode) => (
        <option key={mode} value={mode}>
          {labels[mode]}
        </option>
      ))}
    </select>
  );
}

/** Draft shape for the Skills panel editor. */
export type SkillDraftState = {
  name: string;
  description: string;
  content: string;
};

// #4851: draft for the Memories panel. `enabled` and `persistent` are toggled directly
// on the row/editor (not staged in the draft); name/description/content save together.
export type MemoryDraftState = {
  name: string;
  description: string;
  content: string;
};
