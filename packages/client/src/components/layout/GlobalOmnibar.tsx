import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Loader2, Search, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChats } from "../../hooks/use-chats";
import { useCharacters, usePersonas } from "../../hooks/use-characters";
import { useLorebooks } from "../../hooks/use-lorebooks";
import { usePresets } from "../../hooks/use-presets";
import { useConnections } from "../../hooks/use-connections";
import { useAgentConfigs } from "../../hooks/use-agents";
import { useChatStore } from "../../stores/chat.store";
import { useUIStore } from "../../stores/ui.store";
import { requestProfessorMariOpen } from "../../lib/professor-mari-open";
import { searchOmnibar, type OmnibarResult } from "../../lib/omnibar-search";
import type { ProfessorMariNavigationTarget } from "../../lib/professor-mari-navigation";
import { PROFESSOR_MARI_OMNIBAR_POSITION_STORAGE_KEY } from "../../lib/professor-mari-navigation";
import { ProfessorMariNavigator } from "../chat/ProfessorMariNavigator";

const PROFESSOR_MARI_DRAFT_KEY = "__home_professor_mari__";

function readNamedRow(value: unknown) {
  if (typeof value !== "object" || value === null || !("id" in value) || typeof value.id !== "string") return null;
  const name = "name" in value && typeof value.name === "string" ? value.name : value.id;
  return { id: value.id, name };
}

export function GlobalOmnibar() {
  const open = useUIStore((state) => state.omnibarOpen);
  const setOpen = useUIStore((state) => state.setOmnibarOpen);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useUIStore.getState().omnibarOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  return open ? <GlobalOmnibarDialog onClose={() => setOpen(false)} /> : null;
}

function GlobalOmnibarDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const ui = useUIStore.getState;
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const boundaryRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const chats = useChats();
  const characters = useCharacters();
  const personas = usePersonas();
  const lorebooks = useLorebooks(undefined, { includeHidden: true });
  const presets = usePresets();
  const connections = useConnections();
  const agents = useAgentConfigs();

  const data = useMemo(
    () => ({
      commands: [
        { id: "home", title: t("home.title", "Home"), target: { kind: "home" } as const, aliases: ["start"] },
        { id: "chats", title: t("ui.layout.chats", "Chats"), target: { kind: "chats" } as const },
        {
          id: "characters",
          title: t("ui.layout.characters", "Characters"),
          target: { kind: "panel", panel: "characters" } as const,
        },
        {
          id: "personas",
          title: t("ui.layout.personas", "Personas"),
          target: { kind: "panel", panel: "personas" } as const,
        },
        {
          id: "lorebooks",
          title: t("ui.layout.lorebooks", "Lorebooks"),
          target: { kind: "panel", panel: "lorebooks" } as const,
        },
        {
          id: "presets",
          title: t("ui.layout.presets", "Presets"),
          target: { kind: "panel", panel: "presets" } as const,
        },
        {
          id: "connections",
          title: t("ui.layout.connections", "Connections"),
          target: { kind: "panel", panel: "connections" } as const,
        },
        { id: "agents", title: t("ui.layout.agents", "Agents"), target: { kind: "panel", panel: "agents" } as const },
        {
          id: "settings-general",
          title: t("settings.application.title", "Settings"),
          target: { kind: "settings", tab: "general" } as const,
          aliases: ["preferences"],
        },
        {
          id: "settings-appearance",
          title: t("settings.appearance.title", "Appearance"),
          target: { kind: "settings", tab: "appearance" } as const,
        },
        {
          id: "settings-generations",
          title: t("settings.generations.title", "Generations"),
          target: { kind: "settings", tab: "generations" } as const,
        },
        {
          id: "settings-addons",
          title: t("settings.addons.title", "Add-ons"),
          target: { kind: "settings", tab: "addons" } as const,
        },
        {
          id: "settings-import",
          title: t("settings.import.title", "Import"),
          target: { kind: "settings", tab: "import" } as const,
        },
        {
          id: "settings-advanced",
          title: t("settings.advanced.title", "Advanced"),
          target: { kind: "settings", tab: "advanced" } as const,
        },
      ],
      professorNavigationTitle: t("omnibar.professorNavigation"),
      askProfessorTitle: t("omnibar.askProfessorMari"),
      chats: (chats.data ?? []).map((chat) => ({ id: chat.id, name: chat.name })),
      resources: [
        ...(characters.data ?? []).flatMap((item) => {
          const row = readNamedRow(item);
          return row ? [{ kind: "character" as const, ...row }] : [];
        }),
        ...(personas.data ?? []).map((item) => ({ kind: "persona" as const, id: item.id, name: item.name })),
        ...(lorebooks.data ?? []).map((item) => ({ kind: "lorebook" as const, id: item.id, name: item.name })),
        ...(presets.data ?? []).map((item) => ({ kind: "preset" as const, id: item.id, name: item.name })),
        ...(agents.data ?? []).map((item) => ({
          kind: "agent" as const,
          id: item.type,
          name: item.name,
          aliases: [item.type],
        })),
      ],
      connections: (connections.data ?? []).flatMap((item) => {
        const row = readNamedRow(item);
        return row ? [row] : [];
      }),
    }),
    [agents.data, characters.data, chats.data, connections.data, lorebooks.data, personas.data, presets.data, t],
  );
  const results = useMemo(() => searchOmnibar(query, data), [data, query]);
  const loading = [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isLoading);
  const failed = [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isError);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => restoreRef.current?.focus();
  }, []);

  const close = onClose;
  const navigate = (target: ProfessorMariNavigationTarget) => {
    const state = ui();
    if (target.kind === "home") {
      useChatStore.getState().setActiveChatId(null);
      state.closeAllDetails();
      state.closeRightPanel();
    } else if (target.kind === "professor") {
      useChatStore.getState().setActiveChatId(null);
      state.closeAllDetails();
      state.closeRightPanel();
      requestProfessorMariOpen();
    } else if (target.kind === "chats") {
      state.setSidebarOpen(true);
      state.closeRightPanel();
    } else if (target.kind === "chat") {
      state.setSidebarOpen(true);
      state.closeRightPanel();
      useChatStore.getState().setActiveChatId(target.chatId);
    } else if (target.kind === "panel") state.openRightPanel(target.panel);
    else if (target.kind === "settings") {
      state.setSettingsTab(target.tab);
      state.setSettingsTargetControlId(target.controlId ?? null);
      state.openRightPanel("settings");
    } else if (target.kind === "surface") {
      if (target.surface === "card-downloads") state.openBotBrowser();
      if (target.surface === "character-library") state.openCharacterLibrary();
      if (target.surface === "persona-library") state.openPersonaLibrary();
      if (target.surface === "agent-catalog") state.openAgentCatalog();
      if (target.surface === "game-assets") state.openGameAssetsBrowser();
    } else if (target.kind === "resource") {
      if (target.resource === "character") state.openCharacterDetail(target.id);
      if (target.resource === "persona") state.openPersonaDetail(target.id);
      if (target.resource === "preset") state.openPresetDetail(target.id);
      if (target.resource === "lorebook") state.openLorebookDetail(target.id);
      if (target.resource === "agent") state.openAgentDetail(target.id);
    } else if (target.kind === "window" && target.window === "documentation") {
      state.openModal("docs-viewer");
    }
    close();
  };
  const resolveWithProfessorMari = (value: string) => {
    const result = searchOmnibar(value, data).find((item) => item.id === "professor-mari-navigation");
    return result?.target ?? null;
  };
  const choose = (result: OmnibarResult) => {
    if (result.id === "ask-professor-mari") {
      useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, query.trim());
      useChatStore.getState().setActiveChatId(null);
      ui().closeAllDetails();
      ui().closeRightPanel();
      requestProfessorMariOpen(query.trim());
      close();
      return;
    }
    if (result.category === "connection") {
      ui().openConnectionDetail(result.id.slice("connection:".length));
      close();
      return;
    }
    if (result.target) navigate(result.target);
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  };
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])') ?? [],
    ).filter((element) => !element.hasAttribute("disabled"));
    if (focusable.length === 0) return;
    const current = focusable.indexOf(document.activeElement as HTMLElement);
    const next = event.shiftKey
      ? current <= 0
        ? focusable.length - 1
        : current - 1
      : current === focusable.length - 1
        ? 0
        : current + 1;
    event.preventDefault();
    focusable[next]?.focus();
  };

  return createPortal(
    <div
      data-component="GlobalOmnibar"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 p-3 pt-[2rem] backdrop-blur-sm sm:p-6 sm:pt-[4rem]"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div ref={boundaryRef} className="relative h-[calc(100dvh-6rem)] w-full max-w-5xl sm:h-[calc(100dvh-8rem)]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-omnibar-title"
          onKeyDown={trapFocus}
          className="mx-auto mt-[18rem] flex h-[min(34rem,calc(100dvh-23rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl sm:mt-[16rem] sm:h-[min(34rem,calc(100dvh-20rem))] max-sm:mt-[14rem] max-sm:h-[min(30rem,calc(100dvh-19rem))]"
          data-component="GlobalOmnibar.Panel"
        >
          <h2 id="global-omnibar-title" className="sr-only">
            {t("omnibar.title", "Search Marinara")}
          </h2>
          <div className="flex h-14 items-center gap-3 border-b border-[var(--border)] px-4">
            <Search size={18} aria-hidden="true" className="shrink-0 text-[var(--primary)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              onKeyDown={onInputKeyDown}
              aria-label={t("omnibar.inputLabel", "Search Marinara")}
              aria-controls="global-omnibar-results"
              aria-activedescendant={results[activeIndex] ? `omnibar-${results[activeIndex].id}` : undefined}
              placeholder={t("omnibar.placeholder", "Search chats, characters, settings, and more")}
              className="min-w-0 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <button
              type="button"
              onClick={close}
              aria-label={t("common.close", "Close")}
              className="rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
            >
              <X size={17} />
            </button>
          </div>
          <div
            id="global-omnibar-results"
            role="listbox"
            aria-label={t("omnibar.results", "Search results")}
            className="min-h-0 flex-1 overflow-y-auto p-2"
          >
            {query.trim() && loading && (
              <div className="flex min-h-20 items-center justify-center text-sm text-[var(--muted-foreground)]">
                <Loader2 className="mr-2 animate-spin" size={16} />
                {t("omnibar.loading", "Loading results")}
              </div>
            )}
            {query.trim() && failed && (
              <div role="alert" className="p-5 text-center text-sm text-[var(--muted-foreground)]">
                {t("omnibar.error", "Some results could not be loaded")}
              </div>
            )}
            {query.trim() &&
              results.map((result, index) => (
                <button
                  key={result.id}
                  id={`omnibar-${result.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(result)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${index === activeIndex ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]/60"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/12 text-[var(--primary)]">
                    {result.category === "professor" ? <Sparkles size={16} /> : <ArrowRight size={16} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">
                    {result.id === "ask-professor-mari"
                      ? t("omnibar.askProfessorMari", "Ask Professor Mari")
                      : result.title}
                  </span>
                  <span className="shrink-0 text-xs capitalize text-[var(--muted-foreground)]">
                    {t(
                      `omnibar.categories.${result.category}`,
                      result.category === "professor" ? "Professor Mari" : result.category,
                    )}
                  </span>
                </button>
              ))}
            {!loading && query.trim() && results.length === 0 && (
              <div className="p-5 text-center text-sm text-[var(--muted-foreground)]">
                {t("omnibar.noResults", "No results")}
              </div>
            )}
          </div>
        </div>
      </div>
      <ProfessorMariNavigator
        pageActive
        enabled
        boundaryRef={boundaryRef}
        onResolve={resolveWithProfessorMari}
        onNavigate={navigate}
        onOpenProfessor={() => navigate({ kind: "professor" })}
        onOpenDocumentation={() => navigate({ kind: "window", window: "documentation" })}
        onMeaningfulDrag={() => undefined}
        positionStorageKey={PROFESSOR_MARI_OMNIBAR_POSITION_STORAGE_KEY}
        defaultPosition={{ x: 0.5, y: 0 }}
        layout="omnibar"
      />
    </div>,
    document.body,
  );
}
