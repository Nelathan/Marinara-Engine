import { type ChangeEvent, type RefObject, useEffect, useMemo, useRef } from "react";
import { useTranslation, useTranslation as useUiTranslation } from "react-i18next";
import { ArrowDown, ChevronRight, FileUp, Loader2, Plus, Save, Search, Trash2, X } from "lucide-react";
import type { MariWorkspaceSkillDetail } from "@marinara-engine/shared";

import { useUIStore } from "../../stores/ui.store";
import { SettingsSwitch } from "../panels/settings/SettingControls";
import { cn } from "../../lib/utils";
import { MariPanelSortSelect, compareMariPanelItems, type SkillDraftState } from "./MariPanelControls";

export function ProfessorMariSkillsMenu({
  skills,
  query,
  selectedSkill,
  draft,
  loading,
  saving,
  diagnostics,
  fileInputRef,
  onClose,
  onNew,
  onUploadClick,
  onFileChange,
  onSelect,
  onDraftChange,
  onSave,
  onDelete,
  onToggle,
  onQueryChange,
  className,
}: {
  skills: MariWorkspaceSkillDetail[];
  query: string;
  selectedSkill: MariWorkspaceSkillDetail | null;
  draft: SkillDraftState;
  loading: boolean;
  saving: boolean;
  diagnostics: string[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onNew: () => void;
  onUploadClick: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect: (id: string | null) => void;
  onDraftChange: (draft: SkillDraftState) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onToggle: (skill: MariWorkspaceSkillDetail) => void;
  onQueryChange: (query: string) => void;
  className?: string;
}) {
  const { t: localizeUi } = useUiTranslation();
  const { t } = useTranslation();
  const enabledCount = skills.filter((skill) => skill.enabled).length;
  const hasSkills = skills.length > 0;
  const normalizedQuery = query.trim().toLowerCase();
  // Pure textual match: drives the noMatches message. While an editor is open,
  // that selected row is rendered directly instead of this list.
  const filtered = useMemo(
    () =>
      normalizedQuery
        ? skills.filter((skill) => `${skill.name} ${skill.description}`.toLowerCase().includes(normalizedQuery))
        : skills,
    [skills, normalizedQuery],
  );
  const sortMode = useUIStore((s) => s.mariPanelSortMode);
  const setSortMode = useUIStore((s) => s.setMariPanelSortMode);
  const displayed = useMemo(
    () => [...filtered].sort((a, b) => compareMariPanelItems(a, b, sortMode)),
    [filtered, sortMode],
  );
  // Keep the open editor in view when its row moves (selection change, or a rename that re-sorts it).
  const activeEditorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    activeEditorRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedSkill?.id, selectedSkill?.updatedAt, sortMode, normalizedQuery]);

  return (
    <section
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border)]/70 bg-[var(--background)]/70",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)]/60 px-3 py-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ArrowDown size="0.9rem" className="shrink-0 text-[var(--marinara-chat-chrome-button-text-active)]" />
            <span className="truncate text-xs font-semibold text-[var(--foreground)]">
              {localizeUi("ui.chat.professormariskillsmenu.professorMariSkills")}
            </span>
          </div>
          {hasSkills && (
            <div className="mt-0.5 truncate text-[0.6875rem] text-[var(--muted-foreground)]">
              {enabledCount} {localizeUi("ui.chat.professormariskillsmenu.active")} {skills.length}{" "}
              {localizeUi("ui.chat.professormariskillsmenu.total")}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
          aria-label={t("home.professorMari.skills.close")}
          title={t("home.professorMari.skills.close")}
        >
          <X size="0.95rem" />
        </button>
      </div>

      <div
        className={cn(
          "shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--border)]/50 px-2.5 py-2",
          selectedSkill ? "hidden" : "flex",
        )}
      >
        <button
          type="button"
          onClick={() => {
            onQueryChange("");
            onNew();
          }}
          disabled={saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[0.6875rem] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size="0.78rem" />
          {localizeUi("ui.lorebooks.lorebookassignmentsection.new")}
        </button>
        <button
          type="button"
          onClick={onUploadClick}
          disabled={saving}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[0.6875rem] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileUp size="0.78rem" />
          {localizeUi("ui.characters.characterclipcard.upload")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,text/markdown,text/plain"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {hasSkills && !selectedSkill && (
        <div className="shrink-0 border-b border-[var(--border)]/50 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search
                size="0.8rem"
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={localizeUi("ui.chat.professormariskillsmenu.searchPlaceholder")}
                aria-label={localizeUi("ui.chat.professormariskillsmenu.searchPlaceholder")}
                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] pl-7 pr-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/55"
              />
            </div>
            <MariPanelSortSelect value={sortMode} onChange={setSortMode} />
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {!loading && hasSkills && filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-xs text-[var(--muted-foreground)]">
              {localizeUi("ui.chat.professormariskillsmenu.noMatches")}
            </div>
          )}
          {loading ? (
            <div className="space-y-1.5">
              <div className="h-10 animate-pulse rounded-lg bg-[var(--muted)]/30" />
              <div className="h-10 animate-pulse rounded-lg bg-[var(--muted)]/20" />
            </div>
          ) : !hasSkills ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-xs text-[var(--muted-foreground)]">
              {localizeUi("ui.chat.professormariskillsmenu.noCustomSkillsYet")}
            </div>
          ) : (
            (selectedSkill ? [selectedSkill] : displayed).map((skill) => {
              const active = selectedSkill?.id === skill.id;
              return (
                <div
                  key={skill.id}
                  className={cn(
                    "group w-full min-w-0 overflow-hidden rounded-lg border transition-colors",
                    active
                      ? "border-[var(--primary)]/45 bg-[var(--primary)]/10"
                      : "border-[var(--border)]/70 bg-[var(--card)]/70 hover:bg-[var(--accent)]/70",
                  )}
                >
                  <div className="flex w-full min-w-0 items-stretch gap-1">
                    <button
                      type="button"
                      onClick={() => onSelect(active ? null : skill.id)}
                      aria-expanded={active}
                      className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
                    >
                      <ChevronRight
                        size="0.8rem"
                        className={cn(
                          "shrink-0 text-[var(--muted-foreground)] transition-transform",
                          active && "rotate-90",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.75rem] font-semibold text-[var(--foreground)]">
                          {skill.name}
                        </span>
                        {skill.description && (
                          <span className="mt-0.5 hidden truncate text-[0.65rem] text-[var(--muted-foreground)] md:block">
                            {skill.description}
                          </span>
                        )}
                      </span>
                    </button>
                    <span className="flex shrink-0 items-center pr-1">
                      <SettingsSwitch
                        ariaLabel={
                          skill.enabled
                            ? localizeUi("ui.chat.professormariskillsmenu.disableSkill")
                            : localizeUi("ui.chat.professormariskillsmenu.enableSkill")
                        }
                        title={
                          skill.enabled
                            ? localizeUi("ui.noodle.noodlehome.enabled")
                            : localizeUi("ui.agents.agenteditor.disabled")
                        }
                        checked={skill.enabled}
                        onChange={() => onToggle(skill)}
                        disabled={saving}
                        className="p-0 hover:bg-transparent"
                      />
                    </span>
                  </div>
                  {active && (
                    <div
                      ref={active ? activeEditorRef : undefined}
                      className="space-y-2 border-t border-[var(--border)]/50 px-2.5 py-2.5"
                    >
                      <label className="block text-[0.6875rem] font-semibold text-[var(--muted-foreground)]">
                        {localizeUi("ui.characters.metadatatab.name")}
                        <input
                          value={draft.name}
                          onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
                          disabled={saving}
                          className="mt-1 h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/55 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </label>
                      <label className="block text-[0.6875rem] font-semibold text-[var(--muted-foreground)]">
                        {localizeUi("chat.settings.inlineEditor.fields.description")}
                        <input
                          value={draft.description}
                          onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
                          disabled={saving}
                          className="mt-1 h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/55 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </label>
                      <label className="block text-[0.6875rem] font-semibold text-[var(--muted-foreground)]">
                        {localizeUi("ui.chat.professormariskillsmenu.instructions")}
                        <textarea
                          value={draft.content}
                          onChange={(event) => onDraftChange({ ...draft, content: event.target.value })}
                          disabled={saving}
                          rows={9}
                          className="mt-1 min-h-40 w-full resize-y rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-2 font-mono text-[0.6875rem] leading-relaxed text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/55 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </label>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onDelete(skill.id)}
                          disabled={saving}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[0.6875rem] font-semibold text-[var(--destructive)] transition-colors hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Trash2 size="0.75rem" />
                          {localizeUi("lorebook.editor.batch.delete")}
                        </button>
                        <button
                          type="button"
                          onClick={onSave}
                          disabled={saving}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--primary)] px-2.5 text-[0.6875rem] font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {saving ? <Loader2 size="0.75rem" className="animate-spin" /> : <Save size="0.75rem" />}
                          {localizeUi("ui.noodle.noodlehome.save")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {diagnostics.length > 0 && (
          <div className="mx-2 mb-2 rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-2 text-[0.6875rem] text-amber-200">
            {diagnostics[0]}
          </div>
        )}
      </div>
    </section>
  );
}
