import {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ChatMode, ProfessorMariAskContext } from "@marinara-engine/shared";
import {
  ArrowRight,
  ChevronLeft,
  Clock3,
  Compass,
  Edit3,
  FolderOpen,
  Gamepad2,
  LayoutGrid,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Theater,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAgentConfigs } from "../../hooks/use-agents";
import { useActivatePersona, useCharacters, usePersonas } from "../../hooks/use-characters";
import { useChats, useChatMessageCount, useChatMessagePeek } from "../../hooks/use-chats";
import { useConnections } from "../../hooks/use-connections";
import { useDocsCommandSearchProvider } from "../../hooks/use-docs-command-search";
import { HOME_FAQ_ITEMS, getFaqSearchText } from "../chat/HomeFaq";
import { useLorebooks, useLorebookEntries, useUpdateLorebook } from "../../hooks/use-lorebooks";
import { usePresets, useSetDefaultPreset } from "../../hooks/use-presets";
import { getCharacterDisplayIdentity, parseCharacterDisplayData } from "../../lib/character-display";
import { isLanguageGenerationConnection } from "../../lib/connection-filters";
import { resolveChatResourceDropAction } from "../../lib/chat-resource-drop-capabilities";
import {
  requestChatResourceAssignment,
  type ChatResourceDragKind,
  type ChatResourceDragPayload,
} from "../../lib/chat-resource-drag";
import {
  COMMAND_CENTER_CATEGORY_FILTERS,
  presentCommandCenterResults,
  rankCommandResults,
  readCommandCenterSessionState,
  readCommandRankingState,
  recordCommandUse,
  writeCommandRankingState,
  writeCommandCenterSessionState,
  type CommandCenterCategoryFilter,
  type CommandCenterSessionState,
  type CommandCenterResultGroupId,
  type CommandRankingState,
} from "../../lib/command-center";
import { createSystemCommandDefinitions } from "../../lib/command-center-system-commands";
import { getCommandIcon } from "../../lib/command-icons";
import {
  createOmnibarContext,
  getUnambiguousOmnibarResult,
  getOmnibarActiveChatContextResultIds,
  parseOmnibarIntent,
  searchOmnibar,
  type OmnibarCategory,
  type OmnibarResult,
} from "../../lib/omnibar-search";
import { getOmnibarSettingsDestinations } from "../../lib/omnibar-settings";
import { resolveOmnibarRowState } from "../../lib/omnibar-row-state";
import {
  activatePersonalExtensionCommand,
  usePersonalExtensionCommands,
} from "../../lib/personal-extension-contributions";
import { resolvePresetArtwork } from "../../lib/preset-artwork";
import {
  buildProfessorMariCommandCenterContext,
  inferProfessorMariCommandCenterCapability,
} from "../../lib/professor-mari-command-center-context";
import type { ProfessorMariNavigationTarget } from "../../lib/professor-mari-navigation";
import { executeStateNavigation } from "../../lib/state-navigation";
import { getAvatarCropStyle } from "../../lib/utils";
import { useLocalizedUiText } from "../../localization/use-localized-ui-text";
import { useChatStore } from "../../stores/chat.store";
import { useUIStore } from "../../stores/ui.store";
import { CommandCenterBrowseGrid } from "../command-center/CommandCenterBrowseGrid";
import { CommandCenterActionValue } from "../command-center/CommandCenterActionValue";
import { CommandCenterResultRow } from "../command-center/CommandCenterResultRow";
import { CommandCenterSegmentedChoice } from "../command-center/CommandCenterSegmentedChoice";
import { CommandCenterToggle } from "../command-center/CommandCenterToggle";
import { CommandResultPreview } from "../command-center/CommandResultPreview";
import {
  getCommandCenterCategoryVisual,
  getCommandCenterChatModeVisual,
  type CommandCenterCategoryLabels,
  type CommandCenterChatModeLabels,
} from "../command-center/command-center-visuals";
import type { CommandCenterPreviewFact, RichCommandResult } from "../command-center/command-result-preview.types";

const OmnibarProfessorMariChat = lazy(() =>
  import("../chat/HomeProfessorMariChat").then((module) => ({ default: module.HomeProfessorMariChat })),
);

const PROFESSOR_MARI_DRAFT_KEY = "__home_professor_mari__";
const PROFESSOR_MARI_PEEK_URL = "/sprites/mari/generated/professor-mari-assistant-idle.png";
const BROWSE_BATCH_SIZE = 48;

type OmnibarPane = "results" | "browse" | "detail" | "mari";
type DetailOrigin = Exclude<OmnibarPane, "detail" | "mari">;
type BrowseFilter = Exclude<CommandCenterCategoryFilter, "all" | "settings" | "docs">;
type RankedOmnibarResult = OmnibarResult & {
  command: RichCommandResult["command"];
};

const FILTER_CATEGORY: Partial<Record<CommandCenterCategoryFilter, OmnibarCategory>> = {
  chats: "chat",
  characters: "character",
  personas: "persona",
  lorebooks: "lorebook",
  presets: "preset",
  connections: "connection",
  agents: "agent",
  settings: "settings",
  docs: "docs",
};

const BROWSE_FILTERS: readonly BrowseFilter[] = [
  "chats",
  "characters",
  "personas",
  "lorebooks",
  "presets",
  "connections",
  "agents",
];

function readNamedRow(value: unknown) {
  if (typeof value !== "object" || value === null || !("id" in value) || typeof value.id !== "string") return null;
  const name = "name" in value && typeof value.name === "string" ? value.name : value.id;
  return { id: value.id, name };
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatDate(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
    : undefined;
}

function isRichResult(result: RankedOmnibarResult) {
  return Boolean(
    result.preview &&
    (result.preview.description ||
      result.preview.media ||
      result.preview.facts?.length ||
      result.command.availability?.status !== "available"),
  );
}

function resultMetadata(result: RankedOmnibarResult, categoryLabel: string) {
  if (result.control?.type === "choice") return result.control.label;
  return (
    result.contextLabel ??
    result.preview?.subtitle ??
    result.preview?.facts?.[0]?.value?.toString() ??
    result.description ??
    categoryLabel
  );
}

function getOmnibarResourceId(result: Pick<RankedOmnibarResult, "id">) {
  const parts = result.id.split(":");
  return parts[0] === "context" ? (parts.at(-1) ?? "") : parts.slice(1).join(":");
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

/**
 * Tier-2 preview data: fetched lazily only for the one focused result, gated by
 * a short focus dwell so arrow-key scrubbing does not fire a request per row.
 * React Query caches by id, so re-focusing a result is instant.
 */
function usePreviewDetail(previewResult: RankedOmnibarResult | null): {
  extraFacts: CommandCenterPreviewFact[];
  detail: ReactNode;
  detailLoading: boolean;
} {
  const { t } = useTranslation();
  const category = previewResult?.category;
  const resourceId = previewResult ? previewResult.id.slice(previewResult.id.indexOf(":") + 1) : "";

  const [settledId, setSettledId] = useState<string | null>(null);
  useEffect(() => {
    if (!previewResult) {
      setSettledId(null);
      return;
    }
    const id = previewResult.id;
    const timer = window.setTimeout(() => setSettledId(id), 160);
    return () => window.clearTimeout(timer);
  }, [previewResult]);
  const settled = !!previewResult && settledId === previewResult.id;

  const chatId = category === "chat" && settled ? resourceId : null;
  const lorebookId = category === "lorebook" && settled ? resourceId : null;

  const peek = useChatMessagePeek(chatId, 3, !!chatId);
  const messageCount = useChatMessageCount(chatId);
  const entries = useLorebookEntries(lorebookId);

  if (chatId) {
    const messages = peek.data ?? [];
    const extraFacts: CommandCenterPreviewFact[] =
      typeof messageCount.data?.count === "number"
        ? [{ label: t("commandCenter.preview.messages", "Messages"), value: messageCount.data.count }]
        : [];
    const detail = messages.length ? (
      <div className="space-y-1.5">
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded-lg bg-[color-mix(in_srgb,var(--foreground)_4%,var(--card))] px-2.5 py-1.5 ring-1 ring-inset ring-[var(--border)]/50"
          >
            <div className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-[var(--muted-foreground)]">
              {message.role === "user"
                ? t("commandCenter.preview.you", "You")
                : t("commandCenter.preview.reply", "Reply")}
            </div>
            <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-[var(--foreground)]">
              {message.content}
            </p>
          </div>
        ))}
      </div>
    ) : null;
    return { extraFacts, detail, detailLoading: peek.isLoading };
  }

  if (lorebookId) {
    const list = entries.data ?? [];
    const keywords = Array.from(new Set(list.flatMap((entry) => entry.keys ?? []).filter(Boolean))).slice(0, 8);
    const names = list
      .map((entry) => entry.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 6);
    const extraFacts: CommandCenterPreviewFact[] = [
      ...(keywords.length
        ? [{ label: t("commandCenter.preview.keywords", "Keywords"), value: keywords.join(", ") }]
        : []),
      ...(names.length
        ? [{ label: t("commandCenter.preview.sampleEntries", "Entries"), value: names.join(", ") }]
        : []),
    ];
    return { extraFacts, detail: null, detailLoading: entries.isLoading };
  }

  return { extraFacts: [], detail: null, detailLoading: false };
}

function GlobalOmnibarDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const localize = useLocalizedUiText();
  const ui = useUIStore.getState;
  const inputRef = useRef<HTMLInputElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // The session normalizer resets any persisted `mari` pane to `results`, so the
  // omnibar always reopens on search; the Mari conversation resumes only on
  // explicit re-entry within a session.
  const [session, setSession] = useState<CommandCenterSessionState>(() => readCommandCenterSessionState());
  const {
    query,
    filter,
    pane,
    activeResultId,
    detailOrigin,
    browseSelectedId,
    browseLimit,
    detailResultId,
    mariReturnResultId,
  } = session;
  const setSessionValue = <K extends keyof CommandCenterSessionState>(key: K, value: CommandCenterSessionState[K]) =>
    setSession((current) => ({ ...current, [key]: value }));
  const setQuery = (value: string) => setSessionValue("query", value);
  // Keep typing responsive: the heavy search/rank/present pipeline reruns against
  // the deferred query so keystrokes paint immediately on large libraries.
  const deferredQuery = useDeferredValue(query);
  const setFilter = (value: CommandCenterCategoryFilter) => setSessionValue("filter", value);
  const setPane = (value: OmnibarPane) => setSessionValue("pane", value);
  const setActiveResultId = (value: string | null) => setSessionValue("activeResultId", value);
  const setDetailOrigin = (value: DetailOrigin) => setSessionValue("detailOrigin", value);
  const setBrowseSelectedId = (value: string | null) => setSessionValue("browseSelectedId", value);
  const setBrowseLimit = (value: number) => setSessionValue("browseLimit", value);
  const [detailResult, setDetailResult] = useState<RankedOmnibarResult | null>(null);
  const [mariChatOpen, setMariChatOpen] = useState(() => session.pane === "mari");
  const [mariMounted, setMariMounted] = useState(() => session.pane === "mari");
  const [mariContext, setMariContext] = useState<ProfessorMariAskContext | null>(null);
  const [mariReturnPane, setMariReturnPane] = useState<DetailOrigin>("results");
  const mariReturnResultIdRef = useRef<string | null>(mariReturnResultId);
  const [browseCompareMode, setBrowseCompareMode] = useState(false);
  const [browseCompareIds, setBrowseCompareIds] = useState<string[]>([]);
  const [ranking, setRanking] = useState<CommandRankingState>(() => readCommandRankingState());
  const chats = useChats();
  const characters = useCharacters();
  const personas = usePersonas();
  const lorebooks = useLorebooks(undefined, { includeHidden: true });
  const presets = usePresets();
  const connections = useConnections();
  const agents = useAgentConfigs();
  const activatePersona = useActivatePersona();
  const updateLorebook = useUpdateLorebook();
  const setDefaultPreset = useSetDefaultPreset();
  const extensionCommands = usePersonalExtensionCommands();
  const docs = useDocsCommandSearchProvider(query, { enabled: true });
  const theme = useUIStore((state) => state.theme);
  const reduceMotion = useReducedMotion();
  const reduceAmbientEffects = useUIStore((state) => state.reduceAmbientEffects);
  const musicPlayerEnabled = useUIStore((state) => state.musicPlayerEnabled);
  const mariEnabled = useUIStore((state) => state.commandCenterMariEnabled);
  const speechToTextEnabled = useUIStore((state) => state.speechToTextEnabled);
  const notificationSoundsOnlyWhenUnfocused = useUIStore((state) => state.notificationSoundsOnlyWhenUnfocused);
  const showTimestamps = useUIStore((state) => state.showTimestamps);
  const showModelName = useUIStore((state) => state.showModelName);
  const showTokenUsage = useUIStore((state) => state.showTokenUsage);
  const userStatus = useUIStore((state) => state.userStatus);
  const activeChat = useChatStore((state) => state.activeChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const openCharacterId = useUIStore((state) => state.characterDetailId);
  const openPersonaId = useUIStore((state) => state.personaDetailId);
  const openLorebookId = useUIStore((state) => state.lorebookDetailId);
  const openPresetId = useUIStore((state) => state.presetDetailId);
  const openConnectionId = useUIStore((state) => state.connectionDetailId);
  const openAgentId = useUIStore((state) => state.agentDetailId);
  const settingsTab = useUIStore((state) => state.settingsTab);
  const settingsTargetControlId = useUIStore((state) => state.settingsTargetControlId);
  const settingsPanelVisible = useUIStore((state) => state.rightPanelOpen && state.rightPanel === "settings");
  const rightPanelOpen = useUIStore((state) => state.rightPanelOpen);
  const rightPanel = useUIStore((state) => state.rightPanel);
  const botBrowserOpen = useUIStore((state) => state.botBrowserOpen);
  const gameAssetsBrowserOpen = useUIStore((state) => state.gameAssetsBrowserOpen);
  const characterLibraryOpen = useUIStore((state) => state.characterLibraryOpen);
  const cardLibraryKind = useUIStore((state) => state.cardLibraryKind);
  const agentCatalogOpen = useUIStore((state) => state.agentCatalogOpen);
  const editorDirty = useUIStore((state) => state.editorDirty);

  const categoryLabels = useMemo<CommandCenterCategoryLabels>(
    () => ({
      navigation: t("omnibar.categories.navigation", "Navigation"),
      chat: t("omnibar.categories.chat", "Chats"),
      character: t("omnibar.categories.character", "Characters"),
      persona: t("omnibar.categories.persona", "Personas"),
      lorebook: t("omnibar.categories.lorebook", "Lorebooks"),
      preset: t("omnibar.categories.preset", "Presets"),
      connection: t("omnibar.categories.connection", "Connections"),
      agent: t("omnibar.categories.agent", "Agents"),
      settings: t("omnibar.categories.settings", "Settings"),
      professor: t("omnibar.categories.professor", "Professor Mari"),
      docs: t("omnibar.categories.docs", "Docs"),
    }),
    [t],
  );
  const chatModeLabels = useMemo<CommandCenterChatModeLabels>(
    () => ({
      conversation: t("home.recentChats.mode.conversation", "Conversation"),
      roleplay: t("home.recentChats.mode.roleplay", "Roleplay"),
      game: t("home.recentChats.mode.game", "Game"),
    }),
    [t],
  );
  const filterLabels = useMemo<Record<CommandCenterCategoryFilter, string>>(
    () => ({
      all: t("commandCenter.filters.all", "All"),
      chats: t("commandCenter.filters.chats", "Chats"),
      characters: t("commandCenter.filters.characters", "Characters"),
      personas: t("commandCenter.filters.personas", "Personas"),
      lorebooks: t("commandCenter.filters.lorebooks", "Lorebooks"),
      presets: t("commandCenter.filters.presets", "Presets"),
      connections: t("commandCenter.filters.connections", "Connections"),
      agents: t("commandCenter.filters.agents", "Agents"),
      settings: t("commandCenter.filters.settings", "Settings"),
      docs: t("commandCenter.filters.docs", "Docs"),
    }),
    [t],
  );
  const groupLabels = useMemo<Record<CommandCenterResultGroupId, string>>(
    () => ({
      context: t("commandCenter.groups.context", "On this screen"),
      "current-work": t("commandCenter.groups.currentWork", "Current work"),
      continue: t("commandCenter.groups.continue", "Continue"),
      pinned: t("commandCenter.groups.pinned", "Pinned"),
      recent: t("commandCenter.groups.recent", "Recent"),
      "quick-controls": t("commandCenter.groups.quickControls", "Quick controls"),
      "create-navigation": t("commandCenter.groups.suggested", "Suggested"),
      navigation: t("commandCenter.groups.navigation", "Navigation"),
      chats: filterLabels.chats,
      characters: filterLabels.characters,
      personas: filterLabels.personas,
      lorebooks: filterLabels.lorebooks,
      presets: filterLabels.presets,
      connections: filterLabels.connections,
      agents: filterLabels.agents,
      settings: filterLabels.settings,
      docs: filterLabels.docs,
      "professor-suggested": t("commandCenter.groups.mariSuggested", "Professor Mari"),
      "professor-fallback": t("commandCenter.groups.askMari", "Ask Professor Mari"),
    }),
    [filterLabels, t],
  );

  const characterById = useMemo(
    () =>
      new Map(
        (characters.data ?? []).flatMap((item) => {
          const row = readNamedRow(item);
          return row ? [[row.id, item] as const] : [];
        }),
      ),
    [characters.data],
  );
  const characterNameById = useMemo(
    () =>
      new Map(
        (characters.data ?? []).flatMap((item) => {
          const row = readNamedRow(item);
          if (!row) return [];
          const record = item as Record<string, unknown>;
          return [
            [
              row.id,
              getCharacterDisplayIdentity({ data: record.data, comment: record.comment as string | null | undefined }),
            ] as const,
          ];
        }),
      ),
    [characters.data],
  );
  const personaById = useMemo(() => new Map((personas.data ?? []).map((item) => [item.id, item])), [personas.data]);
  const connectionById = useMemo(
    () =>
      new Map(
        (connections.data ?? []).flatMap((item) => {
          const row = readNamedRow(item);
          return row ? [[row.id, row] as const] : [];
        }),
      ),
    [connections.data],
  );

  // Reverse index: which lorebooks are attached to a given character / persona.
  // Lets resource previews surface their real relationships, not just their own row.
  const lorebookLinks = useMemo(() => {
    const byCharacter = new Map<string, string[]>();
    const byPersona = new Map<string, string[]>();
    for (const book of lorebooks.data ?? []) {
      for (const cid of book.characterIds ?? []) {
        byCharacter.set(cid, [...(byCharacter.get(cid) ?? []), book.name]);
      }
      for (const pid of book.personaIds ?? []) {
        byPersona.set(pid, [...(byPersona.get(pid) ?? []), book.name]);
      }
    }
    return { byCharacter, byPersona };
  }, [lorebooks.data]);

  const data = useMemo(() => {
    const commands = [
      {
        id: "home",
        title: t("home.title", "Home"),
        kind: "navigation" as const,
        icon: "home" as const,
        target: { kind: "home" } as const,
        aliases: ["start"],
      },
      {
        id: "chats",
        title: t("ui.layout.chats", "Chats"),
        kind: "navigation" as const,
        icon: "chats" as const,
        target: { kind: "chats" } as const,
      },
      ...createSystemCommandDefinitions((key, fallback) => t(`commandCenter.system.${key}`, fallback)).map(
        (command) => ({
          id: command.id,
          title: command.title,
          kind: command.kind,
          icon: command.icon,
          aliases: command.aliases,
          target: command.target,
          availability: command.availability,
        }),
      ),
      ...extensionCommands.map((command) => ({
        ...command,
        target: { kind: "home" } as const,
      })),
    ];
    const chatRows = (chats.data ?? []).map((chat) => {
      const linkedCharacters = (chat.characterIds ?? []).slice(0, 2).flatMap((id) => {
        const linked = characterById.get(id) as Record<string, unknown> | undefined;
        if (!linked) return [];
        const display = parseCharacterDisplayData({
          data: linked.data,
          comment: linked.comment as string | null | undefined,
        });
        return [{ display, avatarPath: readString(linked.avatarPath) }];
      });
      const linkedDisplay = linkedCharacters[0]?.display;
      const connection = chat.connectionId ? connectionById.get(chat.connectionId) : undefined;
      const persona = chat.personaId ? personaById.get(chat.personaId) : undefined;
      const updated = formatDate(chat.lastMessageAt ?? chat.updatedAt);
      return {
        id: chat.id,
        name: chat.name,
        mode: chat.mode,
        preview: {
          kind: "chat" as const,
          title: chat.name,
          categoryLabel: chatModeLabels[chat.mode],
          subtitle: linkedCharacters.map((item) => item.display.name).join(", ") || undefined,
          media: linkedCharacters[0]?.avatarPath
            ? {
                src: linkedCharacters[0].avatarPath,
                alt: linkedDisplay?.name ?? chat.name,
                kind: "avatar" as const,
                avatarCropStyle: getAvatarCropStyle(linkedDisplay?.avatarCrop),
              }
            : undefined,
          facts: [
            {
              label: t("commandCenter.preview.lastUpdated", "Last updated"),
              value: updated ?? t("commandCenter.values.unknown", "Unknown"),
            },
            ...(connection
              ? [{ label: t("commandCenter.preview.connection", "Connection"), value: connection.name }]
              : []),
            ...(persona ? [{ label: t("commandCenter.preview.persona", "Persona"), value: persona.name }] : []),
            ...(chat.metadata?.tags?.length
              ? [{ label: t("commandCenter.preview.tags", "Tags"), value: chat.metadata.tags.join(", ") }]
              : []),
            ...(chat.metadata?.enableAgents !== undefined
              ? [
                  {
                    label: t("commandCenter.preview.agents", "Agents"),
                    value: chat.metadata.enableAgents
                      ? t("commandCenter.values.enabled", "Enabled")
                      : t("commandCenter.values.disabled", "Disabled"),
                  },
                ]
              : []),
          ],
        },
      };
    });
    const resources = [
      ...(characters.data ?? []).flatMap((item) => {
        const row = readNamedRow(item);
        if (!row) return [];
        const record = item as Record<string, unknown>;
        const display = parseCharacterDisplayData({
          data: record.data,
          comment: record.comment as string | null | undefined,
        });
        const avatarPath = typeof record.avatarPath === "string" ? record.avatarPath : undefined;
        return [
          {
            kind: "character" as const,
            ...row,
            name: display.name,
            description: display.description ?? undefined,
            preview: {
              kind: "character" as const,
              title: display.name,
              description: display.description ?? undefined,
              categoryLabel: categoryLabels.character,
              media: avatarPath
                ? {
                    src: avatarPath,
                    alt: display.name,
                    kind: "avatar" as const,
                    avatarCropStyle: getAvatarCropStyle(display.avatarCrop),
                  }
                : undefined,
              metadataLine:
                [
                  display.creator
                    ? t("commandCenter.preview.byCreator", "by {{creator}}", { creator: display.creator })
                    : null,
                  readString(record.version)
                    ? t("commandCenter.preview.versionShort", "v{{version}}", { version: readString(record.version)! })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined,
              facts: [
                ...(display.creator
                  ? [{ label: t("commandCenter.preview.creator", "Creator"), value: display.creator }]
                  : []),
                ...(readString(record.version)
                  ? [{ label: t("commandCenter.preview.version", "Version"), value: readString(record.version)! }]
                  : []),
                ...(lorebookLinks.byCharacter.get(row.id)?.length
                  ? [
                      {
                        label: t("commandCenter.preview.lorebooks", "Lorebooks"),
                        value: lorebookLinks.byCharacter.get(row.id)!.join(", "),
                      },
                    ]
                  : []),
                ...(display.comment
                  ? [{ label: t("commandCenter.preview.comment", "Comment"), value: display.comment }]
                  : []),
              ],
              badges: (display.tags ?? []).length
                ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: (display.tags ?? []).join(", ") })]
                : [],
            },
          },
        ];
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
          categoryLabel: categoryLabels.persona,
          media: item.avatarPath
            ? {
                src: item.avatarPath,
                alt: item.name,
                kind: "avatar" as const,
                avatarCropStyle: getAvatarCropStyle(item.avatarCrop),
              }
            : undefined,
          facts: [
            ...(item.creator ? [{ label: t("commandCenter.preview.creator", "Creator"), value: item.creator }] : []),
            ...(item.personaVersion
              ? [{ label: t("commandCenter.preview.version", "Version"), value: item.personaVersion }]
              : []),
            ...(lorebookLinks.byPersona.get(item.id)?.length
              ? [
                  {
                    label: t("commandCenter.preview.lorebooks", "Lorebooks"),
                    value: lorebookLinks.byPersona.get(item.id)!.join(", "),
                  },
                ]
              : []),
            ...(item.comment ? [{ label: t("commandCenter.preview.note", "Note"), value: item.comment }] : []),
          ],
          badges: [
            ...(item.tags?.length
              ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: item.tags.join(", ") })]
              : []),
            ...(item.isActive ? [t("commandCenter.values.active", "Active")] : []),
          ],
          accent: item.nameColor,
        },
        control: {
          type: "toggle" as const,
          label: item.isActive
            ? t("commandCenter.actions.activePersona", "Active persona")
            : t("commandCenter.actions.activatePersona", "Activate persona"),
          value: item.isActive,
          onChange: (value: string | boolean) => value === true && !item.isActive && activatePersona.mutate(item.id),
        },
      })),
      ...(lorebooks.data ?? []).map((item) => {
        const linkedNames = [
          ...(item.characterIds ?? []).map((id) => characterNameById.get(id)),
          ...(item.personaIds ?? []).map((id) => personaById.get(id)?.name),
        ].filter((name): name is string => Boolean(name));
        return {
          kind: "lorebook" as const,
          id: item.id,
          name: item.name,
          description: item.description,
          preview: {
            kind: "lorebook" as const,
            title: item.name,
            description: item.description,
            categoryLabel: categoryLabels.lorebook,
            media: item.imagePath ? { src: item.imagePath, alt: item.name, kind: "artwork" as const } : undefined,
            metadataLine:
              [
                typeof item.entryCount === "number"
                  ? t("commandCenter.preview.entryCount", "{{count}} entries", { count: item.entryCount })
                  : null,
                item.isGlobal ? t("commandCenter.values.global", "Global") : t("commandCenter.values.scoped", "Scoped"),
                linkedNames.length
                  ? t("commandCenter.preview.linkedCount", "{{count}} linked", { count: linkedNames.length })
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || undefined,
            status: {
              label: item.enabled
                ? t("commandCenter.values.enabled", "Enabled")
                : t("commandCenter.values.disabled", "Disabled"),
              tone: item.enabled ? ("success" as const) : ("neutral" as const),
            },
            facts: [
              { label: t("commandCenter.preview.category", "Category"), value: item.category },
              { label: t("commandCenter.preview.tokenBudget", "Token budget"), value: item.tokenBudget },
              { label: t("commandCenter.preview.entryLimit", "Entry limit"), value: item.entryLimit },
              {
                label: t("commandCenter.preview.scope", "Scope"),
                value: item.isGlobal
                  ? t("commandCenter.values.global", "Global")
                  : t("commandCenter.values.scoped", "Scoped"),
              },
              ...(linkedNames.length
                ? [{ label: t("commandCenter.preview.linkedTo", "Linked to"), value: linkedNames.join(", ") }]
                : []),
            ],
            badges: item.tags?.length
              ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: item.tags.join(", ") })]
              : [],
          },
          control: {
            type: "toggle" as const,
            label: item.enabled
              ? t("commandCenter.actions.disableLorebook", "Disable lorebook")
              : t("commandCenter.actions.enableLorebook", "Enable lorebook"),
            value: item.enabled,
            onChange: (value: string | boolean) => updateLorebook.mutate({ id: item.id, enabled: value === true }),
          },
        };
      }),
      ...(presets.data ?? []).map((item) => {
        const artwork = resolvePresetArtwork(item);
        return {
          kind: "preset" as const,
          id: item.id,
          name: item.name,
          description: item.description,
          preview: {
            kind: "preset" as const,
            title: item.name,
            description: item.description,
            categoryLabel: categoryLabels.preset,
            media: artwork ? { src: artwork, alt: item.name, kind: "artwork" as const } : undefined,
            status: item.isDefault
              ? { label: t("commandCenter.values.default", "Default"), tone: "success" as const }
              : undefined,
            facts: [
              { label: t("commandCenter.preview.author", "Author"), value: item.author },
              { label: t("commandCenter.preview.wrapFormat", "Wrap format"), value: item.wrapFormat },
              { label: t("commandCenter.preview.sections", "Sections"), value: item.sectionOrder.length },
              { label: t("commandCenter.preview.groups", "Groups"), value: item.groupOrder.length },
            ],
          },
          control: {
            type: "toggle" as const,
            label: item.isDefault
              ? t("commandCenter.actions.defaultPreset", "Default preset")
              : t("commandCenter.actions.setDefaultPreset", "Set default preset"),
            value: item.isDefault,
            onChange: (value: string | boolean) =>
              value === true && !item.isDefault && setDefaultPreset.mutate(item.id),
          },
        };
      }),
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
          categoryLabel: categoryLabels.agent,
          media: item.imagePath ? { src: item.imagePath, alt: item.name, kind: "artwork" as const } : undefined,
          status: {
            label:
              item.enabled === "true"
                ? t("commandCenter.values.enabled", "Enabled")
                : t("commandCenter.values.disabled", "Disabled"),
            tone: item.enabled === "true" ? ("success" as const) : ("neutral" as const),
          },
          facts: [
            { label: t("commandCenter.preview.phase", "Phase"), value: item.phase },
            { label: t("commandCenter.preview.type", "Type"), value: item.type },
            ...(item.connectionId
              ? [
                  {
                    label: t("commandCenter.preview.connection", "Connection"),
                    value: connectionById.get(item.connectionId)?.name ?? item.connectionId,
                  },
                ]
              : []),
          ],
        },
      })),
    ];
    const connectionRows = (connections.data ?? []).flatMap((item) => {
      const row = readNamedRow(item);
      if (!row) return [];
      const record = item as Record<string, unknown>;
      const provider = typeof record.provider === "string" ? record.provider : undefined;
      const model = typeof record.model === "string" ? record.model : undefined;
      const imagePath = typeof record.imagePath === "string" ? record.imagePath : undefined;
      return [
        {
          ...row,
          provider,
          model,
          isDefault: record.isDefault === true,
          imagePath,
          preview: {
            kind: "connection" as const,
            title: row.name,
            categoryLabel: categoryLabels.connection,
            subtitle: provider,
            media: imagePath ? { src: imagePath, alt: row.name, kind: "artwork" as const } : undefined,
            status:
              record.isDefault === true
                ? {
                    label: t("commandCenter.preview.defaultConnection", "Default connection"),
                    tone: "success" as const,
                  }
                : undefined,
            facts: [
              ...(model ? [{ label: t("commandCenter.preview.model", "Model"), value: model }] : []),
              ...(provider ? [{ label: t("commandCenter.preview.provider", "Provider"), value: provider }] : []),
              ...(readString(record.context)
                ? [{ label: t("commandCenter.preview.context", "Context"), value: readString(record.context)! }]
                : []),
              ...(readString(record.maxContext)
                ? [
                    {
                      label: t("commandCenter.preview.maxContext", "Max context"),
                      value: readString(record.maxContext)!,
                    },
                  ]
                : []),
            ],
          },
        },
      ];
    });
    return {
      commands,
      chats: chatRows,
      resources,
      connections: connectionRows,
      askProfessorTitle: t("omnibar.askProfessorMari"),
    };
  }, [
    agents.data,
    categoryLabels,
    characterById,
    characterNameById,
    characters.data,
    chatModeLabels,
    chats.data,
    connections.data,
    connectionById,
    extensionCommands,
    lorebooks.data,
    lorebookLinks,
    personaById,
    personas.data,
    activatePersona,
    presets.data,
    setDefaultPreset,
    t,
    updateLorebook,
  ]);

  const controls = useMemo<OmnibarResult[]>(() => {
    const set = useUIStore.getState;
    const toggleRows = [
      ["commandCenterMariEnabled", "commandCenter.controls.mariAssist", mariEnabled, set().setCommandCenterMariEnabled],
      [
        "reduceAmbientEffects",
        "commandCenter.controls.reducedEffects",
        reduceAmbientEffects,
        set().setReduceAmbientEffects,
      ],
      ["musicPlayerEnabled", "commandCenter.controls.musicPlayer", musicPlayerEnabled, set().setMusicPlayerEnabled],
      ["speechToTextEnabled", "commandCenter.controls.speechToText", speechToTextEnabled, set().setSpeechToTextEnabled],
      [
        "notificationSoundsOnlyWhenUnfocused",
        "commandCenter.controls.unfocusedSounds",
        notificationSoundsOnlyWhenUnfocused,
        set().setNotificationSoundsOnlyWhenUnfocused,
      ],
      ["showTimestamps", "commandCenter.controls.timestamps", showTimestamps, set().setShowTimestamps],
      ["showModelName", "commandCenter.controls.modelName", showModelName, set().setShowModelName],
      ["showTokenUsage", "commandCenter.controls.tokenUsage", showTokenUsage, set().setShowTokenUsage],
    ] as const;
    const settingsDestinations = getOmnibarSettingsDestinations().map((setting) => ({
      id: setting.id,
      title: setting.title,
      category: "settings" as const,
      score: 165,
      aliases: setting.aliases,
      target: {
        kind: "settings" as const,
        tab: setting.tab,
        controlId: setting.controlId,
      },
      description: `${setting.sectionLabel} · ${setting.description}`,
      kind: "settings" as const,
      icon: "settings" as const,
    }));
    return [
      ...settingsDestinations,
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
          onChange: (value) => set().setTheme(String(value) as "dark" | "light"),
        },
      },
      {
        id: "control:presence",
        title: t("commandCenter.controls.presence", "Presence"),
        category: "settings",
        score: 175,
        control: {
          type: "choice",
          label: t("commandCenter.controls.presence", "Presence"),
          value: userStatus,
          options: (["active", "idle", "dnd", "invisible"] as const).map((value) => ({
            value,
            label: t(`commandCenter.presence.${value}`, value),
          })),
          onChange: (value) => set().setUserStatusManual(String(value) as typeof userStatus),
        },
      },
      ...toggleRows.map(([id, key, value, onChange]) => ({
        id: `control:${id}`,
        title: t(key, id),
        category: "settings" as const,
        score: 170,
        control: {
          type: "toggle" as const,
          label: t(key, id),
          value,
          onChange: (nextValue: string | boolean) => onChange(nextValue === true),
        },
      })),
    ];
  }, [
    mariEnabled,
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

  const searchableEntityResults = useMemo<OmnibarResult[]>(
    () => [
      ...data.chats.map((item) => ({
        id: `chat:${item.id}`,
        title: item.name,
        category: "chat" as const,
        target: { kind: "chat", chatId: item.id } as const,
        score: 1,
        preview: item.preview,
        kind: "chat" as const,
        icon: "chats" as const,
      })),
      ...data.resources.map((item) => ({
        ...item,
        id: `${item.kind}:${item.id}`,
        title: item.name,
        category: item.kind,
        target: { kind: "resource", resource: item.kind, id: item.id } as const,
        score: 1,
        description: item.description,
        preview: item.preview,
        kind: "resource" as const,
        icon: item.kind,
        control: "control" in item ? item.control : undefined,
      })),
      ...data.connections.map((item) => ({
        id: `connection:${item.id}`,
        title: item.name,
        category: "connection" as const,
        target: { kind: "panel", panel: "connections" } as const,
        score: 1,
        preview: item.preview,
        kind: "settings" as const,
        icon: "connection" as const,
      })),
    ],
    [data.chats, data.connections, data.resources],
  );
  const searchableCommandResults = useMemo<OmnibarResult[]>(
    () =>
      data.commands.map((command) => ({
        ...command,
        category: command.kind === "settings" ? ("settings" as const) : ("navigation" as const),
        score: 160,
      })),
    [data.commands],
  );
  const allLocalResults = useMemo(
    () => [...controls, ...searchableCommandResults, ...searchableEntityResults],
    [controls, searchableCommandResults, searchableEntityResults],
  );
  const omnibarContext = useMemo(() => {
    const activeChatResultIds = [
      ...getOmnibarActiveChatContextResultIds(
        activeChatId,
        activeChat
          ? {
              ...activeChat,
              enableAgents: activeChat.metadata?.enableAgents,
              activeAgentIds: activeChat.metadata?.activeAgentIds,
            }
          : null,
      ),
    ];
    const openResource = (
      [
        ["character", openCharacterId],
        ["persona", openPersonaId],
        ["lorebook", openLorebookId],
        ["preset", openPresetId],
        ["connection", openConnectionId],
        ["agent", openAgentId],
      ] as const
    ).find(([, id]) => id);
    const settingsResultId = settingsPanelVisible
      ? settingsTargetControlId
        ? `settings-control:${settingsTargetControlId}`
        : settingsTab
          ? `settings-section:${settingsTab}`
          : "settings"
      : null;
    const surfaceResultIds = rightPanelOpen
      ? [rightPanel === "connections" ? "integrations" : rightPanel === "settings" ? "settings" : rightPanel]
      : botBrowserOpen
        ? ["card-browser"]
        : gameAssetsBrowserOpen
          ? ["game-assets"]
          : characterLibraryOpen
            ? [cardLibraryKind === "personas" ? "persona-library" : "character-library"]
            : agentCatalogOpen
              ? ["agent-library", "packages"]
              : activeChatId
                ? ["chats", `chat:${activeChatId}`]
                : ["home"];
    const setupResultIds = data.commands
      .filter(
        (command) =>
          "availability" in command &&
          command.availability?.status === "requires-capability" &&
          command.availability.setupTarget,
      )
      .map((command) => command.id);
    const failedSources = [chats, characters, personas, lorebooks, presets, connections, agents, docs].some(
      (source) => source.isError,
    );
    const surface = openResource
      ? "editor"
      : settingsPanelVisible
        ? "settings"
        : gameAssetsBrowserOpen
          ? "game"
          : botBrowserOpen || characterLibraryOpen || agentCatalogOpen
            ? "library"
            : activeChatId
              ? "chat"
              : "home";
    return createOmnibarContext({
      surface,
      surfaceResultIds,
      activeChat:
        activeChat && activeChat.id === activeChatId
          ? { id: activeChat.id, mode: activeChat.mode, resultIds: activeChatResultIds }
          : undefined,
      openResource:
        openResource && openResource[1]
          ? { kind: openResource[0], id: openResource[1], resultId: `${openResource[0]}:${openResource[1]}` }
          : undefined,
      settingsTarget: settingsResultId
        ? { tab: settingsTab, controlId: settingsTargetControlId ?? undefined, resultId: settingsResultId }
        : undefined,
      editorDirty,
      pinnedResultIds: ranking.pinnedIds,
      recentResultIds: ranking.recent.map((entry) => entry.id),
      setupResultIds,
      error: failedSources ? { resultIds: ["diagnostics"], message: t("omnibar.error") } : undefined,
    });
  }, [
    activeChat,
    activeChatId,
    agentCatalogOpen,
    agents,
    botBrowserOpen,
    cardLibraryKind,
    characterLibraryOpen,
    characters,
    chats,
    connections,
    data.commands,
    docs,
    editorDirty,
    gameAssetsBrowserOpen,
    lorebooks,
    openAgentId,
    openCharacterId,
    openConnectionId,
    openLorebookId,
    openPersonaId,
    openPresetId,
    personas,
    presets,
    ranking.pinnedIds,
    ranking.recent,
    rightPanel,
    rightPanelOpen,
    settingsTab,
    settingsTargetControlId,
    settingsPanelVisible,
    t,
  ]);
  const contextLabels = useMemo(
    () => ({
      surface: t("commandCenter.context.currentSurface", "On this screen"),
      "open-resource": t("commandCenter.context.openResource", "Open now"),
      "active-chat": t("commandCenter.context.activeChat", "Used by this chat"),
      "settings-target": t("commandCenter.context.settingsTarget", "Current setting"),
      dirty: t("commandCenter.context.unsaved", "Open with unsaved changes"),
      setup: t("commandCenter.context.setup", "Setup available"),
      error: t("commandCenter.context.error", "Related to a current error"),
      pinned: t("commandCenter.context.pinned", "Pinned"),
      recent: t("commandCenter.context.recent", "Recently used"),
    }),
    [t],
  );
  const searchResults = useMemo<OmnibarResult[]>(() => {
    const query = deferredQuery;
    const normalizedQuery = query.trim().toLowerCase();
    const faqResults =
      normalizedQuery.length < 2
        ? []
        : HOME_FAQ_ITEMS.flatMap((item) => {
            const searchText = getFaqSearchText(item, localize);
            if (!searchText.includes(normalizedQuery)) return [];
            const question = `${item.question} ${localize(item.question)}`.toLowerCase();
            const score = question.includes(normalizedQuery) ? 230 : 130;
            return [
              {
                id: `faq:${item.id}`,
                title: localize(item.question),
                category: "docs" as const,
                score,
                description: localize(item.answer),
                preview: {
                  kind: "docs" as const,
                  title: localize(item.question),
                  categoryLabel: t("omnibar.faq", "FAQ"),
                  description: localize(item.answer),
                  facts: (item.bullets ?? []).slice(0, 6).map((bullet) => ({
                    label: t("omnibar.faq.step", "Useful step"),
                    value: localize(bullet),
                  })),
                },
                kind: "resource" as const,
                icon: "documentation" as const,
              } satisfies OmnibarResult,
            ];
          });
    // Professor Mari blur: the fallback row speaks the query's intent, and is
    // promoted above search hits when the query reads like a question or nothing
    // matched well. Its preview "peeks" what Mari will do before you commit.
    const trimmedQuery = query.trim();
    const capability = inferProfessorMariCommandCenterCapability(trimmedQuery);
    const intent = parseOmnibarIntent(trimmedQuery);
    const askTitles: Partial<Record<typeof capability, string>> = {
      repair: t("omnibar.askMari.repair", "Ask Mari to fix this"),
      recommend: t("omnibar.askMari.recommend", "Ask Mari to compare & recommend"),
      create: t("omnibar.askMari.create", "Ask Mari to create this"),
      edit: t("omnibar.askMari.change", "Ask Mari to change this"),
    };
    const askPeeks: Partial<Record<typeof capability, string>> = {
      repair: t("omnibar.askMari.peek.repair", "Mari will help troubleshoot and fix this."),
      recommend: t("omnibar.askMari.peek.recommend", "Mari will compare the options and recommend one."),
      create: t("omnibar.askMari.peek.create", "Mari will help you create this."),
      edit: t("omnibar.askMari.peek.change", "Mari will help you change this."),
    };
    const askTitle = askTitles[capability] ?? t("omnibar.askProfessorMari", "Ask Professor Mari");
    const askPeek =
      askPeeks[capability] ?? t("omnibar.askMari.peek.explain", "Mari will explain this and guide your next step.");
    const baseResults = searchOmnibar(query, { ...data, controls, context: omnibarContext, contextLabels }).filter(
      (result) => mariEnabled || result.id !== "ask-professor-mari",
    );
    const bestMatchScore = baseResults.reduce(
      (best, result) => (result.id === "ask-professor-mari" ? best : Math.max(best, result.score)),
      -1,
    );
    const directResult = getUnambiguousOmnibarResult(baseResults);
    const directIntent = intent?.kind === "navigate" || intent?.kind === "action" || intent?.kind === "create";
    const directSetup =
      intent?.kind === "repair" &&
      directResult?.availability &&
      typeof directResult.availability === "object" &&
      directResult.availability.setupTarget;
    const clearDirect = Boolean(directResult && directResult.score >= 250 && (directIntent || directSetup));
    const promoteMari =
      !clearDirect &&
      (intent?.kind === "explain" ||
        intent?.kind === "recommend" ||
        intent?.kind === "repair" ||
        /\?\s*$|^\s*(?:who|what|where|which|when|can|could|should|would|is|are|do|does|did|help|tell)\b/i.test(
          trimmedQuery,
        ) ||
        bestMatchScore < 150);
    const askResults = baseResults.map((result) =>
      result.id === "ask-professor-mari"
        ? {
            ...result,
            title: askTitle,
            description: askPeek,
            group: promoteMari ? ("professor-suggested" as const) : result.group,
            score: promoteMari ? 500 : result.score,
            preview: {
              kind: "docs" as const,
              title: askTitle,
              categoryLabel: t("omnibar.askProfessorMari", "Ask Professor Mari"),
              description: askPeek,
              facts: trimmedQuery
                ? [{ label: t("omnibar.askMari.peek.searchLabel", "Your search"), value: trimmedQuery }]
                : [],
            },
          }
        : result,
    );
    return [
      ...askResults,
      ...faqResults,
      ...docs.results.map((result) => ({
        ...result,
        category: "docs" as const,
        preview: {
          kind: "docs" as const,
          title: result.title,
          categoryLabel: result.source,
          description: result.snippet,
          facts: [
            ...(result.source
              ? [{ label: t("commandCenter.preview.category", "Category"), value: result.source }]
              : []),
            ...(result.path ? [{ label: t("commandCenter.preview.source", "Source"), value: result.path }] : []),
            ...(result.line ? [{ label: t("commandCenter.preview.line", "Line"), value: result.line }] : []),
            ...(result.snippet ? [{ label: t("commandCenter.preview.match", "Match"), value: result.snippet }] : []),
          ],
        },
        target: { kind: "window", window: "documentation" } as const,
        kind: "resource" as const,
        icon: "documentation" as const,
      })),
    ];
  }, [contextLabels, controls, data, deferredQuery, docs.results, localize, mariEnabled, omnibarContext, t]);
  const idleResults = useMemo(() => {
    const byId = new Map(allLocalResults.map((result) => [result.id, result]));
    const selected: OmnibarResult[] = [];
    const add = (id: string) => {
      const result = byId.get(id);
      if (result && !selected.some((item) => item.id === id)) selected.push(result);
    };
    ranking.recent.forEach((entry) => add(entry.id));
    ["control:theme", "control:presence", "create-character", "create-chat", "create-persona", "documentation"].forEach(
      add,
    );
    for (const result of searchableCommandResults) {
      if (selected.length >= 4) break;
      add(result.id);
    }
    return selected.slice(0, 12);
  }, [allLocalResults, ranking.recent, searchableCommandResults]);
  // Context-aware results: read the app's current location (active chat, open
  // editor) and surface direct jumps to whatever is on screen and under it.
  const contextResults = useMemo<OmnibarResult[]>(() => {
    const out: OmnibarResult[] = [];
    const push = (result: OmnibarResult) => {
      if (!out.some((item) => item.id === result.id)) out.push(result);
    };
    const nameOf = (map: Map<string, unknown>, id: string) => readNamedRow(map.get(id))?.name;
    const listName = (list: readonly unknown[] | undefined, id: string) =>
      readNamedRow((list ?? []).find((item) => readNamedRow(item)?.id === id))?.name;

    if (openCharacterId) {
      const name = characterNameById.get(openCharacterId);
      if (name)
        push({
          id: `context:character:${openCharacterId}`,
          title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
          category: "character",
          target: { kind: "resource", resource: "character", id: openCharacterId },
          score: 0,
          group: "current-work",
          icon: "character",
        });
    }
    for (const [id, kind, list, icon] of [
      [openPersonaId, "persona", personas.data, "persona"],
      [openLorebookId, "lorebook", lorebooks.data, "lorebook"],
      [openPresetId, "preset", presets.data, "preset"],
      [openAgentId, "agent", agents.data, "agent"],
    ] as const) {
      if (!id) continue;
      const name = listName(list, id);
      if (!name) continue;
      push({
        id: `context:${kind}:${id}`,
        title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
        category: kind,
        target: { kind: "resource", resource: kind, id },
        score: 0,
        group: "current-work",
        icon,
      });
    }
    if (openConnectionId) {
      const name = connectionById.get(openConnectionId)?.name;
      if (name)
        push({
          id: `connection:${openConnectionId}`,
          title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
          category: "connection",
          score: 0,
          group: "current-work",
          icon: "connection",
        });
    }
    if (activeChat && activeChat.id === activeChatId) {
      push({
        id: `context:chat:${activeChat.id}`,
        title: t("commandCenter.context.currentChat", "Current chat: {{name}}", { name: activeChat.name }),
        category: "chat",
        target: { kind: "chat", chatId: activeChat.id },
        score: 0,
        group: "current-work",
        icon: "chats",
      });
      for (const characterId of activeChat.characterIds ?? []) {
        const name = characterNameById.get(characterId);
        if (!name) continue;
        push({
          id: `context:chat-character:${characterId}`,
          title: name,
          category: "character",
          target: { kind: "resource", resource: "character", id: characterId },
          score: 0,
          group: "current-work",
          icon: "character",
        });
      }
      if (activeChat.personaId) {
        const name = nameOf(personaById, activeChat.personaId);
        if (name)
          push({
            id: `context:chat-persona:${activeChat.personaId}`,
            title: name,
            category: "persona",
            target: { kind: "resource", resource: "persona", id: activeChat.personaId },
            score: 0,
            group: "current-work",
            icon: "persona",
          });
      }
      if (activeChat.promptPresetId) {
        const name = listName(presets.data, activeChat.promptPresetId);
        if (name)
          push({
            id: `context:chat-preset:${activeChat.promptPresetId}`,
            title: name,
            category: "preset",
            target: { kind: "resource", resource: "preset", id: activeChat.promptPresetId },
            score: 0,
            group: "current-work",
            icon: "preset",
          });
      }
      if (activeChat.connectionId) {
        const name = connectionById.get(activeChat.connectionId)?.name;
        if (name)
          push({
            id: `connection:${activeChat.connectionId}`,
            title: name,
            category: "connection",
            score: 0,
            group: "current-work",
            icon: "connection",
          });
      }
    }
    return out.slice(0, 12);
  }, [
    activeChat,
    activeChatId,
    agents.data,
    characterNameById,
    connectionById,
    lorebooks.data,
    openAgentId,
    openCharacterId,
    openConnectionId,
    openLorebookId,
    openPersonaId,
    openPresetId,
    personaById,
    personas.data,
    presets.data,
    t,
  ]);
  const continueResult = useMemo<OmnibarResult | null>(() => {
    if (!mariEnabled || contextResults.length === 0) return null;
    return {
      id: "ask-professor-mari",
      title: t("commandCenter.continueMari", "Continue with Professor Mari"),
      category: "professor",
      description: t("commandCenter.continueMariDescription", "Open Mari with the current work attached."),
      score: 140,
      group: "continue",
      kind: "action",
      icon: "professor",
    };
  }, [contextResults.length, mariEnabled, t]);
  const rawResults = useMemo(
    () =>
      deferredQuery.trim()
        ? searchResults
        : [...contextResults, ...(continueResult ? [continueResult] : []), ...idleResults],
    [contextResults, continueResult, deferredQuery, idleResults, searchResults],
  );
  const rankedResults = useMemo<RankedOmnibarResult[]>(() => {
    const sourceById = new Map(rawResults.map((result) => [result.id, result]));
    const searchRanking = deferredQuery.trim() ? { ...ranking, pinnedIds: [] } : ranking;
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
      searchRanking,
    ).map(({ result }) => ({ ...sourceById.get(result.command.id)!, command: result.command }));
  }, [deferredQuery, ranking, rawResults]);
  const presentation = useMemo(
    () =>
      presentCommandCenterResults(rankedResults, {
        query: deferredQuery,
        filter,
        rankingState: ranking,
      }),
    [filter, deferredQuery, rankedResults, ranking],
  );
  const browseAvailability = useMemo(
    () =>
      Object.fromEntries(
        COMMAND_CENTER_CATEGORY_FILTERS.map((item) => [
          item,
          item === "all"
            ? allLocalResults.length
            : allLocalResults.filter((result) => result.category === FILTER_CATEGORY[item]).length,
        ]),
      ) as Record<CommandCenterCategoryFilter, number>,
    [allLocalResults],
  );
  const tabAvailability = query.trim() ? presentation.categoryAvailability : browseAvailability;
  const availableFilters = COMMAND_CENTER_CATEGORY_FILTERS.filter(
    (item) => item === "all" || item === filter || tabAvailability[item] > 0,
  );
  const results = presentation.results;
  const activeIndex = results.findIndex((result) => result.id === activeResultId);
  const activeResult = activeIndex >= 0 ? results[activeIndex] : undefined;
  const loading =
    [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isLoading) ||
    docs.isSearching;
  const failed =
    [chats, characters, personas, lorebooks, presets, connections, agents].some((item) => item.isError) || docs.isError;
  const browseFilter = BROWSE_FILTERS.includes(filter as BrowseFilter)
    ? (filter as BrowseFilter)
    : (BROWSE_FILTERS.find((item) => browseAvailability[item] > 0) ?? "characters");
  const browseResults = useMemo(
    () => searchableEntityResults.filter((result) => result.category === FILTER_CATEGORY[browseFilter]),
    [browseFilter, searchableEntityResults],
  );
  const visibleBrowseResults = browseResults.slice(0, browseLimit);

  useEffect(() => {
    const availableIds = new Set(browseResults.map((result) => result.id));
    setBrowseCompareIds((current) => {
      const next = current.filter((id) => availableIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [browseResults]);

  // Persist the session, but debounced: writing JSON to localStorage on every
  // keystroke is pure jank. A ref holds the latest session so the unmount-only
  // effect can flush it on close without losing the final edit.
  const sessionRef = useRef(session);
  sessionRef.current = session;
  useEffect(() => {
    const timer = window.setTimeout(() => writeCommandCenterSessionState(session), 250);
    return () => window.clearTimeout(timer);
  }, [session]);
  useEffect(
    () => () => {
      writeCommandCenterSessionState(sessionRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!results.length) {
      setSession((current) => (current.activeResultId === null ? current : { ...current, activeResultId: null }));
      return;
    }
    if (!activeResultId || !results.some((result) => result.id === activeResultId)) {
      const firstResultId = results[0]!.id;
      setSession((current) =>
        current.activeResultId === firstResultId ? current : { ...current, activeResultId: firstResultId },
      );
    }
  }, [activeResultId, results]);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => restoreRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!activeResultId || pane !== "results") return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-result-id="${CSS.escape(activeResultId)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeResultId, pane]);

  useEffect(() => {
    if (pane !== "detail" || (detailOrigin !== "browse" && !window.matchMedia("(max-width: 639px)").matches)) return;
    requestAnimationFrame(() => backButtonRef.current?.focus());
  }, [detailOrigin, pane]);

  const navigate = (target: ProfessorMariNavigationTarget) => {
    if (
      ui().editorDirty &&
      !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
    )
      return false;
    executeStateNavigation(target);
    return true;
  };
  const recordUse = (id: string) => {
    const next = recordCommandUse(ranking, id);
    setRanking(next);
    writeCommandRankingState(next);
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
        recordUse(result.id);
        onClose();
      }
      return;
    }
    if (result.id.startsWith("docs:")) {
      ui().openModal("docs-viewer", {
        initialDoc: result.path,
        initialSearchTerm: query.trim().slice(0, 200),
      });
      recordUse(result.id);
      onClose();
      return;
    }
    if (result.id.startsWith("faq:")) {
      ui().openModal("faq-viewer", { initialItemId: result.id.slice("faq:".length) });
      recordUse(result.id);
      onClose();
      return;
    }
    if (runSystemAction(result)) {
      recordUse(result.id);
      onClose();
      return;
    }
    if (result.id === "ask-professor-mari") {
      openProfessorMari();
      return;
    }
    if (result.category === "connection") {
      if (
        ui().editorDirty &&
        !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
      )
        return;
      ui().openConnectionDetail(result.id.slice("connection:".length));
      recordUse(result.id);
      onClose();
      return;
    }
    if (result.target && navigate(result.target)) {
      recordUse(result.id);
      onClose();
    }
  };
  // Run a known command by id (quick-actions row) by routing it through the same
  // handler the result rows use, so behavior stays identical.
  const runCommandById = (id: string) => {
    const result = allLocalResults.find((item) => item.id === id);
    if (result) choose(result);
  };
  const showResultDetail = (result: RankedOmnibarResult, origin: DetailOrigin = "results") => {
    setActiveResultId(result.id);
    setDetailResult(result);
    setSessionValue("detailResultId", result.id);
    setDetailOrigin(origin);
    setPane("detail");
  };
  const selectResult = (result: RankedOmnibarResult) => {
    if (!result.control && isRichResult(result) && window.matchMedia("(pointer: coarse)").matches) {
      showResultDetail(result);
      return;
    }
    setActiveResultId(result.id);
    if (result.control?.type === "toggle") result.control.onChange(result.control.value !== true);
    else if (result.control?.type === "choice") return;
    else choose(result);
  };
  const handleEscape = () => {
    if (pane === "detail") {
      setDetailResult(null);
      setSessionValue("detailResultId", null);
      setPane(detailOrigin);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (pane === "mari") {
      setMariChatOpen(false);
      setPane(mariReturnPane);
      requestAnimationFrame(() => {
        const resultId = mariReturnResultIdRef.current;
        const row = resultId
          ? listRef.current?.querySelector<HTMLElement>(`[data-result-id="${CSS.escape(resultId)}"]`)
          : null;
        (row?.querySelector<HTMLElement>("button") ?? inputRef.current)?.focus();
      });
    } else if (pane === "browse") {
      setPane("results");
      setFilter("all");
      setBrowseCompareMode(false);
      setBrowseCompareIds([]);
      setSessionValue("detailResultId", null);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else onClose();
  };
  const moveSelection = (index: number) => {
    const next = results[index];
    setActiveResultId(next?.id ?? null);
    if (pane === "detail") {
      setDetailResult(next ?? null);
      setSessionValue("detailResultId", next?.id ?? null);
    }
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleEscape();
    } else if (pane !== "browse" && event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(Math.min(Math.max(activeIndex, -1) + 1, results.length - 1));
    } else if (pane !== "browse" && event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(Math.max(activeIndex < 0 ? 0 : activeIndex - 1, 0));
    } else if (pane !== "browse" && event.key === "Home") {
      event.preventDefault();
      moveSelection(0);
    } else if (pane !== "browse" && event.key === "End") {
      event.preventDefault();
      moveSelection(results.length - 1);
    } else if ((pane === "results" || pane === "detail") && event.key === "Enter" && activeResult) {
      event.preventDefault();
      if (activeResult.control?.type === "toggle") activeResult.control.onChange(activeResult.control.value !== true);
      else if (activeResult.control?.type === "choice") return;
      else choose(activeResult);
    } else if (
      pane === "results" &&
      event.key === "ArrowRight" &&
      activeResult &&
      (activeResult.control?.type === "choice" || isRichResult(activeResult))
    ) {
      event.preventDefault();
      showResultDetail(activeResult);
    }
  };
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      handleEscape();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])') ?? [],
    ).filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        !element.closest('[aria-hidden="true"]') &&
        element.getClientRects().length > 0,
    );
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
  const setCategoryFilter = (nextFilter: CommandCenterCategoryFilter) => {
    setFilter(nextFilter);
    setDetailResult(null);
    setSessionValue("detailResultId", null);
    setActiveResultId(null);
    setBrowseSelectedId(null);
    setBrowseLimit(BROWSE_BATCH_SIZE);
    setBrowseCompareMode(false);
    setBrowseCompareIds([]);
    if (!query.trim() && BROWSE_FILTERS.includes(nextFilter as BrowseFilter)) setPane("browse");
    else if (pane === "detail") setPane("results");
    if (pane === "browse" && !BROWSE_FILTERS.includes(nextFilter as BrowseFilter)) setPane("results");
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const openBrowse = () => {
    if (!BROWSE_FILTERS.includes(filter as BrowseFilter)) setFilter(browseFilter);
    setPane("browse");
    setBrowseLimit(BROWSE_BATCH_SIZE);
    setBrowseCompareMode(false);
    setBrowseCompareIds([]);
  };
  const leaveDetail = () => {
    if (pane === "mari") {
      setMariChatOpen(false);
      setPane(mariReturnPane);
      requestAnimationFrame(() => {
        const resultId = mariReturnResultIdRef.current;
        const row = resultId
          ? listRef.current?.querySelector<HTMLElement>(`[data-result-id="${CSS.escape(resultId)}"]`)
          : null;
        (row?.querySelector<HTMLElement>("button") ?? inputRef.current)?.focus();
      });
      return;
    }
    const destination = pane === "detail" ? detailOrigin : "results";
    setDetailResult(null);
    setSessionValue("detailResultId", null);
    if (pane === "browse") setFilter("all");
    setPane(destination);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const openProfessorMari = (selectedResult: RankedOmnibarResult | null = null) => {
    const draft = query.trim();
    if (draft) useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, draft);
    const focusResult = selectedResult ?? contextResults[0] ?? null;
    setMariContext(buildProfessorMariCommandCenterContext(draft, focusResult));
    setMariReturnPane(pane === "browse" ? "browse" : pane === "detail" ? detailOrigin : "results");
    const returnResultId = focusResult?.id ?? activeResultId;
    mariReturnResultIdRef.current = returnResultId;
    setSessionValue("mariReturnResultId", returnResultId);
    setMariChatOpen(true);
    setMariMounted(true);
    setPane("mari");
  };
  const compareWithProfessorMari = () => {
    const resultById = new Map(browseResults.map((result) => [result.id, result]));
    const selected = browseCompareIds.flatMap((id) => {
      const result = resultById.get(id);
      return result ? [result] : [];
    });
    const primary = selected[0];
    if (!primary || selected.length < 2) return;
    const draft =
      query.trim() ||
      t("commandCenter.compareDraft", "Compare these {{count}} items and recommend the best fit for me.", {
        count: selected.length,
      });
    useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, draft);
    setMariContext(buildProfessorMariCommandCenterContext(draft, primary, selected.slice(1)));
    setMariReturnPane("browse");
    mariReturnResultIdRef.current = primary.id;
    setSessionValue("mariReturnResultId", primary.id);
    setMariChatOpen(true);
    setMariMounted(true);
    setPane("mari");
  };
  const toggleBrowseCompareResult = (id: string) => {
    setBrowseCompareIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : current.length < 5
          ? [...current, id]
          : current,
    );
  };
  const resultIcon = (result: RankedOmnibarResult) => {
    if (result.category === "chat") {
      const mode = data.chats.find((chat) => `chat:${chat.id}` === result.id)?.mode;
      if (mode === "roleplay") return Theater;
      if (mode === "game") return Gamepad2;
      return MessageCircle;
    }
    return getCommandIcon(result.command.icon, result.command.kind);
  };
  const resultVisual = (result: RankedOmnibarResult) => {
    if (result.category === "chat") {
      const mode = data.chats.find((chat) => `chat:${chat.id}` === result.id)?.mode;
      if (mode) return getCommandCenterChatModeVisual(mode as ChatMode, chatModeLabels);
    }
    return getCommandCenterCategoryVisual(result.category, categoryLabels);
  };
  const resultControlPending = (result: RankedOmnibarResult) =>
    (result.category === "persona" && activatePersona.isPending) ||
    (result.category === "lorebook" && updateLorebook.isPending) ||
    (result.category === "preset" && setDefaultPreset.isPending);
  const liveMessage = loading
    ? t("commandCenter.live.loading", "Loading results")
    : failed
      ? t("commandCenter.live.partialFailure", "{{count}} results. Some sources could not be loaded.", {
          count: results.length,
        })
      : t("commandCenter.live.resultCount", "{{count}} results", { count: results.length });
  const currentResultById = useMemo(() => {
    const current = new Map(results.map((result) => [result.id, result] as const));
    for (const result of searchableEntityResults) {
      if (current.has(result.id)) continue;
      current.set(result.id, {
        ...result,
        command: {
          id: result.id,
          title: result.title,
          kind: result.kind ?? "resource",
          icon: result.icon ?? "command",
          target: result.target,
          availability: { status: "available" as const },
        },
      } as RankedOmnibarResult);
    }
    return current;
  }, [results, searchableEntityResults]);
  const resolveCurrentResult = (result: RankedOmnibarResult | null) =>
    result ? (currentResultById.get(result.id) ?? null) : null;
  // Always show the detail panel for whatever result is currently selected.
  const previewResult = resolveCurrentResult(detailResult) ?? resolveCurrentResult(activeResult ?? null);
  const previewDetail = usePreviewDetail(previewResult);

  useEffect(() => {
    if (!detailResultId) {
      setDetailResult(null);
      return;
    }
    setDetailResult(currentResultById.get(detailResultId) ?? null);
  }, [currentResultById, detailResultId]);

  const previewActions = previewResult
    ? (() => {
        if (previewResult.command.availability?.status === "requires-admin") return [];
        const mariActions = mariEnabled
          ? [
              {
                label: t("commandCenter.actions.continueWithMari", "Continue with Mari"),
                icon: Sparkles,
                onSelect: () => openProfessorMari(previewResult),
              },
            ]
          : [];
        if (previewResult.control?.type === "choice") return mariActions;
        const resourceKinds: Partial<Record<OmnibarCategory, ChatResourceDragKind>> = {
          character: "character",
          persona: "persona",
          lorebook: "lorebook",
          preset: "preset",
          connection: "connection",
          agent: "agent",
        };
        const resourceKind = resourceKinds[previewResult.category];
        const resourceId = resourceKind ? getOmnibarResourceId(previewResult) : "";
        const connection =
          resourceKind === "connection"
            ? (connections.data ?? []).find((item) => readNamedRow(item)?.id === resourceId)
            : undefined;
        const payload: ChatResourceDragPayload | null = resourceKind
          ? {
              version: 1,
              kind: resourceKind,
              ids: [resourceId],
              label: previewResult.title,
              ...(connection && !isLanguageGenerationConnection(connection)
                ? { unsupported: "connection-kind" as const }
                : {}),
            }
          : null;
        const rowResource =
          resourceKind === "character" ||
          resourceKind === "persona" ||
          resourceKind === "preset" ||
          resourceKind === "connection"
            ? resourceKind
            : null;
        const rowState = rowResource
          ? resolveOmnibarRowState({
              resource: rowResource,
              id: resourceId,
              activeChat,
              globallyActive:
                previewResult.category === "persona"
                  ? previewResult.control?.value === true
                  : previewResult.category === "preset"
                    ? previewResult.control?.value === true
                    : undefined,
            })
          : null;
        const canAddToChat =
          payload &&
          activeChat &&
          (!rowState || rowState.canAddToChat) &&
          resolveChatResourceDropAction(payload, activeChat)?.type !== "blocked";
        const addToChatAction =
          payload && canAddToChat
            ? {
                label: t("commandCenter.actions.addToThisChat", "Add to this chat"),
                icon: MessageCircle,
                onSelect: () => {
                  requestChatResourceAssignment(payload);
                  recordUse(previewResult.id);
                  onClose();
                },
              }
            : null;
        if ((previewResult.category === "persona" || previewResult.category === "preset") && !rowState?.globalAction) {
          return [...(addToChatAction ? [addToChatAction] : []), ...mariActions];
        }
        if (previewResult.category === "persona" || previewResult.category === "preset") {
          const globalAction =
            previewResult.control?.type === "toggle"
              ? {
                  label:
                    previewResult.category === "persona"
                      ? t("commandCenter.actions.activatePersona", "Activate persona")
                      : t("commandCenter.actions.setDefaultPreset", "Set default preset"),
                  icon: previewResult.category === "persona" ? Play : ArrowRight,
                  onSelect: () => previewResult.control?.onChange(true),
                  disabled: resultControlPending(previewResult),
                }
              : null;
          return [
            ...(globalAction ? [globalAction] : []),
            ...(addToChatAction ? [addToChatAction] : []),
            ...mariActions,
          ];
        }
        if (previewResult.control?.type === "toggle") {
          return [
            {
              label: previewResult.control.value
                ? t("commandCenter.actions.disable", "Disable")
                : t("commandCenter.actions.enable", "Enable"),
              icon: ArrowRight,
              onSelect: () => previewResult.control?.onChange(previewResult.control.value !== true),
              disabled: resultControlPending(previewResult),
            },
            ...(addToChatAction ? [addToChatAction] : []),
            ...mariActions,
          ];
        }
        if (previewResult.category === "character") {
          const characterId = getOmnibarResourceId(previewResult);
          const startChatAction = {
            label: t("commandCenter.actions.startChat", "Start chat"),
            icon: Play,
            onSelect: () => {
              ui().openModal("start-character-chat", { characterId, characterName: previewResult.title });
              recordUse(previewResult.id);
              onClose();
            },
          };
          const editAction = {
            label: t("commandCenter.actions.editCharacter", "Edit character"),
            icon: Edit3,
            onSelect: () => choose(previewResult),
          };
          // Mari stays the primary (last) action when enabled; otherwise fall back
          // to add-to-chat so the third slot is never wasted.
          return [
            startChatAction,
            editAction,
            ...(mariActions.length ? mariActions : addToChatAction ? [addToChatAction] : []),
          ];
        }
        const requiresSetup = previewResult.command.availability?.status === "requires-capability";
        const openAction =
          previewResult.target && (!requiresSetup || previewResult.command.availability?.setupTarget)
            ? {
                label:
                  previewResult.category === "chat"
                    ? t("commandCenter.actions.resumeChat", "Resume chat")
                    : previewResult.category === "docs"
                      ? t("commandCenter.actions.openDocs", "Open documentation")
                      : t("commandCenter.open", "Open"),
                icon: previewResult.category === "chat" ? Play : FolderOpen,
                onSelect: () => choose(previewResult),
                disabled: resultControlPending(previewResult),
              }
            : null;
        return [...(openAction ? [openAction] : []), ...(addToChatAction ? [addToChatAction] : []), ...mariActions];
      })()
    : [];

  // One preview body shared by the three detail surfaces (mobile inline, browse,
  // and the external xl panel) so they never drift apart. `withControls` adds the
  // inline choice/toggle editors the compact mobile/xl panels show.
  const renderResultPreview = (withControls: boolean) =>
    previewResult ? (
      <>
        <CommandResultPreview
          result={
            {
              command: previewResult.command,
              score: previewResult.score,
              preview: previewResult.preview,
            } as RichCommandResult
          }
          variant="compact"
          statusLabel={
            previewResult.command.availability?.status === "requires-capability"
              ? t("commandCenter.setupRequired", "Setup required: {{capability}}", {
                  capability:
                    previewResult.command.availability.capability ?? t("commandCenter.capability", "capability"),
                })
              : previewResult.command.availability?.status === "requires-admin"
                ? t("commandCenter.adminRequired", "Administrator access required")
                : undefined
          }
          actions={previewActions}
          extraFacts={previewDetail.extraFacts}
          detail={previewDetail.detail}
          detailLoading={previewDetail.detailLoading}
        />
        {withControls && previewResult.control?.type === "choice" ? (
          <div className="border-t border-[var(--border)] p-3">
            <CommandCenterSegmentedChoice
              label={previewResult.control.label}
              value={String(previewResult.control.value)}
              options={(previewResult.control.options ?? []).map((option) => ({ ...option }))}
              onValueChange={(value) => previewResult.control?.onChange(value)}
              variant="compact"
            />
          </div>
        ) : null}
        {withControls &&
        previewResult.control?.type === "toggle" &&
        previewResult.category !== "persona" &&
        previewResult.category !== "preset" ? (
          <div className="border-t border-[var(--border)] p-3">
            <CommandCenterToggle
              label={previewResult.control.label}
              checked={Boolean(previewResult.control.value)}
              stateLabel={
                previewResult.control.value
                  ? t("commandCenter.values.enabled", "Enabled")
                  : t("commandCenter.values.disabled", "Disabled")
              }
              onCheckedChange={(value) => previewResult.control?.onChange(value)}
              disabled={resultControlPending(previewResult)}
              loading={resultControlPending(previewResult)}
              variant="compact"
              className="w-full"
            />
          </div>
        ) : null}
      </>
    ) : null;

  return createPortal(
    <motion.div
      ref={panelRef}
      data-component="GlobalOmnibar"
      data-pane={pane}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 backdrop-blur-sm sm:px-6 sm:pt-[10vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      onKeyDown={trapFocus}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-omnibar-title"
        data-component="GlobalOmnibar.Panel"
        className={`relative isolate flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--card)] shadow-2xl motion-safe:animate-omnibar-in sm:max-w-[44rem] sm:rounded-2xl sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] sm:ring-1 sm:ring-[var(--border)]/60 ${pane === "mari" ? "sm:h-[min(44rem,80dvh)] sm:max-h-[min(44rem,80dvh)]" : "sm:h-[min(36rem,68dvh)] sm:max-h-[min(36rem,68dvh)]"}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-[radial-gradient(120%_100%_at_12%_0%,oklch(0.72_0.16_255/0.12),transparent_60%),radial-gradient(120%_100%_at_88%_0%,oklch(0.73_0.21_345/0.11),transparent_60%)]"
        />
        <h2 id="global-omnibar-title" className="sr-only">
          {pane === "mari"
            ? t("commandCenter.workTitle", "Professor Mari Work")
            : t("omnibar.title", "Search Marinara")}
        </h2>
        <header className="shrink-0 pt-[env(safe-area-inset-top)]">
          <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-3 sm:h-14 sm:px-4">
            {pane !== "results" ? (
              <button
                ref={backButtonRef}
                type="button"
                onClick={leaveDetail}
                aria-label={
                  pane === "mari"
                    ? t("commandCenter.backToFind", "Back to Find")
                    : pane === "detail" && detailOrigin === "browse"
                      ? t("commandCenter.backToBrowse", "Back to browse")
                      : t("commandCenter.backToResults", "Back to results")
                }
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] sm:size-9"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Search size={19} aria-hidden="true" className="shrink-0 text-[var(--primary)]" />
            )}
            <AnimatePresence initial={false} mode="wait">
              {pane === "mari" ? (
                <motion.div
                  key="omnibar-mari-header"
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <img
                    src={PROFESSOR_MARI_PEEK_URL}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="size-9 shrink-0 rounded-full object-cover object-top ring-1 ring-[var(--primary)]/30 ring-offset-2 ring-offset-[var(--card)]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                      {t("omnibar.categories.professor", "Professor Mari")}
                    </span>
                    <span className="block truncate text-[0.6875rem] font-medium leading-tight text-[var(--muted-foreground)]">
                      {t("commandCenter.mode.work", "Work")}
                    </span>
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="omnibar-search-header"
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: 10 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                  className="flex min-w-0 flex-1"
                >
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setFilter("all");
                      setPane("results");
                      setDetailResult(null);
                      setActiveResultId(null);
                    }}
                    type="search"
                    aria-label={t("omnibar.inputLabel", "Search Marinara")}
                    onKeyDown={onInputKeyDown}
                    placeholder={t(
                      "commandCenter.placeholder",
                      "Search Marinara commands, chats, resources, and guides",
                    )}
                    className="min-w-0 flex-1 bg-transparent text-base font-medium text-[var(--foreground)] outline-none placeholder:font-normal placeholder:text-[var(--muted-foreground)]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {query && pane !== "mari" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                  setActiveResultId(null);
                  setSessionValue("detailResultId", null);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                aria-label={t("commandCenter.clearSearch", "Clear search")}
                title={t("commandCenter.clearSearch", "Clear search")}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] sm:size-9"
              >
                <X size={16} />
              </button>
            ) : null}
            {pane !== "mari" && mariEnabled ? (
              <button
                type="button"
                onClick={() => openProfessorMari()}
                aria-label={t("commandCenter.openWork", "Open Work with Professor Mari")}
                title={t("commandCenter.openWork", "Open Work with Professor Mari")}
                data-component="GlobalOmnibar.ProfessorMariButton"
                className="group relative -mb-px h-14 w-11 shrink-0 self-end overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
              >
                <img
                  src={PROFESSOR_MARI_PEEK_URL}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute left-1/2 top-0 h-[6.5rem] w-auto max-w-none -translate-x-1/2 object-contain object-top transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
                />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close", "Close")}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] sm:size-9"
            >
              <X size={18} />
            </button>
          </div>
          {(query.trim() || pane === "browse") && pane !== "mari" ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: "easeOut" }}
              role="toolbar"
              aria-label={t("commandCenter.filters.label", "Result categories")}
              data-component="GlobalOmnibar.Filters"
              className="flex min-h-11 items-center gap-1 overflow-x-auto border-b border-[var(--border)] px-2 py-1.5 overscroll-x-contain sm:min-h-10"
            >
              {(pane === "browse" ? BROWSE_FILTERS : availableFilters).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={pane === "browse" ? browseFilter === item : filter === item}
                  onClick={() => setCategoryFilter(item)}
                  className={`min-h-8 shrink-0 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${(pane === "browse" ? browseFilter === item : filter === item) ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"}`}
                >
                  {filterLabels[item]}
                </button>
              ))}
            </motion.div>
          ) : null}
        </header>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {mariMounted ? (
          <motion.div
            key="omnibar-mari-pane"
            data-component="GlobalOmnibar.Mari"
            initial={pane === "mari" ? { opacity: 0, y: -14, scale: 0.985 } : false}
            animate={pane === "mari" ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -12, scale: 0.995 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 30, mass: 0.75 }}
            className={`min-h-0 overflow-hidden bg-[radial-gradient(circle_at_18%_14%,oklch(0.79_0.16_205/0.10),transparent_30%),radial-gradient(circle_at_82%_18%,oklch(0.73_0.21_345/0.12),transparent_32%),var(--background)] ${pane === "mari" ? "relative flex-1" : "pointer-events-none absolute inset-0"}`}
            aria-hidden={pane !== "mari"}
          >
            <Suspense
              fallback={
                <div className="flex min-h-24 items-center justify-center text-sm text-[var(--muted-foreground)]">
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  {t("omnibar.loading", "Loading results")}
                </div>
              }
            >
              <OmnibarProfessorMariChat
                pageActive
                embeddedTab
                omnibarMode
                launchHidden
                initialAskContext={mariContext}
                chatWindowOpen={mariChatOpen}
                onChatWindowOpenChange={(open) => {
                  setMariChatOpen(open);
                  if (!open) {
                    setPane(mariReturnPane);
                    const returnResultId = mariReturnResultIdRef.current;
                    if (returnResultId) setActiveResultId(returnResultId);
                    requestAnimationFrame(() => {
                      const resultId = mariReturnResultIdRef.current;
                      const row = resultId
                        ? listRef.current?.querySelector<HTMLElement>(`[data-result-id="${CSS.escape(resultId)}"]`)
                        : null;
                      (row?.querySelector<HTMLElement>("button") ?? inputRef.current)?.focus();
                    });
                  }
                }}
              />
            </Suspense>
          </motion.div>
        ) : null}
        {pane === "mari" ? null : pane !== "browse" && !(pane === "detail" && detailOrigin === "browse") ? (
          <div className="flex min-h-0 flex-1">
            <div
              ref={listRef}
              id="global-omnibar-results"
              aria-label={t("omnibar.results", "Search results")}
              data-component="GlobalOmnibar.Results"
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 ${pane === "detail" ? (detailOrigin === "browse" ? "hidden" : "max-xl:hidden") : ""}`}
            >
              {!query.trim() ? (
                <div className="border-b border-[var(--border)] px-3 pb-2.5 pt-2.5 motion-safe:animate-fade-in-up">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-bold leading-tight text-[var(--foreground)]">
                        {t("commandCenter.mode.find", "Find")}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] leading-snug text-[var(--muted-foreground)]">
                        {t(
                          "commandCenter.deck.subtitle",
                          "Find what you need, or continue the current work with Professor Mari.",
                        )}
                      </p>
                    </div>
                    {mariEnabled ? (
                      // Mari already lives in the header bar above — a curved arrow
                      // points up to her instead of showing her portrait twice.
                      <div
                        aria-hidden="true"
                        className="pointer-events-none -mt-1 mr-0.5 flex shrink-0 flex-col items-center gap-0.5 self-start text-[var(--primary)]/55"
                      >
                        <svg width="44" height="30" viewBox="0 0 44 30" fill="none" className="overflow-visible">
                          <path
                            d="M41 27 C 35 12, 20 5, 4 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeDasharray="0.5 4"
                          />
                          <path
                            d="M4 3 L 11 3.5 M4 3 L 7 9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="whitespace-nowrap text-[0.625rem] font-medium tracking-wide">
                          {t("commandCenter.deck.askMariHint", "Ask Mari")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  {allLocalResults.some((result) => result.id === "create-chat") ? (
                    <button
                      type="button"
                      onClick={() => runCommandById("create-chat")}
                      className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3 text-[0.8125rem] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      <MessageSquarePlus size={14} className="text-[var(--primary)]" aria-hidden="true" />
                      <span className="truncate">{t("commandCenter.quick.newChat", "New chat")}</span>
                    </button>
                  ) : null}
                  <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {BROWSE_FILTERS.filter((item) => browseAvailability[item] > 0).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setFilter(item);
                          setPane("browse");
                          setBrowseLimit(BROWSE_BATCH_SIZE);
                        }}
                        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-3 text-[0.8125rem] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        <LayoutGrid size={14} aria-hidden="true" />
                        {filterLabels[item]}
                        <span className="rounded-full bg-[var(--background)]/70 px-1.5 text-[0.625rem] text-[var(--muted-foreground)]">
                          {browseAvailability[item]}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={openBrowse}
                      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-[0.8125rem] font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      <Compass size={14} aria-hidden="true" />
                      {t("commandCenter.browse", "Browse")}
                    </button>
                  </div>
                </div>
              ) : null}
              {query.trim() && loading && results.length === 0 ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-[var(--muted-foreground)]">
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  {t("omnibar.loading", "Loading results")}
                </div>
              ) : null}
              {failed ? (
                <div role="status" className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {t("omnibar.error", "Some results could not be loaded")}
                </div>
              ) : null}
              {presentation.groups.map((group) => {
                const GroupIcon =
                  group.id === "professor-suggested"
                    ? Sparkles
                    : group.id === "current-work" || group.id === "context"
                      ? Compass
                      : group.id === "continue"
                        ? Sparkles
                        : group.id === "recent"
                          ? Clock3
                          : group.id === "quick-controls"
                            ? SlidersHorizontal
                            : group.id === "pinned"
                              ? Sparkles
                              : LayoutGrid;
                return (
                  <section key={group.id} aria-labelledby={`omnibar-group-${group.id}`}>
                    <div className="flex items-center gap-1.5 px-3 pb-1 pt-3">
                      <GroupIcon size={12} className="text-[var(--primary)]" aria-hidden="true" />
                      <h3
                        id={`omnibar-group-${group.id}`}
                        className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-foreground)]"
                      >
                        {groupLabels[group.id]}
                      </h3>
                      <span className="text-[0.625rem] text-[var(--muted-foreground)]/70">{group.results.length}</span>
                    </div>
                    <ul className="space-y-0.5 px-1">
                      {group.results.map((result, rowIndex) => {
                        const visual = resultVisual(result);
                        const selected = result.id === activeResult?.id;
                        const setupStatus =
                          result.command.availability?.status === "requires-capability"
                            ? t("commandCenter.setup", "Set up")
                            : result.command.availability?.status === "requires-admin"
                              ? t("commandCenter.adminRequired", "Administrator access required")
                              : undefined;
                        return (
                          <CommandCenterResultRow
                            key={result.id}
                            className="motion-safe:animate-omnibar-row-in"
                            style={{ animationDelay: `${Math.min(rowIndex, 8) * 22}ms` }}
                            dataResultId={result.id}
                            id={`omnibar-${result.id}`}
                            title={result.title}
                            metadata={resultMetadata(result, visual.label)}
                            tertiaryMetadata={
                              // A toggle/action control already shows the on/active state, so
                              // the status label ("Enabled"/"Active") next to it is redundant —
                              // keep only the informative metadata line in that case.
                              result.control?.type === "toggle"
                                ? result.preview?.metadataLine
                                : (result.preview?.status?.label ??
                                  result.preview?.badges?.[0] ??
                                  result.preview?.metadataLine)
                            }
                            description={result.description ?? result.preview?.description}
                            icon={resultIcon(result)}
                            selected={selected}
                            onSelect={() => selectResult(result)}
                            onMouseEnter={() => setActiveResultId(result.id)}
                            mediaSrc={result.preview?.media?.src}
                            mediaKind={result.preview?.media?.kind}
                            avatarCropStyle={result.preview?.media?.avatarCropStyle}
                            groupClassName={visual.groupClassName}
                            accent={result.preview?.accent}
                            setupStatus={setupStatus}
                            enterHint={result.control ? undefined : t("commandCenter.open", "Open")}
                            control={
                              result.control?.type === "choice" ? (
                                <CommandCenterSegmentedChoice
                                  label={result.control.label}
                                  value={String(result.control.value)}
                                  options={(result.control.options ?? []).map((option) => ({ ...option }))}
                                  onValueChange={(value) => result.control?.onChange(value)}
                                  variant="compact"
                                />
                              ) : result.category === "persona" || result.category === "preset" ? (
                                <CommandCenterActionValue
                                  label={
                                    result.category === "persona"
                                      ? t("commandCenter.actions.activatePersona", "Activate persona")
                                      : t("commandCenter.actions.setDefaultPreset", "Set default preset")
                                  }
                                  icon={result.category === "persona" ? Play : ArrowRight}
                                  value={
                                    result.control?.value === true
                                      ? t("commandCenter.values.active", "Active")
                                      : undefined
                                  }
                                  onClick={() => {
                                    if (result.control?.type === "toggle") result.control.onChange(true);
                                  }}
                                  disabled={result.control?.value === true || resultControlPending(result)}
                                  loading={resultControlPending(result)}
                                  variant="compact"
                                  tone="primary"
                                  className="justify-end"
                                />
                              ) : result.control?.type === "toggle" ? (
                                <CommandCenterToggle
                                  label={result.control.label}
                                  checked={Boolean(result.control.value)}
                                  stateLabel={
                                    result.control.value
                                      ? t("commandCenter.values.enabled", "Enabled")
                                      : t("commandCenter.values.disabled", "Disabled")
                                  }
                                  onCheckedChange={(value) => result.control?.onChange(value)}
                                  disabled={resultControlPending(result)}
                                  loading={resultControlPending(result)}
                                  variant="compact"
                                  className="justify-end"
                                />
                              ) : undefined
                            }
                          />
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
              {!loading && query.trim() && results.length === 0 ? (
                <div className="flex min-h-32 flex-col items-center justify-center px-4 text-center">
                  <Search size={20} className="mb-2 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {t("commandCenter.noResults", "No matching commands")}
                  </p>
                </div>
              ) : null}
            </div>
            {pane === "detail" && previewResult ? (
              <aside
                data-component="GlobalOmnibar.Detail"
                className="min-h-0 w-full overflow-y-auto overscroll-contain border-[var(--border)] pb-[env(safe-area-inset-bottom)] xl:hidden"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={previewResult.id}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: "easeOut" }}
                  >
                    {renderResultPreview(true)}
                  </motion.div>
                </AnimatePresence>
              </aside>
            ) : null}
          </div>
        ) : (
          <div
            data-component="GlobalOmnibar.Browse"
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-safe:animate-fade-in-up ${pane === "detail" ? "max-xl:hidden" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">{filterLabels[browseFilter]}</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("commandCenter.browseCount", "{{count}} items", {
                    count: browseResults.length,
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!mariEnabled ? null : browseCompareMode ? (
                  <>
                    <span aria-live="polite" className="text-xs text-[var(--muted-foreground)]">
                      {t("commandCenter.compareSelectionCount", "{{count}}/5 selected", {
                        count: browseCompareIds.length,
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBrowseCompareMode(false);
                        setBrowseCompareIds([]);
                      }}
                      className="min-h-9 rounded-md px-2.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={compareWithProfessorMari}
                      disabled={browseCompareIds.length < 2}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Sparkles size={14} aria-hidden="true" />
                      {t("commandCenter.compareWithMari", "Compare with Mari")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBrowseCompareMode(true)}
                    className="min-h-9 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]"
                  >
                    {t("commandCenter.selectToCompare", "Select to compare")}
                  </button>
                )}
              </div>
            </div>
            <CommandCenterBrowseGrid
              ariaLabel={filterLabels[browseFilter]}
              selectedId={browseSelectedId}
              selectedIds={new Set(browseCompareIds)}
              selectionMode={browseCompareMode && mariEnabled}
              onSelectedIdChange={setBrowseSelectedId}
              results={visibleBrowseResults.map((result) => {
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
                return {
                  id: result.id,
                  title: result.title,
                  metadata: resultMetadata(command, visual.label),
                  description: result.description ?? result.preview?.description,
                  status: result.preview?.status?.label,
                  tags: result.preview?.tags ?? result.preview?.badges,
                  secondaryState: result.preview?.metadataLine ?? result.preview?.supportingInfo,
                  icon: resultIcon(command),
                  groupVisual: visual.groupClassName,
                  media: result.preview?.media
                    ? {
                        src: result.preview.media.src,
                        kind: result.preview.media.kind,
                        avatarCropStyle: result.preview.media.avatarCropStyle,
                        accent: result.preview.accent,
                      }
                    : undefined,
                  onSelect: () => {
                    setBrowseSelectedId(result.id);
                    if (browseCompareMode) toggleBrowseCompareResult(result.id);
                    else showResultDetail(command, "browse");
                  },
                };
              })}
              emptyTitle={t("commandCenter.browseEmpty", "No items in this category")}
              hasMore={visibleBrowseResults.length < browseResults.length}
              loadMoreLabel={t("commandCenter.loadMore", "Load more")}
              onLoadMore={() => setBrowseLimit(browseLimit + BROWSE_BATCH_SIZE)}
            />
          </div>
        )}

        {pane === "detail" && detailOrigin === "browse" && previewResult ? (
          <aside
            data-component="GlobalOmnibar.Detail"
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain border-[var(--border)] pb-[env(safe-area-inset-bottom)] xl:hidden"
          >
            {renderResultPreview(true)}
          </aside>
        ) : null}

        {pane !== "mari" ? (
          <footer className="hidden min-h-9 shrink-0 items-center justify-between border-t border-[var(--border)] px-3 text-[0.6875rem] text-[var(--muted-foreground)] sm:flex">
            <span>{t("commandCenter.keyboard.move", "Arrow keys move")}</span>
            <span>{t("commandCenter.keyboard.escape", "Esc back")}</span>
          </footer>
        ) : null}
      </div>

      {pane === "detail" && previewResult ? (
        <motion.aside
          data-component="GlobalOmnibar.ExternalDetail"
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          className="fixed left-[calc(50%+23rem)] top-[10vh] hidden h-[min(44rem,80dvh)] w-[22rem] overflow-y-auto overscroll-contain rounded-2xl bg-[var(--card)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-1 ring-[var(--border)]/60 xl:block"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={previewResult.id}
              initial={reduceMotion ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.14, ease: "easeOut" }}
            >
              {renderResultPreview(true)}
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      ) : null}
    </motion.div>,
    document.body,
  );
}
