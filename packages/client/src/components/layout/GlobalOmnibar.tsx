import {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
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
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Theater,
  UserMinus,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAgentConfigs } from "../../hooks/use-agents";
import { useActivatePersona, useCharacters, usePersonas } from "../../hooks/use-characters";
import {
  useChats,
  useChatMessageCount,
  useChatMessagePeek,
  useChatMessageSearchSource,
  useProfessorMariChats,
  useCreateChat,
  useUpdateChat,
  useUpdateChatMetadata,
} from "../../hooks/use-chats";
import { useConnections } from "../../hooks/use-connections";
import { useDocsCommandSearchProvider } from "../../hooks/use-docs-command-search";
import { HOME_FAQ_ITEMS, getFaqSearchText } from "../chat/HomeFaq";
import { useCreateLorebook, useLorebooks, useLorebookEntries, useUpdateLorebook } from "../../hooks/use-lorebooks";
import { usePresets, useSetDefaultPreset } from "../../hooks/use-presets";
import { useProfessorMariWorkspaceStatus } from "../../hooks/use-professor-mari-workspace-status";
import { getCharacterDisplayIdentity, parseCharacterDisplayData } from "../../lib/character-display";
import { completeInline } from "../../lib/inline-completion";
import { parseChatMetadata } from "../../lib/chat-display";
import { isLanguageGenerationConnection } from "../../lib/connection-filters";
import { resolveChatResourceDropAction } from "../../lib/chat-resource-drop-capabilities";
import {
  deriveActiveLorebookViews,
  getChatActiveLorebookIds,
  getChatExcludedLorebookIds,
} from "../../lib/chat-lorebooks";
import { getChatCharacterIds } from "../../lib/chat-macros";
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
  isDirectActiveChatAction,
  parseOmnibarIntent,
  searchOmnibar,
  type OmnibarCategory,
  type OmnibarResult,
  type OmnibarSurface,
} from "../../lib/omnibar-search";
import { getOmnibarSettingsDestinations } from "../../lib/omnibar-settings";
import { reconcileActiveResultId, resolveOmnibarRowState } from "../../lib/omnibar-row-state";
import {
  activatePersonalExtensionCommand,
  usePersonalExtensionCommands,
} from "../../lib/personal-extension-contributions";
import { resolvePresetArtwork } from "../../lib/preset-artwork";
import { omnibarCompletionActions, type OmnibarCompletionAction } from "../../lib/omnibar-completion-actions";
import { parseCreationSeed, splitProposalWork, type CreationProposal } from "../../lib/omnibar-creation-proposal";
import { parseChatExtraction } from "../../lib/omnibar-chat-extraction";
import { parseGameCommand } from "../../lib/omnibar-game-commands";
import {
  buildProfessorMariCommandCenterContext,
  inferProfessorMariCommandCenterCapability,
} from "../../lib/professor-mari-command-center-context";
import type { ProfessorMariNavigationTarget } from "../../lib/professor-mari-navigation";
import { executeStateNavigation } from "../../lib/state-navigation";
import { getAvatarCropStyle } from "../../lib/utils";
import { useLocalizedUiText } from "../../localization/use-localized-ui-text";
import { useChatStore } from "../../stores/chat.store";
import { isMessageHiddenFromUser } from "../../lib/chat-message-visibility";
import { normalizeTextForMatch } from "@marinara-engine/shared";
import { useUIStore } from "../../stores/ui.store";
import { CommandCenterBrowseGrid } from "../command-center/CommandCenterBrowseGrid";
import { CommandCenterActionValue } from "../command-center/CommandCenterActionValue";
import { InlineGhostText } from "../ui/InlineGhostText";
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

const GAME_TOPIC_LABELS = {
  party: "Change the party with Mari",
  quests: "Review quests with Mari",
  scene: "Change the scene with Mari",
  encounter: "Continue the encounter with Mari",
} as const;

const EXTRACTION_LABELS = {
  lorebook: "Create lorebook from {{chat}}",
  characters: "Extract characters from {{chat}}",
  locations: "Extract locations from {{chat}}",
  campaign: "Create campaign from {{chat}}",
} as const;

const OmnibarProfessorMariChat = lazy(() =>
  import("../chat/HomeProfessorMariChat").then((module) => ({ default: module.HomeProfessorMariChat })),
);

const PROFESSOR_MARI_DRAFT_KEY = "__home_professor_mari__";
const PROFESSOR_MARI_PEEK_URL = "/sprites/mari/generated/professor-mari-assistant-idle.png";
/** Categories whose result rows open an editor rather than the thing itself. */
const EDITOR_CATEGORIES = new Set<OmnibarCategory>([
  "character",
  "persona",
  "lorebook",
  "preset",
  "connection",
  "agent",
]);

/** Below this a message search matches most of the transcript. */
const MIN_MESSAGE_SEARCH_LENGTH = 3;
const MAX_MESSAGE_SEARCH_RESULTS = 6;

/** A one-line excerpt centred on the match, so the row shows why it matched. */
function getMessageSearchSnippet(content: string, query: string): string {
  const text = content.replace(/\s+/gu, " ").trim();
  if (text.length <= 120) return text;
  const matchIndex = normalizeTextForMatch(text).indexOf(normalizeTextForMatch(query));
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, start + 120);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

/**
 * The context group answers "what am I on?", not "what is in this chat?" — past
 * this many rows it buries recents and create actions.
 */
const CHAT_CONTEXT_MAX_RESULTS = 8;
/** A resumable creation session goes stale after a day. */
const CREATION_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const BROWSE_BATCH_SIZE = 48;
/**
 * Idle suggestions per surface: what you most likely reach for from where you
 * already are. Missing ids are skipped, so this stays a hint list, not a
 * contract with the command registry.
 */
const SURFACE_IDLE_COMMAND_IDS: Record<OmnibarSurface, readonly string[]> = {
  home: ["chats", "character-library", "create-character"],
  chat: [
    "control:chat-connection",
    "control:chat-preset",
    "control:chat-persona",
    "control:chat-agents",
    "card-browser",
    "create-lorebook",
  ],
  editor: ["documentation", "character-library", "import-data"],
  settings: ["integrations", "diagnostics", "backups", "updates"],
  library: ["create-character", "import-sillytavern", "card-browser"],
  game: ["game-assets", "help"],
};

// Leading resource-kind words to strip from a "create <kind> <name>" query so the
// create modal opens with just the typed name pre-filled.
const CREATE_MODAL_KIND_WORDS: Record<string, readonly string[]> = {
  "create-character": ["character", "card"],
  "create-persona": ["persona", "profile"],
  "create-lorebook": ["lorebook", "world book", "world info", "worldbook"],
  "create-preset": ["preset", "prompt preset"],
};

