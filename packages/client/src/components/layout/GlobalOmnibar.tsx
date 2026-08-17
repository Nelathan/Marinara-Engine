import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Loader2, Pin, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDocsCommandSearchProvider } from "../../hooks/use-docs-command-search";
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
import { createSystemCommandDefinitions } from "../../lib/command-center-system-commands";
import {
  activatePersonalExtensionCommand,
  usePersonalExtensionCommands,
} from "../../lib/personal-extension-contributions";
import { executeStateNavigation } from "../../lib/state-navigation";
import {
  rankCommandResults,
  readCommandRankingState,
  recordCommandUse,
  setCommandPinned,
  writeCommandRankingState,
  type CommandRankingState,
} from "../../lib/command-center";
import { getCommandIcon } from "../../lib/command-icons";
import { parseCharacterDisplayData } from "../../lib/character-display";
import { CommandCenterSegmentedChoice } from "../command-center/CommandCenterSegmentedChoice";
import { CommandCenterToggle } from "../command-center/CommandCenterToggle";
import { CommandResultPreview } from "../command-center/CommandResultPreview";
import type { RichCommandResult } from "../command-center/command-result-preview.types";
import type { ProfessorMariNavigationTarget } from "../../lib/professor-mari-navigation";
import { PROFESSOR_MARI_OMNIBAR_POSITION_STORAGE_KEY } from "../../lib/professor-mari-navigation";
import { ProfessorMariNavigator } from "../chat/ProfessorMariNavigator";

const PROFESSOR_MARI_DRAFT_KEY = "__home_professor_mari__";
type RankedOmnibarResult = OmnibarResult & { command: RichCommandResult["command"] };

function readNamedRow(value: unknown) {
  if (typeof value !== "object" || value === null || !("id" in value) || typeof value.id !== "string") return null;
  const name = "name" in value && typeof value.name === "string" ? value.name : value.id;
  return { id: value.id, name };
}

function safeColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const color = value.trim();
  return /^(?:#[\da-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/i.test(
    color,
  )
    ? color
    : undefined;
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
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [ranking, setRanking] = useState<CommandRankingState>(() => readCommandRankingState());
  const chats = useChats();
  const characters = useCharacters();
  const personas = usePersonas();
  const lorebooks = useLorebooks(undefined, { includeHidden: true });
  const presets = usePresets();
  const connections = useConnections();
  const agents = useAgentConfigs();
  const extensionCommands = usePersonalExtensionCommands();
  const docs = useDocsCommandSearchProvider(query, { enabled: true });
  const theme = useUIStore((state) => state.theme);
  const reduceAmbientEffects = useUIStore((state) => state.reduceAmbientEffects);
  const musicPlayerEnabled = useUIStore((state) => state.musicPlayerEnabled);
  const speechToTextEnabled = useUIStore((state) => state.speechToTextEnabled);
  const notificationSoundsOnlyWhenUnfocused = useUIStore((state) => state.notificationSoundsOnlyWhenUnfocused);
  const showTimestamps = useUIStore((state) => state.showTimestamps);
  const showModelName = useUIStore((state) => state.showModelName);
  const showTokenUsage = useUIStore((state) => state.showTokenUsage);
  const userStatus = useUIStore((state) => state.userStatus);

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
        ...createSystemCommandDefinitions((key, fallback) => t(`commandCenter.system.${key}`, fallback)).map(
          (command) => ({
            id: command.id,
            title: command.title,
            kind: command.kind,
            icon: command.icon,
            aliases: command.aliases,
            target: command.target,
            category: command.kind === "settings" ? ("settings" as const) : ("navigation" as const),
            score: 160,
            availability: command.availability,
          }),
        ),
        ...extensionCommands.map((command) => ({
          ...command,
          target: { kind: "home" } as const,
          category: "navigation" as const,
          score: 140,
        })),
      ].map((command) => ({
        ...command,
        category:
          "category" in command && command.category
            ? command.category
            : command.id.startsWith("settings")
              ? ("settings" as const)
              : ("navigation" as const),
        score: "score" in command && typeof command.score === "number" ? command.score : 160,
      })),
      professorNavigationTitle: t("omnibar.professorNavigation"),
      askProfessorTitle: t("omnibar.askProfessorMari"),
      chats: (chats.data ?? []).map((chat) => ({
        id: chat.id,
        name: chat.name,
        mode: chat.mode,
        preview: {
          kind: "chat" as const,
          title: chat.name,
          categoryLabel: t(`home.recentChats.mode.${chat.mode}`, chat.mode),
          facts: [
            {
              label: t("commandCenter.preview.lastUpdated", "Last updated"),
              value: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(chat.updatedAt)),
            },
          ],
        },
      })),
      resources: [
        ...(characters.data ?? []).flatMap((item) => {
          const row = readNamedRow(item);
          const display = parseCharacterDisplayData({
            data: (item as Record<string, unknown>).data,
            comment: (item as Record<string, unknown>).comment as string | null | undefined,
          });
          return row
            ? [
                {
                  kind: "character" as const,
                  ...row,
                  name: display.name,
                  description: display.description ?? undefined,
                  preview: {
                    kind: "character" as const,
                    title: row.name,
                    description: display.description ?? undefined,
                    categoryLabel: t("omnibar.categories.character", "Character"),
                    media:
                      typeof (item as Record<string, unknown>).avatarPath === "string"
                        ? { src: (item as unknown as { avatarPath: string }).avatarPath, alt: display.name }
                        : undefined,
                  },
                },
              ]
            : [];
        }),
        ...(personas.data ?? []).map((item) => ({
          kind: "persona" as const,
          id: item.id,
          name: item.name,
          description: item.description,
          preview: {
            kind: "persona" as const,
            title: item.name,
            description: item.description,
            media:
              typeof (item as unknown as Record<string, unknown>).avatarPath === "string"
                ? { src: (item as unknown as { avatarPath: string }).avatarPath, alt: item.name }
                : undefined,
            facts: item.comment ? [{ label: t("commandCenter.preview.note", "Note"), value: item.comment }] : [],
            accent: safeColor(item.nameColor),
          },
        })),
        ...(lorebooks.data ?? []).map((item) => ({
          kind: "lorebook" as const,
          id: item.id,
          name: item.name,
          description: item.description,
          preview: {
            kind: "lorebook" as const,
            title: item.name,
            description: item.description,
            facts: [
              {
                label: t("commandCenter.preview.status", "Status"),
                value:
                  String(item.enabled) === "true"
                    ? t("commandCenter.values.enabled", "Enabled")
                    : t("commandCenter.values.disabled", "Disabled"),
              },
              { label: t("commandCenter.preview.category", "Category"), value: item.category },
            ],
          },
        })),
        ...(presets.data ?? []).map((item) => ({
          kind: "preset" as const,
          id: item.id,
          name: item.name,
          preview: {
            kind: "preset" as const,
            title: item.name,
            facts: [
              {
                label: t("commandCenter.preview.type", "Type"),
                value: t("commandCenter.preview.promptPreset", "Prompt preset"),
              },
            ],
          },
        })),
        ...(agents.data ?? []).map((item) => ({
          kind: "agent" as const,
          id: item.type,
          name: item.name,
          aliases: [item.type],
          description: item.description,
          preview: {
            kind: "agent" as const,
            title: item.name,
            description: item.description,
            facts: [
              {
                label: t("commandCenter.preview.status", "Status"),
                value:
                  String(item.enabled) === "true"
                    ? t("commandCenter.values.enabled", "Enabled")
                    : t("commandCenter.values.disabled", "Disabled"),
              },
              { label: t("commandCenter.preview.phase", "Phase"), value: item.phase },
            ],
          },
        })),
      ],
      connections: (connections.data ?? []).flatMap((item) => {
        const row = readNamedRow(item);
        const record = item as Record<string, unknown>;
        return row
          ? [
              {
                ...row,
                provider: typeof record.provider === "string" ? record.provider : undefined,
                model: typeof record.model === "string" ? record.model : undefined,
                isDefault: record.isDefault === true,
                imagePath: typeof record.imagePath === "string" ? record.imagePath : null,
              },
            ]
          : [];
      }),
    }),
    [
      agents.data,
      characters.data,
      chats.data,
      connections.data,
      extensionCommands,
      lorebooks.data,
      personas.data,
      presets.data,
      t,
    ],
  );
  const controls = useMemo<OmnibarResult[]>(() => {
    const set = useUIStore.getState;
    return [
      {
        id: "control:theme",
        title: t("commandCenter.controls.theme", "Theme"),
        category: "settings",
        score: 180,
        control: {
          type: "choice",
          label: t("commandCenter.controls.theme", "Theme"),
          value: theme,
          options: [
            { value: "dark", label: t("commandCenter.values.dark", "Dark") },
            { value: "light", label: t("commandCenter.values.light", "Light") },
          ],
          onChange: (value: string | boolean) => set().setTheme(String(value) as "dark" | "light"),
        },
      },
      ...(
        [
          [
            "reduceAmbientEffects",
            "commandCenter.controls.reducedEffects",
            reduceAmbientEffects,
            set().setReduceAmbientEffects,
          ],
          ["musicPlayerEnabled", "commandCenter.controls.musicPlayer", musicPlayerEnabled, set().setMusicPlayerEnabled],
          [
            "speechToTextEnabled",
            "commandCenter.controls.speechToText",
            speechToTextEnabled,
            set().setSpeechToTextEnabled,
          ],
          [
            "notificationSoundsOnlyWhenUnfocused",
            "commandCenter.controls.unfocusedSounds",
            notificationSoundsOnlyWhenUnfocused,
            set().setNotificationSoundsOnlyWhenUnfocused,
          ],
          ["showTimestamps", "commandCenter.controls.timestamps", showTimestamps, set().setShowTimestamps],
          ["showModelName", "commandCenter.controls.modelName", showModelName, set().setShowModelName],
          ["showTokenUsage", "commandCenter.controls.tokenUsage", showTokenUsage, set().setShowTokenUsage],
        ] as const
      ).map(([id, key, value, onChange]) => ({
        id: `control:${id}`,
        title: t(key, id),
        category: "settings" as const,
        score: 170,
        control: {
          type: "toggle" as const,
          label: t(key, id),
          value,
          onChange: (nextValue: string | boolean) => onChange(Boolean(nextValue)),
        },
      })),
      ...(["active", "idle", "dnd", "invisible"] as const).map((status) => ({
        id: `control:presence:${status}`,
        title: t(`commandCenter.presence.${status}`, status),
        category: "settings" as const,
        score: 160,
        control: {
          type: "choice" as const,
          label: t("commandCenter.controls.presence", "Presence"),
          value: userStatus,
          options: ["active", "idle", "dnd", "invisible"].map((value) => ({
            value,
            label: t(`commandCenter.presence.${value}`, value),
          })),
          onChange: (value: string | boolean) => set().setUserStatusManual(value as typeof status),
        },
      })),
    ];
  }, [
    musicPlayerEnabled,
    notificationSoundsOnlyWhenUnfocused,
    reduceAmbientEffects,
    showModelName,
    showTimestamps,
    showTokenUsage,
    speechToTextEnabled,
    t,
    theme,
    userStatus,
  ]);
  const searchResults = useMemo<OmnibarResult[]>(
    () => [
      ...searchOmnibar(query, { ...data, controls }),
      ...docs.results.map((result) => ({
        ...result,
        category: "docs" as const,
        preview: {
          kind: "docs" as const,
          title: result.title,
          categoryLabel: result.source,
          description: result.snippet,
          facts: result.line ? [{ label: t("commandCenter.preview.line", "Line"), value: result.line }] : [],
        },
        target: { kind: "window", window: "documentation" } as const,
        kind: "resource" as const,
        icon: "documentation" as const,
      })),
    ],
    [controls, data, docs.results, query, t],
  );
  const rawResults = useMemo<OmnibarResult[]>(
    () =>
      query.trim()
        ? searchResults
        : [
            ...controls,
            ...data.commands,
            ...data.chats
              .filter(
                (item) =>
                  ranking.pinnedIds.includes(`chat:${item.id}`) ||
                  ranking.recent.some((entry) => entry.id === `chat:${item.id}`),
              )
              .map((item) => ({
                id: `chat:${item.id}`,
                title: item.name,
                category: "chat" as const,
                target: { kind: "chat", chatId: item.id } as const,
                score: 1,
                preview: item.preview,
              })),
            ...data.resources
              .filter(
                (item) =>
                  ranking.pinnedIds.includes(`${item.kind}:${item.id}`) ||
                  ranking.recent.some((entry) => entry.id === `${item.kind}:${item.id}`),
              )
              .map((item) => ({
                id: `${item.kind}:${item.id}`,
                title: item.name,
                category: item.kind,
                target: { kind: "resource", resource: item.kind, id: item.id } as const,
                score: 1,
                preview: item.preview,
              })),
            ...data.connections
              .filter(
                (item) =>
                  ranking.pinnedIds.includes(`connection:${item.id}`) ||
                  ranking.recent.some((entry) => entry.id === `connection:${item.id}`),
              )
              .map((item) => ({
                id: `connection:${item.id}`,
                title: item.name,
                category: "connection" as const,
                target: { kind: "panel", panel: "connections" } as const,
                score: 1,
              })),
          ].filter((result, index, all) => all.findIndex((candidate) => candidate.id === result.id) === index),
    [
      controls,
      data.chats,
      data.commands,
      data.connections,
      data.resources,
      query,
      ranking.pinnedIds,
      ranking.recent,
      searchResults,
    ],
  );
  const results = useMemo<RankedOmnibarResult[]>(() => {
    const sourceById = new Map(rawResults.map((result) => [result.id, result]));
    return rankCommandResults(
      rawResults.map((result) => ({
        command: {
          id: result.id,
          title: result.title,
          kind:
            result.kind ??
            (result.category === "settings"
              ? "settings"
              : result.category === "navigation"
                ? "navigation"
                : "resource"),
          icon:
            result.icon ??
            (result.category === "professor" ? "professor" : result.category === "docs" ? "documentation" : "command"),
          target: result.target,
          availability:
            result.availability === "unavailable"
              ? { status: "requires-capability" }
              : typeof result.availability === "object"
                ? result.availability
                : { status: "available" },
        },
        score: result.score,
      })),
      ranking,
    ).map(({ result }) => ({ ...sourceById.get(result.command.id)!, command: result.command }));
  }, [ranking, rawResults]);
  const loading =
    [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isLoading) ||
    docs.isSearching;
  const failed =
    [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isError) || docs.isError;
  const activeIndex = Math.max(
    0,
    results.findIndex((result) => result.id === activeResultId),
  );
  const activeResult = results[activeIndex];
  const isMobileViewport = () => window.matchMedia("(max-width: 639px)").matches;

  useEffect(() => {
    if (!results.length) {
      setActiveResultId(null);
      return;
    }
    if (!activeResultId || !results.some((result) => result.id === activeResultId)) setActiveResultId(results[0]!.id);
  }, [activeResultId, results]);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => restoreRef.current?.focus();
  }, []);

  const close = onClose;
  const navigate = (target: ProfessorMariNavigationTarget) => {
    if (
      ui().editorDirty &&
      !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
    )
      return false;
    executeStateNavigation(target);
    return true;
  };
  const runSystemAction = (result: OmnibarResult) => {
    const definition = createSystemCommandDefinitions((key, fallback) =>
      t(`commandCenter.system.${key}`, fallback),
    ).find((item) => item.id === result.id);
    if (!definition) return false;
    if (
      ui().editorDirty &&
      !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
    )
      return false;
    if (
      definition.availability.status !== "available" &&
      !(
        definition.availability.status === "requires-capability" &&
        definition.availability.setupTarget &&
        definition.action.kind === "navigate"
      )
    )
      return false;
    if (definition.action.kind === "modal")
      ui().openModal(definition.action.modal, definition.action.props ? { ...definition.action.props } : undefined);
    else executeStateNavigation(definition.action.target);
    return true;
  };
  const choose = (result: OmnibarResult) => {
    if (result.control) return;
    if (result.id.startsWith("personal-extension:")) {
      if (activatePersonalExtensionCommand(result.id)) {
        const next = recordCommandUse(ranking, result.id);
        setRanking(next);
        writeCommandRankingState(next);
        close();
      }
      return;
    }
    if (result.id.startsWith("docs:")) {
      ui().openModal("docs-viewer", {
        initialDoc: result.path,
        initialSearchTerm: query.trim().slice(0, 200),
      });
      const next = recordCommandUse(ranking, result.id);
      setRanking(next);
      writeCommandRankingState(next);
      close();
      return;
    }
    if (runSystemAction(result)) {
      const next = recordCommandUse(ranking, result.id);
      setRanking(next);
      writeCommandRankingState(next);
      close();
      return;
    }
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
      if (
        ui().editorDirty &&
        !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
      )
        return;
      ui().openConnectionDetail(result.id.slice("connection:".length));
      const next = recordCommandUse(ranking, result.id);
      setRanking(next);
      writeCommandRankingState(next);
      close();
      return;
    }
    if (result.target && navigate(result.target)) {
      const next = recordCommandUse(ranking, result.id);
      setRanking(next);
      writeCommandRankingState(next);
      close();
    }
  };
  const resolveWithProfessorMari = (value: string) => {
    const result = searchOmnibar(value, data).find((item) => item.id === "professor-mari-navigation");
    return result?.target ?? null;
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResultId(results[Math.min(activeIndex + 1, Math.max(results.length - 1, 0))]?.id ?? null);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResultId(results[Math.max(activeIndex - 1, 0)]?.id ?? null);
    } else if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      if (activeResult.control) {
        setMobileDetail(true);
        requestAnimationFrame(() =>
          panelRef.current?.querySelector<HTMLElement>("[role='switch'], [role='radio']")?.focus(),
        );
      } else choose(activeResult);
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
    ).filter((element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0);
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
      <div ref={boundaryRef} className="relative h-[calc(100dvh-2rem)] w-full max-w-6xl sm:h-[calc(100dvh-8rem)]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-omnibar-title"
          onKeyDown={trapFocus}
          className="mx-auto mt-4 flex h-full w-full flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl sm:mt-12 sm:h-[min(42rem,calc(100dvh-10rem))]"
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
                setActiveResultId(null);
              }}
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              onKeyDown={onInputKeyDown}
              aria-label={t("omnibar.inputLabel", "Search Marinara")}
              aria-controls="global-omnibar-results"
              aria-activedescendant={activeResult ? `omnibar-${activeResult.id}` : undefined}
              placeholder={t("commandCenter.placeholder", "Search Marinara commands, chats, resources, and guides")}
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
          <div className="flex min-h-0 flex-1">
            <div
              id="global-omnibar-results"
              role="listbox"
              aria-label={t("omnibar.results", "Search results")}
              className={`min-h-0 w-full overflow-y-auto p-2 sm:w-[min(28rem,42%)] sm:border-r sm:border-[var(--border)] ${mobileDetail ? "hidden sm:block" : ""}`}
            >
              {!query.trim() && (
                <div className="px-3 pb-2 pt-1 text-xs text-[var(--muted-foreground)]">
                  {t("commandCenter.initialHint", "Pinned, recent, and useful controls")}
                  <span className="mt-1 block text-[0.6875rem] opacity-80">
                    {t("commandCenter.keyboardHint", "Enter open, arrows move, Tab navigate, Esc close")}
                  </span>
                </div>
              )}
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
              {results.map((result, resultIndex) => {
                const Icon = getCommandIcon(result.command?.icon, result.command?.kind ?? "navigation");
                return (
                  <div key={result.id} role="presentation" className="min-w-0">
                    {(!query.trim() || resultIndex === 0) &&
                    (resultIndex === 0 || results[resultIndex - 1]?.category !== result.category) ? (
                      <div className="px-3 pb-1 pt-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                        {t(`omnibar.categories.${result.category}`, result.category)}
                      </div>
                    ) : null}
                    <div
                      role="presentation"
                      onMouseEnter={() => setActiveResultId(result.id)}
                      className={`group flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-left ${result.id === activeResultId ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)]/60"}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/12 text-[var(--primary)]">
                        <Icon size={16} />
                      </span>
                      <button
                        type="button"
                        id={`omnibar-${result.id}`}
                        role="option"
                        aria-selected={result.id === activeResultId}
                        data-command-option
                        onClick={() => {
                          setActiveResultId(result.id);
                          if (result.control || isMobileViewport()) setMobileDetail(true);
                          else choose(result);
                        }}
                        className="min-w-0 flex-1 truncate text-left text-sm text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                      >
                        {result.id === "ask-professor-mari"
                          ? t("omnibar.askProfessorMari", "Ask Professor Mari")
                          : result.title}
                      </button>
                      <span className="shrink-0 text-xs capitalize text-[var(--muted-foreground)]">
                        {t(
                          `omnibar.categories.${result.category}`,
                          result.category === "professor" ? "Professor Mari" : result.category,
                        )}
                      </span>
                      <button
                        type="button"
                        aria-label={
                          ranking.pinnedIds.includes(result.id)
                            ? t("commandCenter.unpin", "Unpin")
                            : t("commandCenter.pin", "Pin")
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          const next = setCommandPinned(ranking, result.id, !ranking.pinnedIds.includes(result.id));
                          setRanking(next);
                          writeCommandRankingState(next);
                        }}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--secondary)] focus-visible:opacity-100 sm:min-h-9 sm:min-w-9 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Pin size={14} fill={ranking.pinnedIds.includes(result.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!loading && query.trim() && results.length === 0 && (
                <div className="p-5 text-center text-sm text-[var(--muted-foreground)]">
                  {t("omnibar.noResults", "No results")}
                </div>
              )}
            </div>
            <div className={`min-h-0 flex-1 ${mobileDetail ? "block" : "hidden sm:block"}`}>
              {activeResult ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMobileDetail(false)}
                    className="m-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-sm sm:hidden"
                  >
                    <ChevronLeft size={16} />
                    {t("commandCenter.backToResults", "Back to results")}
                  </button>
                  <CommandResultPreview
                    result={
                      {
                        command: activeResult.command,
                        score: activeResult.score,
                        preview: activeResult.preview,
                      } as RichCommandResult
                    }
                    statusLabel={
                      activeResult.command.availability?.status === "requires-capability"
                        ? t("commandCenter.setupRequired", "Setup required: {{capability}}", {
                            capability: activeResult.command.availability.capability ?? "capability",
                          })
                        : activeResult.command.availability?.status === "requires-admin"
                          ? t("commandCenter.adminRequired", "Administrator access required")
                          : undefined
                    }
                    openAction={
                      activeResult.control
                        ? undefined
                        : {
                            label:
                              activeResult.command.availability?.status === "requires-capability"
                                ? t("commandCenter.setup", "Set up")
                                : t("commandCenter.open", "Open"),
                            onSelect: () => choose(activeResult),
                            disabled:
                              activeResult.command.availability?.status === "requires-admin" ||
                              (activeResult.command.availability?.status === "requires-capability" &&
                                (!activeResult.target || !activeResult.command.availability.setupTarget)),
                          }
                    }
                  />
                  {activeResult.control?.type === "toggle" && (
                    <div className="border-t border-[var(--border)] p-4">
                      <CommandCenterToggle
                        label={activeResult.control.label}
                        checked={Boolean(activeResult.control.value)}
                        onCheckedChange={(value) => activeResult.control?.onChange(value)}
                      />
                    </div>
                  )}
                  {activeResult.control?.type === "choice" && (
                    <div className="border-t border-[var(--border)] p-4">
                      <CommandCenterSegmentedChoice
                        label={activeResult.control.label}
                        value={String(activeResult.control.value)}
                        options={(activeResult.control.options ?? []).map((option) => ({ ...option }))}
                        onValueChange={(value) => activeResult.control?.onChange(value)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
                  {t("commandCenter.selectResult", "Select a result to see details")}
                </div>
              )}
            </div>
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