function createModalPrefillName(modal: string, query: string): string | undefined {
  const words = CREATE_MODAL_KIND_WORDS[modal];
  if (!words) return undefined;
  const intent = parseOmnibarIntent(query);
  if (intent?.kind !== "create") return undefined;
  let name = intent.targetQuery.trim();
  for (const word of words) {
    const stripped = name.replace(new RegExp(`^${word}\\b\\s*`, "i"), "").trim();
    if (stripped !== name) {
      name = stripped;
      break;
    }
  }
  return name || undefined;
}

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
    const extraFacts: CommandCenterPreviewFact[] = list.length
      ? [{ label: t("commandCenter.preview.entryCount", "Entries"), value: list.length }]
      : [];
    // Entries used to be flattened into two comma-joined strings, which read as
    // a wall of text. One card per entry shows the shape of the book instead.
    const detail = list.length ? (
      <div className="space-y-1.5">
        {list.slice(0, 5).map((entry, index) => {
          const keys = (entry.keys ?? []).filter(Boolean).slice(0, 4);
          return (
            <div
              key={entry.id ?? `${entry.name ?? "entry"}-${index}`}
              className="rounded-lg bg-[color-mix(in_srgb,var(--foreground)_4%,var(--card))] px-2.5 py-1.5 ring-1 ring-inset ring-[var(--border)]/50"
            >
              <div className="truncate text-xs font-semibold text-[var(--foreground)]">
                {entry.name?.trim() || t("commandCenter.preview.untitledEntry", "Untitled entry")}
              </div>
              {keys.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {keys.map((key, keyIndex) => (
                    <span
                      key={`${key}-${keyIndex}`}
                      className="rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))] px-1.5 py-0.5 text-[0.625rem] font-medium leading-4 text-[color-mix(in_srgb,var(--primary)_70%,var(--foreground))] ring-1 ring-inset ring-[color-mix(in_srgb,var(--primary)_28%,transparent)]"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              ) : null}
              {entry.content ? (
                <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[var(--muted-foreground)]">
                  {entry.content}
                </p>
              ) : null}
            </div>
          );
        })}
        {list.length > 5 ? (
          <p className="px-0.5 text-[0.6875rem] text-[var(--muted-foreground)]">
            {t("commandCenter.preview.moreEntries", "+{{count}} more", { count: list.length - 5 })}
          </p>
        ) : null}
      </div>
    ) : null;
    return { extraFacts, detail, detailLoading: entries.isLoading };
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
  const initialQueryRef = useRef(session.query);
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
  const [mariPendingReviewRequest, setMariPendingReviewRequest] = useState(0);
  // Set when a Mari task finishes while the Work pane is open, so the omnibar can
  // offer the bounded completion actions for that task instead of a dead end.
  const [mariTaskFinished, setMariTaskFinished] = useState(false);
  // When set, the Work pane shows the creation proposal for review instead of
  // the Mari transcript. Nothing is created until the user accepts.
  const [proposalDraft, setProposalDraft] = useState<CreationProposal | null>(null);
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
  const updateChat = useUpdateChat();
  const updateChatMetadata = useUpdateChatMetadata();
  const createChat = useCreateChat();
  const createLorebook = useCreateLorebook();
  const extensionCommands = usePersonalExtensionCommands();
  const docs = useDocsCommandSearchProvider(query, { enabled: true });
  const theme = useUIStore((state) => state.theme);
  const reduceMotion = useReducedMotion();
  const reduceAmbientEffects = useUIStore((state) => state.reduceAmbientEffects);
  const musicPlayerEnabled = useUIStore((state) => state.musicPlayerEnabled);
  const mariEnabled = useUIStore((state) => state.commandCenterMariEnabled);
  const mariWorkspaceStatus = useProfessorMariWorkspaceStatus();
  const speechToTextEnabled = useUIStore((state) => state.speechToTextEnabled);
  const notificationSoundsOnlyWhenUnfocused = useUIStore((state) => state.notificationSoundsOnlyWhenUnfocused);
  const showTimestamps = useUIStore((state) => state.showTimestamps);
  const showModelName = useUIStore((state) => state.showModelName);
  const showTokenUsage = useUIStore((state) => state.showTokenUsage);
  const userStatus = useUIStore((state) => state.userStatus);
  const activeChat = useChatStore((state) => state.activeChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const openCharacterId = useUIStore((state) => state.characterDetailId);
  const activeEditorField = useUIStore((state) => state.activeEditorField);
  const lastAppError = useUIStore((state) => state.lastAppError);
  const creationSession = useUIStore((state) => state.creationSession);
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
      messages: t("commandCenter.groups.messages", "In this chat"),
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
  // Reverse lookup so a creation seed can resolve the names the user typed.
  const characterIdByName = useMemo(
    () => new Map([...characterNameById].map(([id, name]) => [String(name).toLowerCase(), id])),
    [characterNameById],
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

  // Chat state as inline controls: the changes a user makes most often are to
  // the chat they are already in — model, preset, persona, agents. These edit
  // the chat in the row, so nothing navigates away from the scene.
  // useMutation returns a fresh object every render, so the memo depends on the
  // stable mutateAsync functions. Depending on the mutation objects would give
  // this list a new identity each render and churn every list derived from it.
  const patchChat = updateChat.mutateAsync;
  const patchChatMetadata = updateChatMetadata.mutateAsync;
  const chatControls = useMemo<OmnibarResult[]>(() => {
    if (!activeChat || activeChat.id !== activeChatId) return [];
    const chatId = activeChat.id;
    // ponytail: the segmented control renders every option as a pill, so a long
    // list would overflow the row. Cap it, and keep the current value visible.
    // Swap in a searchable picker if users hit the cap often.
    const capped = <T extends { id: string }>(items: readonly T[], activeId: string | null | undefined) => {
      const head = items.slice(0, 6);
      const active = activeId ? items.find((item) => item.id === activeId) : undefined;
      return active && !head.includes(active) ? [...head, active] : head;
    };
    const noneOption = { value: "", label: t("commandCenter.values.none", "None") };
    const chatMetadata = parseChatMetadata(activeChat.metadata);
    const languageConnections = data.connections.filter(isLanguageGenerationConnection);
    const resourcesOfKind = (kind: OmnibarCategory) =>
      data.resources.filter((resource) => resource.kind === kind).map(({ id, name }) => ({ id, name }));
    const chatPresets = resourcesOfKind("preset");
    const chatPersonas = resourcesOfKind("persona");
    const rows: OmnibarResult[] = [];
    if (languageConnections.length > 1) {
      rows.push({
        id: "control:chat-connection",
        title: t("commandCenter.controls.chatModel", "Model for this chat"),
        category: "connection",
        score: 190,
        aliases: ["model", "connection", "switch model", "provider"],
        group: "current-work",
        icon: "connection",
        control: {
          type: "choice",
          label: t("commandCenter.controls.chatModel", "Model for this chat"),
          value: activeChat.connectionId ?? "",
          options: capped(languageConnections, activeChat.connectionId).map((connection) => ({
            value: connection.id,
            label: connection.name,
          })),
          onChange: (value) => void patchChat({ id: chatId, connectionId: String(value) || null }),
        },
      });
    }
    if (chatPresets.length > 0) {
      rows.push({
        id: "control:chat-preset",
        title: t("commandCenter.controls.chatPreset", "Preset for this chat"),
        category: "preset",
        score: 189,
        aliases: ["preset", "prompt preset", "switch preset"],
        group: "current-work",
        icon: "preset",
        control: {
          type: "choice",
          label: t("commandCenter.controls.chatPreset", "Preset for this chat"),
          value: activeChat.promptPresetId ?? "",
          options: [
            noneOption,
            ...capped(chatPresets, activeChat.promptPresetId).map((preset) => ({
              value: preset.id,
              label: preset.name,
            })),
          ],
          onChange: (value) => void patchChat({ id: chatId, promptPresetId: String(value) || null }),
        },
      });
    }
    if (chatPersonas.length > 0) {
      rows.push({
        id: "control:chat-persona",
        title: t("commandCenter.controls.chatPersona", "Persona for this chat"),
        category: "persona",
        score: 188,
        aliases: ["persona", "swap persona", "who am i"],
        group: "current-work",
        icon: "persona",
        control: {
          type: "choice",
          label: t("commandCenter.controls.chatPersona", "Persona for this chat"),
          value: activeChat.personaId ?? "",
          options: [
            noneOption,
            ...capped(chatPersonas, activeChat.personaId).map((persona) => ({
              value: persona.id,
              label: persona.name,
            })),
          ],
          onChange: (value) => void patchChat({ id: chatId, personaId: String(value) || null }),
        },
      });
    }
    rows.push({
      id: "control:chat-agents",
      title: t("commandCenter.controls.chatAgents", "Agents in this chat"),
      category: "agent",
      score: 187,
      aliases: ["agents", "tools", "enable agents"],
      group: "current-work",
      icon: "agent",
      control: {
        type: "toggle",
        label: t("commandCenter.controls.chatAgents", "Agents in this chat"),
        value: chatMetadata.enableAgents === true,
        onChange: (value) => void patchChatMetadata({ id: chatId, enableAgents: value === true }),
      },
    });
    return rows;
  }, [activeChat, activeChatId, data.connections, data.resources, patchChat, patchChatMetadata, t]);

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
    () => [...controls, ...chatControls, ...searchableCommandResults, ...searchableEntityResults],
    [chatControls, controls, searchableCommandResults, searchableEntityResults],
  );
  const omnibarContext = useMemo(() => {
    const chatMetadata = activeChat ? parseChatMetadata(activeChat.metadata) : null;
    const activeLorebookIds = activeChat
      ? deriveActiveLorebookViews({
          activeLorebookIds: getChatActiveLorebookIds(activeChat),
          excludedLorebookIds: getChatExcludedLorebookIds(activeChat),
          dropExcluded: true,
          chat: activeChat,
          lorebooks: lorebooks.data ?? [],
        }).map((lorebook) => lorebook.id)
      : [];
    const activeAgentIds = Array.isArray(chatMetadata?.activeAgentIds)
      ? chatMetadata.activeAgentIds.filter((id): id is string => typeof id === "string")
      : [];
    const activeAgentResultIds = activeAgentIds.map(
      (id) => agents.data?.find((agent) => agent.id === id || agent.type === id)?.type ?? id,
    );
    const activeChatResultIds = [
      ...getOmnibarActiveChatContextResultIds(
        activeChatId,
        activeChat
          ? {
              ...activeChat,
              characterIds: getChatCharacterIds(activeChat),
              lorebookIds: activeLorebookIds,
              enableAgents: chatMetadata?.enableAgents === true,
              activeAgentIds: activeAgentResultIds,
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
    const baseResults = searchOmnibar(query, {
      ...data,
      controls: [...controls, ...chatControls],
      context: omnibarContext,
      contextLabels,
    }).filter((result) => mariEnabled || result.id !== "ask-professor-mari");
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
  }, [
    chatControls,
    contextLabels,
    controls,
    data,
    deferredQuery,
    docs.results,
    localize,
    mariEnabled,
    omnibarContext,
    t,
  ]);
  // Professor Mari's conversations live behind an internal marker, so they are
  // missing from the normal chat list. Searchable here by their auto-title.
  const [mariOpenChatId, setMariOpenChatId] = useState<string | null>(null);
  const mariChats = useProfessorMariChats(mariEnabled && deferredQuery.trim().length > 0);
  const mariChatResults = useMemo<OmnibarResult[]>(() => {
    const normalized = normalizeTextForMatch(deferredQuery.trim());
    if (!normalized) return [];
    return (mariChats.data ?? [])
      .filter((chat) => normalizeTextForMatch(chat.name ?? "").includes(normalized))
      .slice(0, 5)
      .map((chat) => ({
        id: `mari-chat:${chat.id}`,
        title: chat.name || t("omnibar.categories.professor", "Professor Mari"),
        description: t("commandCenter.mariChat", "Professor Mari conversation"),
        category: "chat" as const,
        group: "chats" as const,
        score: 120,
        kind: "action" as const,
        icon: "professor" as const,
      }));
  }, [deferredQuery, mariChats.data, t]);

  // Chat search: the engine only stores messages per chat, so this searches the
  // chat you are in rather than pretending to search all of them. The message
  // list is shared with the in-chat search panel's cache.
  const messageSearchQuery = deferredQuery.trim();
  const messageSearch = useChatMessageSearchSource(
    activeChatId ?? null,
    !!activeChatId && messageSearchQuery.length >= MIN_MESSAGE_SEARCH_LENGTH,
  );
  const messageResults = useMemo<OmnibarResult[]>(() => {
    const normalized = normalizeTextForMatch(messageSearchQuery);
    if (!activeChatId || normalized.length < MIN_MESSAGE_SEARCH_LENGTH) return [];
    const out: OmnibarResult[] = [];
    (messageSearch.data ?? []).forEach((message, index) => {
      if (out.length >= MAX_MESSAGE_SEARCH_RESULTS) return;
      if (isMessageHiddenFromUser(message)) return;
      if (!normalizeTextForMatch(message.content).includes(normalized)) return;
      out.push({
        id: `message:${activeChatId}:${index + 1}`,
        title: getMessageSearchSnippet(message.content, messageSearchQuery),
        description: t("commandCenter.messages.position", "Message {{number}}", { number: index + 1 }),
        category: "chat",
        group: "messages",
        score: 300 - out.length,
        kind: "action",
        icon: "chats",
      });
    });
    return out;
  }, [activeChatId, messageSearch.data, messageSearchQuery, t]);
  const idleResults = useMemo(() => {
    const byId = new Map(allLocalResults.map((result) => [result.id, result]));
    const selected: OmnibarResult[] = [];
    const add = (id: string) => {
      const result = byId.get(id);
      if (result && !selected.some((item) => item.id === id)) selected.push(result);
    };
    // Unfinished setup beats everything else: the feature you cannot use yet is
    // the most likely reason the omnibar is open at all. Capped so a fresh
    // install does not bury recents under every un-configured integration.
    omnibarContext.setupResultIds.slice(0, 2).forEach(add);
    ranking.recent.forEach((entry) => add(entry.id));
    SURFACE_IDLE_COMMAND_IDS[omnibarContext.surface].forEach(add);
    ["control:theme", "control:presence", "create-character", "create-persona", "documentation"].forEach(add);
    for (const result of searchableCommandResults) {
      if (selected.length >= 4) break;
      add(result.id);
    }
    return selected.slice(0, 12);
  }, [
    allLocalResults,
    omnibarContext.setupResultIds,
    omnibarContext.surface,
    ranking.recent,
    searchableCommandResults,
  ]);
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
    const canonicalById = new Map(allLocalResults.map((result) => [result.id, result]));
    const pushCanonical = (id: string, fallback: OmnibarResult) => {
      const result = canonicalById.get(id);
      push({ ...fallback, ...(result ?? {}), title: fallback.title, group: "current-work", score: 0 });
    };

    const isActiveChat = activeChat?.id === activeChatId;
    const isActiveChatSurface = omnibarContext.surface === "chat" && isActiveChat;
    // A visible failure is the most useful next step, so it leads the group. The
    // id must stay the real connection id so the existing connection branch in
    // choose() opens the right editor (and still honours the dirty-editor guard).
    if (lastAppError?.retry) {
      pushCanonical(`connection:${lastAppError.retry.id}`, {
        id: `connection:${lastAppError.retry.id}`,
        title: lastAppError.action
          ? t("commandCenter.context.fixFailed", "Fix: {{action}} failed", { action: lastAppError.action })
          : t("commandCenter.context.fixError", "Fix the last error"),
        description: lastAppError.message,
        category: "connection",
        score: 0,
        icon: "connection",
      });
    }

    // A creation session is persisted, so without an age limit "Continue
    // building X" would lead the idle list forever.
    if (creationSession && Date.now() - creationSession.createdAt < CREATION_SESSION_MAX_AGE_MS) {
      push({
        id: "resume-creation-session",
        title: t("commandCenter.proposal.resume", "Continue building {{title}}", { title: creationSession.title }),
        description: creationSession.seed,
        category: "professor",
        score: 0,
        group: "current-work",
        icon: "professor",
      });
    }

    if (!isActiveChatSurface) {
      if (openCharacterId) {
        const name = characterNameById.get(openCharacterId);
        if (name)
          pushCanonical(`character:${openCharacterId}`, {
            id: `character:${openCharacterId}`,
            title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
            category: "character",
            target: { kind: "resource", resource: "character", id: openCharacterId },
            score: 0,
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
        pushCanonical(`${kind}:${id}`, {
          id: `${kind}:${id}`,
          title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
          category: kind,
          target: { kind: "resource", resource: kind, id },
          score: 0,
          icon,
        });
      }
      if (openConnectionId) {
        const name = connectionById.get(openConnectionId)?.name;
        if (name)
          pushCanonical(`connection:${openConnectionId}`, {
            id: `connection:${openConnectionId}`,
            title: t("commandCenter.context.editing", "Editing {{name}}", { name }),
            category: "connection",
            score: 0,
            icon: "connection",
          });
      }
    }
    if (isActiveChat && activeChat) {
      pushCanonical(`chat:${activeChat.id}`, {
        id: `chat:${activeChat.id}`,
        title: t("commandCenter.context.currentChat", "Current chat: {{name}}", { name: activeChat.name }),
        category: "chat",
        target: { kind: "chat", chatId: activeChat.id },
        score: 0,
        icon: "chats",
      });
      for (const characterId of getChatCharacterIds(activeChat)) {
        const name = characterNameById.get(characterId);
        if (!name) continue;
        pushCanonical(`character:${characterId}`, {
          id: `character:${characterId}`,
          title: name,
          category: "character",
          target: { kind: "resource", resource: "character", id: characterId },
          score: 0,
          icon: "character",
        });
      }
      if (activeChat.personaId) {
        const name = nameOf(personaById, activeChat.personaId);
        if (name)
          pushCanonical(`persona:${activeChat.personaId}`, {
            id: `persona:${activeChat.personaId}`,
            title: name,
            category: "persona",
            target: { kind: "resource", resource: "persona", id: activeChat.personaId },
            score: 0,
            icon: "persona",
          });
      }
      if (activeChat.promptPresetId) {
        const name = listName(presets.data, activeChat.promptPresetId);
        if (name)
          pushCanonical(`preset:${activeChat.promptPresetId}`, {
            id: `preset:${activeChat.promptPresetId}`,
            title: name,
            category: "preset",
            target: { kind: "resource", resource: "preset", id: activeChat.promptPresetId },
            score: 0,
            icon: "preset",
          });
      }
      if (activeChat.connectionId) {
        const name = connectionById.get(activeChat.connectionId)?.name;
        if (name)
          pushCanonical(`connection:${activeChat.connectionId}`, {
            id: `connection:${activeChat.connectionId}`,
            title: name,
            category: "connection",
            score: 0,
            icon: "connection",
          });
      }
      const activeLorebooks = deriveActiveLorebookViews({
        activeLorebookIds: getChatActiveLorebookIds(activeChat),
        excludedLorebookIds: getChatExcludedLorebookIds(activeChat),
        dropExcluded: true,
        chat: activeChat,
        lorebooks: lorebooks.data ?? [],
      });
      for (const lorebook of activeLorebooks) {
        pushCanonical(`lorebook:${lorebook.id}`, {
          id: `lorebook:${lorebook.id}`,
          title: lorebook.name,
          category: "lorebook",
          target: { kind: "resource", resource: "lorebook", id: lorebook.id },
          score: 0,
          icon: "lorebook",
        });
      }
      const chatMetadata = parseChatMetadata(activeChat.metadata);
      if (chatMetadata.enableAgents === true) {
        const activeAgentIds = Array.isArray(chatMetadata.activeAgentIds)
          ? chatMetadata.activeAgentIds.filter((id): id is string => typeof id === "string")
          : [];
        for (const agentId of activeAgentIds) {
          const agent = agents.data?.find((item) => item.id === agentId || item.type === agentId);
          if (!agent) continue;
          pushCanonical(`agent:${agent.type}`, {
            id: `agent:${agent.type}`,
            title: agent.name,
            category: "agent",
            target: { kind: "resource", resource: "agent", id: agent.type },
            score: 0,
            icon: "agent",
          });
        }
      }
    }
    return out.slice(0, CHAT_CONTEXT_MAX_RESULTS);
  }, [
    activeChat,
    activeChatId,
    allLocalResults,
    agents.data,
    characterNameById,
    connectionById,
    creationSession,
    lastAppError,
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
    omnibarContext.surface,
    t,
  ]);
  const creationProposal = useMemo(() => parseCreationSeed(deferredQuery), [deferredQuery]);
  const proposalResult = useMemo<OmnibarResult | null>(() => {
    if (!creationProposal) return null;
    const created = creationProposal.items.filter((item) => item.status === "missing").length;
    return {
      id: "creation-proposal",
      title: t("commandCenter.proposal.title", "Set up {{title}}", { title: creationProposal.title }),
      description: t(
        "commandCenter.proposal.description",
        "Creates {{count}} things. Review before anything is made.",
        {
          count: created,
        },
      ),
      category: "professor",
      score: 400,
      kind: "action",
      icon: "professor",
    };
  }, [creationProposal, t]);
  const chatExtraction = useMemo(
    () => (activeChat ? parseChatExtraction(deferredQuery) : null),
    [activeChat, deferredQuery],
  );
  const extractionResult = useMemo<OmnibarResult | null>(() => {
    if (!chatExtraction || !activeChat) return null;
    const label = EXTRACTION_LABELS[chatExtraction.kind];
    return {
      id: "chat-extraction",
      title: t(`commandCenter.extract.${chatExtraction.kind}`, label, { chat: activeChat.name }),
      description: t("commandCenter.extract.description", "From {{chat}}. Mari proposes the content for review.", {
        chat: activeChat.name,
      }),
      category: "professor",
      score: 400,
      kind: "action",
      icon: "professor",
    };
  }, [activeChat, chatExtraction, t]);
  const gameCommand = useMemo(
    () => (activeChat?.mode === "game" ? parseGameCommand(deferredQuery) : null),
    [activeChat?.mode, deferredQuery],
  );
  const gameResult = useMemo<OmnibarResult | null>(() => {
    if (!gameCommand) return null;
    return {
      id: "game-command",
      title:
        gameCommand.kind === "roll"
          ? t("commandCenter.game.roll", "Roll {{notation}}", { notation: gameCommand.notation })
          : t(`commandCenter.game.${gameCommand.topic}`, GAME_TOPIC_LABELS[gameCommand.topic]),
      description:
        gameCommand.kind === "roll"
          ? t("commandCenter.game.rollDescription", "Rolls in this game now.")
          : t("commandCenter.game.assistDescription", "Continues with Mari using the current game state."),
      category: gameCommand.kind === "roll" ? "chat" : "professor",
      score: 420,
      kind: "action",
      icon: gameCommand.kind === "roll" ? "command" : "professor",
    };
  }, [gameCommand, t]);
  const continueResult = useMemo<OmnibarResult | null>(() => {
    if (!mariEnabled) return null;
    const status = mariWorkspaceStatus.data;
    const hasPendingApprovals = (status?.pendingApprovals.length ?? 0) > 0;
    if (!hasPendingApprovals && !status?.active) return null;
    const title = status?.active
      ? t("commandCenter.continueMariActive", "Mari is working")
      : hasPendingApprovals
        ? t("commandCenter.continueMariReview", "Review Mari's pending work")
        : t("commandCenter.continueMari", "Continue with Professor Mari");
    const description = status?.active
      ? t("commandCenter.continueMariActiveDescription", "Return to the active Mari workspace.")
      : hasPendingApprovals
        ? t("commandCenter.continueMariReviewDescription", "Mari is waiting for your review.")
        : t("commandCenter.continueMariDescription", "Open Mari with the current work attached.");
    return {
      id: "ask-professor-mari",
      title,
      category: "professor",
      description,
      score: 140,
      group: "continue",
      kind: "action",
      icon: "professor",
    };
  }, [mariEnabled, mariWorkspaceStatus.data, t]);
  const rawResults = useMemo(
    () =>
      deferredQuery.trim()
        ? [
            ...(gameResult ? [gameResult] : []),
            ...(proposalResult ? [proposalResult] : []),
            ...(extractionResult ? [extractionResult] : []),
            ...messageResults,
            ...mariChatResults,
            ...searchResults,
          ]
        : [...contextResults, ...(continueResult ? [continueResult] : []), ...idleResults],
    [
      contextResults,
      continueResult,
      deferredQuery,
      extractionResult,
      gameResult,
      idleResults,
      mariChatResults,
      messageResults,
      proposalResult,
      searchResults,
    ],
  );
  const rankedResults = useMemo<RankedOmnibarResult[]>(() => {
    const sourceById = new Map<string, OmnibarResult>();
    for (const result of rawResults) {
      if (!sourceById.has(result.id)) sourceById.set(result.id, result);
    }
    const uniqueRawResults = [...sourceById.values()];
    const searchRanking = deferredQuery.trim() ? { ...ranking, pinnedIds: [] } : ranking;
    return rankCommandResults(
      uniqueRawResults.map((result) => ({
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
  // Ghost text: continue the query with the best-ranked result title. Uses the
  // ranked list already on screen, so the guess never disagrees with row 1.
  const inlineSuffix = useMemo(
    () =>
      pane === "mari"
        ? ""
        : completeInline(
            query,
            results.flatMap((result) => (result.id === "ask-professor-mari" ? [] : [result.title])),
          ),
    [pane, query, results],
  );
  const resultIdsKey = results.map((result) => result.id).join("\u0000");
  const reconciledResultIdsKeyRef = useRef<string | null>(null);
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
    const resultOrderChanged = reconciledResultIdsKeyRef.current !== resultIdsKey;
    reconciledResultIdsKeyRef.current = resultIdsKey;
    const firstCurrentWorkId =
      !deferredQuery.trim() && presentation.groups[0]?.id === "current-work"
        ? presentation.groups[0].results[0]?.id
        : undefined;
    const next = reconcileActiveResultId(
      resultOrderChanged && firstCurrentWorkId ? firstCurrentWorkId : activeResultId,
      results.map((result) => result.id),
    );
    setSession((current) => (current.activeResultId === next ? current : { ...current, activeResultId: next }));
  }, [activeResultId, deferredQuery, presentation.groups, resultIdsKey, results]);

  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      if (initialQueryRef.current) inputRef.current?.select();
    });
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
    if (definition.action.kind === "modal") {
      const props = definition.action.props ? { ...definition.action.props } : undefined;
      const prefillName = createModalPrefillName(definition.action.modal, query);
      ui().openModal(definition.action.modal, prefillName ? { ...props, defaultName: prefillName } : props);
    } else executeStateNavigation(definition.action.target);
    return true;
  };
  const runDirectChatAction = (result: OmnibarResult) => {
    if (!activeChat || !isDirectActiveChatAction(query, result, searchResults)) return false;
    const resourceKinds: Partial<Record<OmnibarCategory, ChatResourceDragKind>> = {
      character: "character",
      persona: "persona",
      lorebook: "lorebook",
      preset: "preset",
      connection: "connection",
      agent: "agent",
    };
    const kind = resourceKinds[result.category];
    if (!kind) return false;
    const id = getOmnibarResourceId(result);
    const payload: ChatResourceDragPayload = {
      version: 1,
      kind,
      ids: [id],
      label: result.title,
    };
    if (resolveChatResourceDropAction(payload, activeChat)?.type === "blocked") return false;
    requestChatResourceAssignment(payload);
    recordUse(result.id);
    onClose();
    return true;
  };
  const choose = (result: OmnibarResult) => {
    if (result.control) return;
    if (result.id.startsWith("mari-chat:")) {
      setMariOpenChatId(result.id.slice("mari-chat:".length));
      openProfessorMari();
      return;
    }
    if (result.id.startsWith("message:")) {
      const messageNumber = Number(result.id.slice(result.id.lastIndexOf(":") + 1));
      const chatId = result.id.slice("message:".length, result.id.lastIndexOf(":"));
      if (Number.isFinite(messageNumber)) useChatStore.getState().requestGotoMessage(chatId, messageNumber);
      onClose();
      return;
    }
    if (runDirectChatAction(result)) return;
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
    if (result.id === "creation-proposal" && creationProposal) {
      setProposalDraft(creationProposal);
      setMariReturnPane("results");
      mariReturnResultIdRef.current = result.id;
      setMariMounted(true);
      setPane("mari");
      return;
    }
    if (result.id === "game-command" && gameCommand && activeChatId) {
      if (gameCommand.kind === "roll") {
        // Imported on demand: a static import pulls the game surface into the
        // app shell chunk and breaks the bundle budget.
        void (async () => {
          const [{ api }, { useGameModeStore }] = await Promise.all([
            import("../../lib/api-client"),
            import("../../stores/game-mode.store"),
          ]);
          try {
            const res = await api.post<{ result: unknown }>("/game/dice/roll", {
              chatId: activeChatId,
              notation: gameCommand.notation,
            });
            useGameModeStore.getState().setDiceRollResult(res.result as never);
          } catch (error) {
            ui().setLastAppError({
              message: error instanceof Error ? error.message : String(error),
              action: t("commandCenter.game.rollAction", "Roll dice"),
            });
          }
        })();
        recordUse(result.id);
        onClose();
        return;
      }
      // Party, quest, scene and encounter changes need the live game state.
      openProfessorMari(null);
      return;
    }
    if (result.id === "chat-extraction") {
      void runChatExtraction();
      return;
    }
    if (result.id === "resume-creation-session") {
      const session = ui().creationSession;
      if (session?.createdChatId && navigate({ kind: "chat", chatId: session.createdChatId })) {
        ui().setCreationSession(null);
        onClose();
      }
      return;
    }
    if (result.id === "ask-professor-mari") {
      openProfessorMari(null, {
        reviewPending: result.group === "continue" && (mariWorkspaceStatus.data?.pendingApprovals.length ?? 0) > 0,
      });
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
    else if (result.control?.type === "choice") showResultDetail(result);
    else choose(result);
  };
  const handleResultMouseMove = (result: RankedOmnibarResult, event: MouseEvent<HTMLLIElement>) => {
    if (event.movementX === 0 && event.movementY === 0) return;
    setActiveResultId(result.id);
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
    if (event.key === "Tab" && !event.shiftKey && inlineSuffix) {
      // Accept the ghost completion instead of leaving the field.
      event.preventDefault();
      setQuery(query + inlineSuffix);
      return;
    }
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
    } else if (
      mariEnabled &&
      (pane === "results" || pane === "detail") &&
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey) &&
      activeResult &&
      activeResult.command.availability?.status !== "requires-admin"
    ) {
      // Continue the selected result with Mari without opening the detail pane first.
      event.preventDefault();
      openProfessorMari(resolveCurrentResult(activeResult));
    } else if ((pane === "results" || pane === "detail") && event.key === "Enter" && activeResult) {
      event.preventDefault();
      if (activeResult.control?.type === "toggle") activeResult.control.onChange(activeResult.control.value !== true);
      else if (activeResult.control?.type === "choice") showResultDetail(activeResult);
      else choose(activeResult);
    } else if (
      pane === "results" &&
      event.key === "ArrowRight" &&
      activeResult &&
      (activeResult.control?.type === "choice" || isRichResult(activeResult))
    ) {
      event.preventDefault();
      showResultDetail(activeResult);
    } else if (pane === "browse" && event.key === "ArrowDown") {
      event.preventDefault();
      panelRef.current?.querySelector<HTMLElement>('[data-command-center-browse-result][tabindex="0"]')?.focus();
    } else if (pane === "browse" && event.key === "Enter") {
      event.preventDefault();
      panelRef.current?.querySelector<HTMLButtonElement>('[data-command-center-browse-result][tabindex="0"]')?.click();
    }
  };
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      handleEscape();
      return;
    }
    const focusedRow = (event.target as HTMLElement).closest<HTMLElement>("[data-command-center-result-row]");
    const focusedRowButton = focusedRow?.querySelector<HTMLElement>(":scope > button");
    if (focusedRow && event.target === focusedRowButton && pane === "results") {
      const rowId = focusedRow.dataset.resultId;
      const rowIndex = results.findIndex((result) => result.id === rowId);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const nextIndex =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? results.length - 1
              : event.key === "ArrowDown"
                ? Math.min(rowIndex + 1, results.length - 1)
                : Math.max(rowIndex - 1, 0);
        const next = results[nextIndex];
        if (next) {
          setActiveResultId(next.id);
          listRef.current?.querySelector<HTMLElement>(`[data-result-id="${CSS.escape(next.id)}"] button`)?.focus();
        }
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (event.key === "ArrowRight") {
        const focusedResult = results[rowIndex];
        if (focusedResult && (focusedResult.control?.type === "choice" || isRichResult(focusedResult))) {
          event.preventDefault();
          showResultDetail(focusedResult);
          return;
        }
      }
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
  const openProfessorMari = (
    selectedResult: RankedOmnibarResult | null = null,
    options: { reviewPending?: boolean } = {},
  ) => {
    setProposalDraft(null);
    const draft = query.trim();
    if (draft) useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, draft);
    const focusResult = selectedResult ?? contextResults[0] ?? null;
    setMariContext(
      buildProfessorMariCommandCenterContext(draft, focusResult, [], focusResult?.id, {
        activeChat: activeChat ? { id: activeChat.id, label: activeChat.name, mode: activeChat.mode } : undefined,
        settingsLocation:
          settingsPanelVisible && (settingsTab || settingsTargetControlId)
            ? { tab: settingsTab ?? undefined, controlId: settingsTargetControlId ?? undefined }
            : undefined,
        field: activeEditorField?.label,
        error: lastAppError ? { message: lastAppError.message, code: lastAppError.code } : undefined,
      }),
    );
    setMariReturnPane(pane === "browse" ? "browse" : pane === "detail" ? detailOrigin : "results");
    const returnResultId = focusResult?.id ?? activeResultId;
    mariReturnResultIdRef.current = returnResultId;
    setSessionValue("mariReturnResultId", returnResultId);
    setMariChatOpen(true);
    setMariMounted(true);
    setMariTaskFinished(false);
    setPane("mari");
    if (options.reviewPending) setMariPendingReviewRequest((current) => current + 1);
  };
  // A task is "finished" when Mari stops working while the Work pane is open.
  const mariActive = mariWorkspaceStatus.data?.active ?? false;
  const mariActiveRef = useRef(mariActive);
  useEffect(() => {
    const wasActive = mariActiveRef.current;
    mariActiveRef.current = mariActive;
    if (wasActive && !mariActive && pane === "mari") setMariTaskFinished(true);
  }, [mariActive, pane]);

  const completionActions = mariTaskFinished && pane === "mari" ? omnibarCompletionActions(mariContext) : [];
  const runCompletionAction = (action: OmnibarCompletionAction) => {
    setMariTaskFinished(false);
    if (action.kind === "return") {
      setMariChatOpen(false);
      return;
    }
    if (action.kind === "review") {
      setMariPendingReviewRequest((current) => current + 1);
      return;
    }
    // Open the resource through the existing result path so dirty-editor and
    // navigation rules still apply. Characters can deep-link to the edited field.
    const resource = action.resource;
    if (!resource) return;
    if (resource.kind === "character") {
      if (
        ui().editorDirty &&
        !window.confirm(t("commandCenter.dirtyEditor", "You have unsaved changes. Leave this editor?"))
      )
        return;
      ui().openCharacterDetail(resource.id, {
        ...(action.kind === "open-field" ? { initialTab: action.field === "Greeting" ? "convo" : "card" } : {}),
      });
      onClose();
      return;
    }
    const result = currentResultById.get(`${resource.kind}:${resource.id}`);
    if (result) choose(result);
  };

  /**
   * Accepts a proposal: the app creates what it can name for certain (the chat
   * and any character the user already has), then hands the creative remainder
   * to Mari. The user always ends up with a usable chat, even if Mari is slow
   * or the creative half is abandoned.
   */
  const acceptProposal = async (proposal: CreationProposal, options: { assistedOnly?: boolean } = {}) => {
    const { direct, assisted } = splitProposalWork(proposal, (name) => characterIdByName.get(name.toLowerCase()));
    let createdChatId: string | undefined;
    if (!options.assistedOnly) {
      const characterIds = direct.flatMap((item) => (item.kind === "character" && item.id ? [item.id] : []));
      try {
        const chat = await createChat.mutateAsync({
          name: proposal.title,
          mode: proposal.goal === "campaign" ? "game" : "roleplay",
          characterIds,
        });
        createdChatId = chat.id;
      } catch (error) {
        // Keep the user in the flow: Mari can still do the creative half.
        ui().setLastAppError({
          message: error instanceof Error ? error.message : String(error),
          action: t("commandCenter.proposal.createChatAction", "Create chat"),
        });
      }
    }
    ui().setCreationSession(
      assisted.length > 0 && createdChatId
        ? {
            id: `creation-${Date.now()}`,
            seed: proposal.seed,
            title: proposal.title,
            ...(createdChatId ? { createdChatId } : {}),
            createdAt: Date.now(),
          }
        : null,
    );
    setProposalDraft(null);
    // Hand the remainder to Mari with the seed and what is still missing.
    const remaining = assisted.map((item) => `${item.kind}: ${item.label}`).join(", ");
    const draft = remaining
      ? t("commandCenter.proposal.mariDraft", "{{seed}}. Still needed: {{remaining}}.", {
          seed: proposal.seed,
          remaining,
        })
      : proposal.seed;
    useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, draft);
    setMariContext(
      buildProfessorMariCommandCenterContext(draft, null, [], undefined, {
        ...(createdChatId ? { activeChat: { id: createdChatId, label: proposal.title } } : {}),
      }),
    );
    setMariChatOpen(true);
    setMariMounted(true);
    setMariTaskFinished(false);
    setPane("mari");
  };

  /**
   * Turns the active chat into reusable world material. A lorebook gets an empty
   * shell up front so Mari has somewhere to write; the other kinds need Mari to
   * decide what already exists first. Mari receives a typed chat reference, not
   * the transcript — she reads what she needs after the request.
   */
  const runChatExtraction = async () => {
    if (!chatExtraction || !activeChat) return;
    setProposalDraft(null);
    let lorebookId: string | undefined;
    if (chatExtraction.creates === "lorebook") {
      try {
        const lorebook = await createLorebook.mutateAsync({ name: activeChat.name });
        lorebookId = lorebook.id;
      } catch (error) {
        ui().setLastAppError({
          message: error instanceof Error ? error.message : String(error),
          action: t("commandCenter.extract.createLorebookAction", "Create lorebook"),
        });
      }
    }
    useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, chatExtraction.seed);
    setMariContext(
      buildProfessorMariCommandCenterContext(
        chatExtraction.seed,
        lorebookId ? { id: `lorebook:${lorebookId}`, title: activeChat.name, category: "lorebook" } : null,
        [],
        undefined,
        { activeChat: { id: activeChat.id, label: activeChat.name, mode: activeChat.mode } },
      ),
    );
    setMariReturnPane("results");
    mariReturnResultIdRef.current = "chat-extraction";
    setMariChatOpen(true);
    setMariMounted(true);
    setMariTaskFinished(false);
    setPane("mari");
  };

  /**
   * The selected browse items, when they are all one attachable kind and a chat
   * is open. Mixed selections are not attachable, because one drop payload
   * carries a single kind.
   */
  const browseBatchAttach = useMemo(() => {
    if (!activeChat || browseCompareIds.length === 0) return null;
    const kinds: Partial<Record<OmnibarCategory, ChatResourceDragKind>> = {
      character: "character",
      persona: "persona",
      lorebook: "lorebook",
      preset: "preset",
    };
    const resultById = new Map(browseResults.map((item) => [item.id, item]));
    const selected = browseCompareIds.flatMap((id) => {
      const item = resultById.get(id);
      return item ? [item] : [];
    });
    if (selected.length === 0) return null;
    const kind = kinds[selected[0]!.category];
    if (!kind || selected.some((item) => kinds[item.category] !== kind)) return null;
    return { kind, ids: selected.map((item) => getOmnibarResourceId(item)), label: selected[0]!.title };
  }, [activeChat, browseCompareIds, browseResults]);

  const attachBrowseSelection = () => {
    if (!browseBatchAttach) return;
    requestChatResourceAssignment({
      version: 1,
      kind: browseBatchAttach.kind,
      ids: browseBatchAttach.ids,
      label: browseBatchAttach.label,
    });
    setBrowseCompareMode(false);
    setBrowseCompareIds([]);
    onClose();
  };

  const compareWithProfessorMari = () => {
    const resultById = new Map(browseResults.map((result) => [result.id, result]));
    const selected = browseCompareIds.flatMap((id) => {
      const result = resultById.get(id);
      return result ? [result] : [];
    });
    const primary = selected[0];
    if (!primary || selected.length < 2) return;
    setProposalDraft(null);
    const draft =
      query.trim() ||
      t("commandCenter.compareDraft", "Compare these {{count}} items and recommend the best fit for me.", {
        count: selected.length,
      });
    useChatStore.getState().setInputDraft(PROFESSOR_MARI_DRAFT_KEY, draft);
    setMariContext(
      buildProfessorMariCommandCenterContext(draft, primary, selected.slice(1), primary.id, {
        activeChat: activeChat ? { id: activeChat.id, label: activeChat.name, mode: activeChat.mode } : undefined,
      }),
    );
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
  /**
   * What Enter does, in one word. Resource rows open an editor even when the row
   * shows only a name, so "Open" alone was misleading in the context group.
   */
  const resultEnterHint = (result: RankedOmnibarResult) =>
    EDITOR_CATEGORIES.has(result.category)
      ? t("commandCenter.edit", "Edit")
      : result.category === "docs"
        ? t("commandCenter.read", "Read")
        : t("commandCenter.open", "Open");
  const resultControlPending = (result: RankedOmnibarResult) =>
    (result.category === "persona" && activatePersona.isPending) ||
    (result.category === "lorebook" && updateLorebook.isPending) ||
    (result.category === "preset" && setDefaultPreset.isPending) ||
    (result.id.startsWith("control:chat-") && (updateChat.isPending || updateChatMetadata.isPending));
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
  const previewResult =
    pane === "detail" && detailOrigin === "browse"
      ? (resolveCurrentResult(detailResult) ?? resolveCurrentResult(activeResult ?? null))
      : resolveCurrentResult(activeResult ?? null);
  const previewDetail = usePreviewDetail(previewResult);

  useEffect(() => {
    if (!detailResultId) {
      setDetailResult(null);
      return;
    }
    setDetailResult(currentResultById.get(detailResultId) ?? null);
  }, [currentResultById, detailResultId]);

  useEffect(() => {
    if (pane !== "detail" || detailOrigin === "browse" || !activeResultId) return;
    setDetailResult(currentResultById.get(activeResultId) ?? null);
    setSessionValue("detailResultId", activeResultId);
  }, [activeResultId, currentResultById, detailOrigin, pane]);

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
          return [...mariActions, ...(addToChatAction ? [addToChatAction] : [])];
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
            ...mariActions,
            ...(globalAction ? [globalAction] : []),
            ...(addToChatAction ? [addToChatAction] : []),
          ];
        }
        if (previewResult.control?.type === "toggle") {
          return [
            ...mariActions,
            {
              label: previewResult.control.value
                ? t("commandCenter.actions.disable", "Disable")
                : t("commandCenter.actions.enable", "Enable"),
              icon: ArrowRight,
              onSelect: () => previewResult.control?.onChange(previewResult.control.value !== true),
              disabled: resultControlPending(previewResult),
            },
            ...(addToChatAction ? [addToChatAction] : []),
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
          // Symmetric to add-to-chat: when the character is already a participant,
          // the most useful scene action is removing it from the active chat.
          const removeFromChatAction =
            activeChat && characterId && rowState?.inActiveChat
              ? {
                  label: t("commandCenter.actions.removeFromThisChat", "Remove from this chat"),
                  icon: UserMinus,
                  onSelect: () => {
                    void updateChat.mutateAsync({
                      id: activeChat.id,
                      characterIds: (activeChat.characterIds ?? []).filter((id) => id !== characterId),
                    });
                    recordUse(previewResult.id);
                    onClose();
                  },
                }
              : null;
          return [
            ...mariActions,
            startChatAction,
            editAction,
            ...(removeFromChatAction ? [removeFromChatAction] : addToChatAction ? [addToChatAction] : []),
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
        return [...mariActions, ...(openAction ? [openAction] : []), ...(addToChatAction ? [addToChatAction] : [])];
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
      data-mode={pane === "mari" ? "work" : "find"}
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
        className={`relative isolate flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--card)] shadow-2xl motion-safe:animate-omnibar-in sm:max-w-[44rem] sm:rounded-2xl sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] sm:ring-1 sm:ring-[var(--border)]/60 motion-safe:transition-[height,max-height] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none ${pane === "mari" ? "sm:h-[min(44rem,80dvh)] sm:max-h-[min(44rem,80dvh)]" : "sm:h-[min(36rem,68dvh)] sm:max-h-[min(36rem,68dvh)]"}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-[radial-gradient(120%_100%_at_12%_0%,oklch(0.72_0.16_255/0.12),transparent_60%),radial-gradient(120%_100%_at_88%_0%,oklch(0.73_0.21_345/0.11),transparent_60%)]"
        />
        <h2 id="global-omnibar-title" className="sr-only">
          {pane === "mari" ? t("commandCenter.workTitle", "Professor Mari") : t("omnibar.title", "Search Marinara")}
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
                    ? t("commandCenter.backToFind", "Back to search")
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
                      {t("commandCenter.mode.work", "Ask Mari")}
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
                  className="relative flex min-w-0 flex-1"
                >
                  <InlineGhostText
                    value={query}
                    suffix={inlineSuffix}
                    className="text-base font-medium leading-normal"
                  />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setFilter("all");
                      setPane("results");
                      setDetailResult(null);
                      setSessionValue("detailResultId", null);
                    }}
                    type="search"
                    aria-label={t("omnibar.inputLabel", "Search Marinara")}
                    onKeyDown={onInputKeyDown}
                    placeholder={t(
                      "commandCenter.placeholder",
                      "Search Marinara commands, chats, resources, and guides",
                    )}
                    className="min-w-0 flex-1 bg-transparent text-base font-medium text-[var(--foreground)] outline-none placeholder:font-normal placeholder:text-[var(--muted-foreground)] [&::-webkit-search-cancel-button]:hidden"
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
                className="inline-flex size-6 shrink-0 items-center justify-center self-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_12%,var(--card))] text-[var(--muted-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_20%,var(--card))] hover:text-[var(--foreground)]"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            ) : null}
            {pane !== "mari" && mariEnabled ? (
              <button
                type="button"
                onClick={() => openProfessorMari()}
                aria-label={t("commandCenter.openWork", "Ask Professor Mari")}
                title={t("commandCenter.openWork", "Ask Professor Mari")}
                data-component="GlobalOmnibar.ProfessorMariButton"
                className="group relative -mb-px flex h-14 w-[4.25rem] shrink-0 self-end items-end justify-end overflow-hidden pb-2 pl-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
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
              className="scrollbar-hide flex min-h-11 items-center gap-1 overflow-x-auto border-b border-[var(--border)] px-2 py-1.5 overscroll-x-contain sm:min-h-10"
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
            {proposalDraft ? (
              <div
                data-component="GlobalOmnibar.Proposal"
                className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-4"
              >
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">
                    {t("commandCenter.proposal.heading", "Set up {{title}}", { title: proposalDraft.title })}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{proposalDraft.seed}</p>
                </div>
                <ul className="flex flex-col gap-1 text-xs">
                  {proposalDraft.items.map((item, index) => (
                    <li key={`${item.kind}-${item.label}-${index}`} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--foreground)]">{item.label}</span>
                      <span className="text-[var(--muted-foreground)]">
                        {item.status === "known"
                          ? t("commandCenter.proposal.existing", "existing {{kind}}", { kind: item.kind })
                          : t("commandCenter.proposal.new", "new {{kind}}", { kind: item.kind })}
                      </span>
                    </li>
                  ))}
                </ul>
                {proposalDraft.missingDecisions.length > 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t("commandCenter.proposal.missing", "Mari will ask about: {{list}}", {
                      list: proposalDraft.missingDecisions.join(", "),
                    })}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => void acceptProposal(proposalDraft)}
                    disabled={createChat.isPending}
                    className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] disabled:opacity-50"
                  >
                    {t("commandCenter.proposal.accept", "Create it")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void acceptProposal(proposalDraft, { assistedOnly: true })}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                  >
                    {t("commandCenter.proposal.withMari", "Build with Mari")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProposalDraft(null);
                      setPane(mariReturnPane);
                    }}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)]"
                  >
                    {t("commandCenter.proposal.cancel", "Cancel")}
                  </button>
                </div>
              </div>
            ) : (
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
                  openChatId={mariOpenChatId}
                  pendingReviewRequest={mariPendingReviewRequest}
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
            )}
            {completionActions.length > 0 ? (
              <div
                data-component="GlobalOmnibar.CompletionActions"
                className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--card)] px-3 py-2"
              >
                {completionActions.map((action) => (
                  <button
                    key={action.kind}
                    type="button"
                    onClick={() => runCompletionAction(action)}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
                  >
                    {action.kind === "open-resource"
                      ? t("commandCenter.completion.openResource", "Open {{label}}", {
                          label: action.resource?.label ?? "",
                        })
                      : action.kind === "open-field"
                        ? t("commandCenter.completion.openField", "Open {{field}}", { field: action.field ?? "" })
                        : action.kind === "review"
                          ? t("commandCenter.completion.review", "Review changes")
                          : t("commandCenter.completion.return", "Return to results")}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
        {pane === "mari" ? null : pane !== "browse" && !(pane === "detail" && detailOrigin === "browse") ? (
          <div className="flex min-h-0 flex-1">
            <div
              ref={listRef}
              id="global-omnibar-results"
              aria-label={t("omnibar.results", "Search results")}
              data-component="GlobalOmnibar.Results"
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 ${pane === "detail" ? (detailOrigin === "browse" ? "hidden" : "max-[85rem]:hidden") : ""}`}
            >
              {!query.trim() ? (
                <div className="border-b border-[var(--border)] px-3 pb-2.5 pt-2.5 motion-safe:animate-fade-in-up">
                  <p className="text-[0.8125rem] font-bold leading-tight text-[var(--foreground)]">
                    {t("commandCenter.mode.find", "Find")}
                  </p>
                  <p className="mt-0.5 text-[0.6875rem] leading-snug text-[var(--muted-foreground)]">
                    {t("commandCenter.deck.subtitle", "Find what you need, or ask Professor Mari for help.")}
                  </p>
                  <div className="scrollbar-hide mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
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
                            onMouseMove={(event) => handleResultMouseMove(result, event)}
                            mariAffordance={
                              mariEnabled && result.command.availability?.status !== "requires-admin" ? (
                                <button
                                  type="button"
                                  aria-label={t("commandCenter.actions.continueWithMari", "Continue with Mari")}
                                  title={t("commandCenter.actions.continueWithMari", "Continue with Mari")}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openProfessorMari(resolveCurrentResult(result));
                                  }}
                                  className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-opacity hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] max-md:opacity-100 ${
                                    selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                  }`}
                                >
                                  <Sparkles className="size-3.5" aria-hidden="true" />
                                </button>
                              ) : undefined
                            }
                            mediaSrc={result.preview?.media?.src}
                            mediaKind={result.preview?.media?.kind}
                            avatarCropStyle={result.preview?.media?.avatarCropStyle}
                            groupClassName={visual.groupClassName}
                            accent={result.preview?.accent}
                            setupStatus={setupStatus}
                            enterHint={result.control ? undefined : resultEnterHint(result)}
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
                className="min-h-0 w-full overflow-y-auto overscroll-contain border-[var(--border)] pb-[env(safe-area-inset-bottom)] min-[85rem]:hidden"
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
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-safe:animate-fade-in-up ${pane === "detail" ? "max-[85rem]:hidden" : ""}`}
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
                    {browseBatchAttach ? (
                      <button
                        type="button"
                        onClick={attachBrowseSelection}
                        className="min-h-9 rounded-md border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]"
                      >
                        {t("commandCenter.attachSelection", "Add {{count}} to this chat", {
                          count: browseBatchAttach.ids.length,
                        })}
                      </button>
                    ) : null}
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
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain border-[var(--border)] pb-[env(safe-area-inset-bottom)] min-[85rem]:hidden"
          >
            {renderResultPreview(true)}
          </aside>
        ) : null}

        {pane !== "mari" ? (
          <footer className="hidden min-h-9 shrink-0 items-center justify-between border-t border-[var(--border)] px-3 text-[0.6875rem] text-[var(--muted-foreground)] sm:flex">
            <span>{t("commandCenter.keyboard.move", "Arrow keys move")}</span>
            {inlineSuffix ? (
              <span>{t("commandCenter.keyboard.complete", "⇥ Complete")}</span>
            ) : mariEnabled && (pane === "results" || pane === "detail") && activeResult ? (
              <span>{t("commandCenter.keyboard.continueMari", "⌘↵ Continue with Mari")}</span>
            ) : null}
            <span>{t("commandCenter.keyboard.escape", "Esc back")}</span>
          </footer>
        ) : null}
      </div>

      {(pane === "detail" || pane === "results") && previewResult ? (
        <motion.aside
          data-component="GlobalOmnibar.ExternalDetail"
          initial={reduceMotion ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          className="fixed left-[calc(50%+22.5rem)] top-[10vh] hidden h-[min(36rem,68dvh)] w-[20rem] overflow-hidden rounded-2xl bg-[var(--card)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-1 ring-[var(--border)]/60 min-[85rem]:block"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={previewResult.id}
              className="h-full"
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
