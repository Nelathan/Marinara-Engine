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
  MoreVertical,
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
import { useInstalledCapabilityPackages } from "../../hooks/use-capability-packages";
import { dispatchCardAssetInsert } from "../../lib/card-asset-links";
import { HOME_FAQ_ITEMS, getFaqSearchText } from "../chat/HomeFaq";
import { useDocsCommandSearchProvider } from "../../hooks/use-docs-command-search";
import { useCreateLorebook, useLorebooks, useLorebookEntries, useUpdateLorebook } from "../../hooks/use-lorebooks";
import { usePresets, useSetDefaultPreset } from "../../hooks/use-presets";
import { useProfessorMariWorkspaceStatus } from "../../hooks/use-professor-mari-workspace-status";
import { getCharacterDisplayIdentity } from "../../lib/character-display";
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
  getOmnibarActiveChatContextResultIds,
  isDirectActiveChatAction,
  isOmnibarRemovalIntent,
  parseOmnibarIntent,
  type OmnibarAction,
  type OmnibarCategory,
  type OmnibarResult,
} from "../../lib/omnibar-search";
import {
  MIN_MESSAGE_SEARCH_LENGTH,
  buildOmnibarChatControlResults,
  buildOmnibarContextResults,
  buildOmnibarContinueResult,
  buildOmnibarControlResults,
  buildOmnibarExtractionResult,
  buildOmnibarGameResult,
  buildOmnibarIdleResults,
  buildOmnibarMariChatResults,
  buildOmnibarMessageResults,
  buildOmnibarProposalResult,
  buildOmnibarAddSuggestions,
  buildOmnibarVerbSuggestions,
  buildOmnibarRemovalSuggestions,
  buildOmnibarSearchResults,
  buildOmnibarSlashResults,
} from "../../lib/omnibar-results";
import {
  buildOmnibarAgentRows,
  buildOmnibarCharacterRows,
  buildOmnibarChatRows,
  buildOmnibarConnectionRows,
  buildOmnibarLorebookRows,
  buildOmnibarPersonaRows,
  buildOmnibarPresetRows,
} from "../../lib/omnibar-entity-rows";
import { reconcileActiveResultId, resolveOmnibarRowState } from "../../lib/omnibar-row-state";
import {
  activatePersonalExtensionCommand,
  usePersonalExtensionCommands,
} from "../../lib/personal-extension-contributions";
import { omnibarCompletionActions, type OmnibarCompletionAction } from "../../lib/omnibar-completion-actions";
import { parseCreationSeed, splitProposalWork, type CreationProposal } from "../../lib/omnibar-creation-proposal";
import { parseChatExtraction } from "../../lib/omnibar-chat-extraction";
import { parseGameCommand } from "../../lib/omnibar-game-commands";
import { buildProfessorMariCommandCenterContext } from "../../lib/professor-mari-command-center-context";
import type { ProfessorMariNavigationTarget } from "../../lib/professor-mari-navigation";
import { executeStateNavigation } from "../../lib/state-navigation";
import { useLocalizedUiText } from "../../localization/use-localized-ui-text";
import { useChatStore } from "../../stores/chat.store";
import { isMessageHiddenFromUser } from "../../lib/chat-message-visibility";
import { normalizeTextForMatch } from "@marinara-engine/shared";
import { useUIStore } from "../../stores/ui.store";
import { CommandCenterActionValue } from "../command-center/CommandCenterActionValue";
import { InlineGhostText } from "../ui/InlineGhostText";
import { CommandCenterResultRow } from "../command-center/CommandCenterResultRow";
import { CommandCenterSegmentedChoice } from "../command-center/CommandCenterSegmentedChoice";
import { CommandCenterToggle } from "../command-center/CommandCenterToggle";
import {
  getCommandCenterCategoryVisual,
  getCommandCenterChatModeVisual,
  type CommandCenterCategoryLabels,
  type CommandCenterChatModeLabels,
} from "../command-center/command-center-visuals";
import type { CommandCenterPreviewFact } from "../command-center/command-result-preview.types";
import {
  BROWSE_FILTERS,
  FILTER_CATEGORY,
  getOmnibarResourceId,
  isRichResult,
  readNamedRow,
  resultMetadata,
  type BrowseFilter,
  type DetailOrigin,
  type OmnibarPane,
  type RankedOmnibarResult,
} from "./omnibar/omnibar-result-view";
// Each pane only renders once the user opens it, so they stay out of the
// initial AppShell chunk.
const OmnibarBrowsePane = lazy(() =>
  import("./omnibar/OmnibarBrowsePane").then((m) => ({ default: m.OmnibarBrowsePane })),
);
const OmnibarDetailPane = lazy(() =>
  import("./omnibar/OmnibarDetailPane").then((m) => ({ default: m.OmnibarDetailPane })),
);
const OmnibarMariPane = lazy(() => import("./omnibar/OmnibarMariPane").then((m) => ({ default: m.OmnibarMariPane })));

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

/** Categories that can be attached to (or detached from) the open chat. */
const CHAT_ATTACHABLE_CATEGORIES = new Set<OmnibarCategory>([
  "character",
  "persona",
  "lorebook",
  "preset",
  "connection",
  "agent",
]);
const BROWSE_BATCH_SIZE = 48;

/**
 * The overflow menu holding the suggestion toggles is hidden: the omnibar
 * header is the wrong home for them. The toggles themselves still live in the
 * UI store, so re-homing them is a matter of rendering them elsewhere.
 */
const SHOW_SUGGESTION_MENU = false;

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

export function GlobalOmnibarDialog({ onClose }: { onClose: () => void }) {
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
  const [suggestionMenuOpen, setSuggestionMenuOpen] = useState(false);
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
  const omnibarSuggestionsEnabled = useUIStore((state) => state.omnibarSuggestionsEnabled);
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
        action: { kind: "personal-extension", commandId: command.id } as const,
        target: { kind: "home" } as const,
      })),
    ];
    const chatRows = buildOmnibarChatRows({
      chats: chats.data ?? [],
      characterById,
      connectionById,
      personaById,
      chatModeLabels,
      t,
    });
    const resources = [
      ...buildOmnibarCharacterRows({
        characters: characters.data ?? [],
        lorebookNamesByCharacter: lorebookLinks.byCharacter,
        categoryLabels,
        t,
      }),
      ...buildOmnibarPersonaRows({
        personas: personas.data ?? [],
        lorebookNamesByPersona: lorebookLinks.byPersona,
        categoryLabels,
        t,
        onActivatePersona: (id) => activatePersona.mutate(id),
      }),
      ...buildOmnibarLorebookRows({
        lorebooks: lorebooks.data ?? [],
        characterNameById,
        personaById,
        categoryLabels,
        t,
        onSetLorebookEnabled: (id, enabled) => updateLorebook.mutate({ id, enabled }),
      }),
      ...buildOmnibarPresetRows({
        presets: presets.data ?? [],
        categoryLabels,
        t,
        onSetDefaultPreset: (id) => setDefaultPreset.mutate(id),
      }),
      ...buildOmnibarAgentRows({ agents: agents.data ?? [], connectionById, categoryLabels, t }),
    ];
    const connectionRows = buildOmnibarConnectionRows({ connections: connections.data ?? [], categoryLabels, t });
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

  const controls = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarControlResults({
        mariEnabled,
        musicPlayerEnabled,
        notificationSoundsOnlyWhenUnfocused,
        omnibarSuggestionsEnabled,
        reduceAmbientEffects,
        setters: useUIStore.getState(),
        showModelName,
        showTimestamps,
        showTokenUsage,
        speechToTextEnabled,
        t,
        theme,
        userStatus,
      }),
    [
      mariEnabled,
      omnibarSuggestionsEnabled,
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
    ],
  );

  // Chat state as inline controls: the changes a user makes most often are to
  // the chat they are already in — model, preset, persona, agents. These edit
  // the chat in the row, so nothing navigates away from the scene.
  // useMutation returns a fresh object every render, so the memo depends on the
  // stable mutateAsync functions. Depending on the mutation objects would give
  // this list a new identity each render and churn every list derived from it.
  const patchChat = updateChat.mutateAsync;
  const patchChatMetadata = updateChatMetadata.mutateAsync;
  const chatControls = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarChatControlResults({
        activeChat,
        activeChatId,
        connections: data.connections,
        patchChat,
        patchChatMetadata,
        resources: data.resources,
        t,
      }),
    [activeChat, activeChatId, data.connections, data.resources, patchChat, patchChatMetadata, t],
  );

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
  const searchResults = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarSearchResults({
        chatControls,
        contextLabels,
        controls,
        data,
        deferredQuery,
        docsResults: docs.results,
        faqItems: HOME_FAQ_ITEMS,
        getFaqSearchText,
        localize,
        mariEnabled,
        omnibarContext,
        t,
      }),
    [
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
    ],
  );
  // Professor Mari's conversations live behind an internal marker, so they are
  // missing from the normal chat list. Searchable here by their auto-title.
  const [mariOpenChatId, setMariOpenChatId] = useState<string | null>(null);
  const mariChats = useProfessorMariChats(mariEnabled && deferredQuery.trim().length > 0);
  const mariChatResults = useMemo<OmnibarResult[]>(
    () => buildOmnibarMariChatResults({ deferredQuery, mariChats: mariChats.data ?? [], t }),
    [deferredQuery, mariChats.data, t],
  );

  // Chat search: the engine only stores messages per chat, so this searches the
  // chat you are in rather than pretending to search all of them. The message
  // list is shared with the in-chat search panel's cache.
  const messageSearchQuery = deferredQuery.trim();
  const messageSearch = useChatMessageSearchSource(
    activeChatId ?? null,
    !!activeChatId && messageSearchQuery.length >= MIN_MESSAGE_SEARCH_LENGTH,
  );
  // Normalizing every message body is NFKC + regex work over the whole chat, so
  // it is cached against the message list instead of redone on each keystroke.
  const messageSearchIndex = useMemo(
    () =>
      (messageSearch.data ?? []).map((message) => ({
        message,
        haystack: isMessageHiddenFromUser(message) ? null : normalizeTextForMatch(message.content),
      })),
    [messageSearch.data],
  );
  const messageResults = useMemo<OmnibarResult[]>(
    () => buildOmnibarMessageResults({ activeChatId, messageSearchIndex, messageSearchQuery, t }),
    [activeChatId, messageSearchIndex, messageSearchQuery, t],
  );
  // The chat input already owns a slash-command registry; the omnibar reuses it
  // so "what can I do in this chat" is answerable from one place. Choosing a row
  // types the command into the chat input instead of running it, so args and
  // confirmation stay where the user can see them.
  const installedCapabilities = useInstalledCapabilityPackages();
  const slashAvailability = useMemo(
    () => ({
      mode: activeChat?.mode === "roleplay" || activeChat?.mode === "conversation" ? activeChat.mode : undefined,
      availableCapabilityIds: new Set(
        (installedCapabilities.data ?? []).filter((item) => item.status === "active").map((item) => item.id),
      ),
    }),
    [activeChat?.mode, installedCapabilities.data],
  );
  const slashResults = useMemo<OmnibarResult[]>(
    () => buildOmnibarSlashResults({ activeChatId, deferredQuery, slashAvailability, surface: omnibarContext.surface }),
    [activeChatId, deferredQuery, omnibarContext.surface, slashAvailability],
  );
  const idleResults = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarIdleResults({
        allLocalResults,
        recentEntries: ranking.recent,
        searchableCommandResults,
        setupResultIds: omnibarContext.setupResultIds,
        surface: omnibarContext.surface,
      }),
    [allLocalResults, omnibarContext.setupResultIds, omnibarContext.surface, ranking.recent, searchableCommandResults],
  );
  // Context-aware results: read the app's current location (active chat, open
  // editor) and surface direct jumps to whatever is on screen and under it.
  const contextResults = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarContextResults({
        activeChat,
        activeChatId,
        activeEditorField,
        agents: agents.data,
        allLocalResults,
        characterNameById,
        connectionById,
        creationSession,
        lastAppError,
        lorebooks: lorebooks.data,
        mariEnabled,
        omnibarSuggestionsEnabled,
        openAgentId,
        openCharacterId,
        openConnectionId,
        openLorebookId,
        openPersonaId,
        openPresetId,
        personaById,
        personas: personas.data,
        presets: presets.data,
        surface: omnibarContext.surface,
        t,
      }),
    [
      activeChat,
      activeChatId,
      activeEditorField,
      allLocalResults,
      agents.data,
      characterNameById,
      connectionById,
      creationSession,
      lastAppError,
      lorebooks.data,
      mariEnabled,
      openAgentId,
      openCharacterId,
      openConnectionId,
      openLorebookId,
      openPersonaId,
      openPresetId,
      personaById,
      personas.data,
      presets.data,
      omnibarSuggestionsEnabled,
      omnibarContext.surface,
      t,
    ],
  );
  const removalSuggestions = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarRemovalSuggestions({
        activeChat,
        attachedResultIds,
        contextResults,
        deferredQuery,
        omnibarSuggestionsEnabled,
        t,
      }),
    [activeChat, attachedResultIds, contextResults, deferredQuery, omnibarSuggestionsEnabled, t],
  );
  const attachedResultIds = useMemo(
    () => new Set(omnibarContext.activeChat?.resultIds ?? []),
    [omnibarContext.activeChat?.resultIds],
  );
  // A bare "add" has no search results to draw on, so the recently used rows
  // stand in: a few concrete "Add Eliza to this chat" rows are worth more than
  // six abstract kind rows alone. Kept short so the kind rows stay visible.
  const recentAttachable = useMemo(() => {
    const byId = new Map(allLocalResults.map((item) => [item.id, item]));
    return ranking.recent.flatMap((entry) => {
      const item = byId.get(entry.id);
      return item && CHAT_ATTACHABLE_CATEGORIES.has(item.category) ? [item] : [];
    });
  }, [allLocalResults, ranking.recent]);
  const addSuggestions = useMemo<OmnibarResult[]>(
    () =>
      buildOmnibarAddSuggestions({
        activeChat,
        attachedResultIds,
        deferredQuery,
        omnibarSuggestionsEnabled,
        searchResults: searchResults.length ? searchResults : recentAttachable.slice(0, 3),
        t,
      }),
    [activeChat, attachedResultIds, deferredQuery, omnibarSuggestionsEnabled, recentAttachable, searchResults, t],
  );
  const verbSuggestions = useMemo<OmnibarResult[]>(
    () => buildOmnibarVerbSuggestions({ activeChat, allLocalResults, deferredQuery, t }),
    [activeChat, allLocalResults, deferredQuery, t],
  );
  const creationProposal = useMemo(() => parseCreationSeed(deferredQuery), [deferredQuery]);
  const proposalResult = useMemo<OmnibarResult | null>(
    () => buildOmnibarProposalResult({ creationProposal, t }),
    [creationProposal, t],
  );
  const chatExtraction = useMemo(
    () => (activeChat ? parseChatExtraction(deferredQuery) : null),
    [activeChat, deferredQuery],
  );
  const extractionResult = useMemo<OmnibarResult | null>(
    () => buildOmnibarExtractionResult({ activeChat, chatExtraction, t }),
    [activeChat, chatExtraction, t],
  );
  const gameCommand = useMemo(
    () => (activeChat?.mode === "game" ? parseGameCommand(deferredQuery) : null),
    [activeChat?.mode, deferredQuery],
  );
  const gameResult = useMemo<OmnibarResult | null>(() => buildOmnibarGameResult({ gameCommand, t }), [gameCommand, t]);
  const continueResult = useMemo<OmnibarResult | null>(
    () => buildOmnibarContinueResult({ mariEnabled, t, workspaceStatus: mariWorkspaceStatus.data }),
    [mariEnabled, mariWorkspaceStatus.data, t],
  );
  const rawResults = useMemo(
    () =>
      deferredQuery.trim()
        ? [
            ...slashResults,
            ...verbSuggestions,
            ...addSuggestions,
            ...removalSuggestions,
            ...(gameResult ? [gameResult] : []),
            ...(proposalResult ? [proposalResult] : []),
            ...(extractionResult ? [extractionResult] : []),
            ...messageResults,
            ...mariChatResults,
            ...searchResults,
          ]
        : [...contextResults, ...slashResults, ...(continueResult ? [continueResult] : []), ...idleResults],
    [
      addSuggestions,
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
      removalSuggestions,
      slashResults,
      verbSuggestions,
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
  // With a chat open, an action verb completes to the whole sentence the omnibar
  // can execute ("add el" -> "add Eliza to this chat"), not just the name.
  const inlineSuffix = useMemo(() => {
    if (pane === "mari") return "";
    const intent = parseOmnibarIntent(query);
    const tail = !activeChat
      ? null
      : isOmnibarRemovalIntent(query)
        ? t("commandCenter.phrase.fromThisChat", "from this chat")
        : intent?.kind === "action"
          ? t("commandCenter.phrase.toThisChat", "to this chat")
          : null;
    const candidates = results.flatMap((result) => {
      if (result.id === "ask-professor-mari") return [];
      if (tail && intent && CHAT_ATTACHABLE_CATEGORIES.has(result.category)) {
        return [`${intent.verb} ${result.title} ${tail}`, result.title];
      }
      return [result.title];
    });
    return completeInline(query, candidates);
  }, [activeChat, pane, query, results, t]);
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
  /**
   * Detaches one resource from the open chat. Each kind lives in a different
   * field, so the mapping is explicit; a lorebook is also added to the excluded
   * list, because dropping it from the active list alone lets a character
   * re-activate it immediately.
   */
  const detachFromChat = (resource: ChatResourceDragKind, resourceId: string, label: string) => {
    if (!activeChat || !resourceId) return false;
    if (!window.confirm(t("commandCenter.actions.confirmRemove", "Remove {{name}} from this chat?", { name: label })))
      return false;
    const chatId = activeChat.id;
    if (resource === "character") {
      void patchChat({ id: chatId, characterIds: getChatCharacterIds(activeChat).filter((id) => id !== resourceId) });
    } else if (resource === "persona") {
      void patchChat({ id: chatId, personaId: null });
    } else if (resource === "preset") {
      void patchChat({ id: chatId, promptPresetId: null });
    } else if (resource === "connection") {
      void patchChat({ id: chatId, connectionId: null });
    } else if (resource === "lorebook") {
      void patchChatMetadata({
        id: chatId,
        activeLorebookIds: getChatActiveLorebookIds(activeChat).filter((id) => id !== resourceId),
        excludedLorebookIds: [...new Set([...getChatExcludedLorebookIds(activeChat), resourceId])],
      });
    } else if (resource === "agent") {
      const metadata = parseChatMetadata(activeChat.metadata);
      const active = Array.isArray(metadata.activeAgentIds) ? metadata.activeAgentIds : [];
      void patchChatMetadata({
        id: chatId,
        activeAgentIds: active.filter((id) => id !== resourceId),
      });
    } else return false;
    onClose();
    return true;
  };
  /** Attaches one resource to the open chat and closes, unless the drop rules block it. */
  const attachToChat = (kind: ChatResourceDragKind, id: string, label: string, resultId: string) => {
    if (!activeChat || !id) return false;
    const payload: ChatResourceDragPayload = { version: 1, kind, ids: [id], label };
    if (resolveChatResourceDropAction(payload, activeChat)?.type === "blocked") return false;
    requestChatResourceAssignment(payload);
    recordUse(resultId);
    onClose();
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
    return attachToChat(kind, getOmnibarResourceId(result), result.title, result.id);
  };
  // Typed dispatch for the results that do something other than open an entity.
  // Results without an `action` fall through to the generic entity-open path in
  // `choose` below.
  const runResultAction = (result: OmnibarResult, action: OmnibarAction) => {
    switch (action.kind) {
      case "open-mari-chat":
        setMariOpenChatId(action.chatId);
        openProfessorMari();
        return;
      case "slash": {
        const chatId = activeChatId;
        const command = `/${action.command} `;
        recordUse(result.id);
        onClose();
        // After the dialog unmounts, so the chat input keeps the focus it takes.
        if (chatId) requestAnimationFrame(() => dispatchCardAssetInsert(command, chatId));
        return;
      }
      case "goto-message":
        useChatStore.getState().requestGotoMessage(action.chatId, action.messageNumber);
        onClose();
        return;
      case "refine-query":
        setQuery(action.query);
        setActiveResultId(null);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      case "add-to-chat":
        attachToChat(action.resource, action.resourceId, action.label, result.id);
        return;
      case "detach-from-chat":
        if (detachFromChat(action.resource, action.resourceId, action.label)) recordUse(result.id);
        return;
      case "personal-extension":
        if (activatePersonalExtensionCommand(action.commandId)) {
          recordUse(result.id);
          onClose();
        }
        return;
      case "open-docs":
        ui().openModal("docs-viewer", {
          initialDoc: action.path,
          initialSearchTerm: query.trim().slice(0, 200),
        });
        recordUse(result.id);
        onClose();
        return;
      case "open-faq":
        ui().openModal("faq-viewer", { initialItemId: action.itemId });
        recordUse(result.id);
        onClose();
        return;
    }
  };
  const choose = (result: OmnibarResult) => {
    if (result.control) return;
    if (result.action) {
      runResultAction(result, result.action);
      return;
    }
    if (runDirectChatAction(result)) return;
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
  // Keyed by row id so the two per-row lookups below stay O(1); a linear scan
  // over every chat, twice per rendered row, showed up on large libraries.
  const chatModeByResultId = useMemo(
    () => new Map(data.chats.map((chat) => [`chat:${chat.id}` as string, chat.mode] as const)),
    [data.chats],
  );
  const resultIcon = (result: RankedOmnibarResult) => {
    if (result.category === "chat") {
      const mode = chatModeByResultId.get(result.id);
      if (mode === "roleplay") return Theater;
      if (mode === "game") return Gamepad2;
      return MessageCircle;
    }
    return getCommandIcon(result.command.icon, result.command.kind);
  };
  const resultVisual = (result: RankedOmnibarResult) => {
    if (result.category === "chat") {
      const mode = chatModeByResultId.get(result.id);
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
      setDetailResult((previous) => (previous === null ? previous : null));
      return;
    }
    const next = currentResultById.get(detailResultId) ?? null;
    setDetailResult((previous) => (previous?.id === next?.id ? previous : next));
  }, [currentResultById, detailResultId]);

  useEffect(() => {
    if (pane !== "detail" || detailOrigin === "browse" || !activeResultId) return;
    const next = currentResultById.get(activeResultId) ?? null;
    setDetailResult((previous) => (previous?.id === next?.id ? previous : next));
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
  // and the external xl panel) so they never drift apart.
  const renderResultPreview = () =>
    previewResult ? (
      <Suspense fallback={null}>
        <OmnibarDetailPane
          result={previewResult}
          actions={previewActions}
          extraFacts={previewDetail.extraFacts}
          detail={previewDetail.detail}
          detailLoading={previewDetail.detailLoading}
          controlPending={resultControlPending(previewResult)}
        />
      </Suspense>
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
            {SHOW_SUGGESTION_MENU && pane !== "mari" ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label={t("commandCenter.suggestionsMenu", "Suggestion settings")}
                  aria-expanded={suggestionMenuOpen}
                  title={t("commandCenter.suggestionsMenu", "Suggestion settings")}
                  onClick={() => setSuggestionMenuOpen((open) => !open)}
                  className="inline-flex size-11 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] sm:size-9"
                >
                  <MoreVertical size={18} />
                </button>
                {suggestionMenuOpen ? (
                  <div
                    role="menu"
                    aria-label={t("commandCenter.suggestionsMenu", "Suggestion settings")}
                    className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl"
                  >
                    <label className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-[var(--accent)]">
                      <input
                        type="checkbox"
                        checked={omnibarSuggestionsEnabled}
                        onChange={(event) => useUIStore.getState().setOmnibarSuggestionsEnabled(event.target.checked)}
                        className="mt-0.5 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="block text-xs font-semibold text-[var(--foreground)]">
                          {t("commandCenter.controls.omnibarSuggestions", "Context suggestions")}
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] leading-4 text-[var(--muted-foreground)]">
                          {t(
                            "commandCenter.controls.omnibarSuggestionsHelp",
                            "Suggest useful actions for the current chat or screen.",
                          )}
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-[var(--accent)]">
                      <input
                        type="checkbox"
                        checked={mariEnabled}
                        onChange={(event) => useUIStore.getState().setCommandCenterMariEnabled(event.target.checked)}
                        className="mt-0.5 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="block text-xs font-semibold text-[var(--foreground)]">
                          {t("commandCenter.controls.mariAssist", "Professor Mari assistance")}
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] leading-4 text-[var(--muted-foreground)]">
                          {t(
                            "commandCenter.controls.mariAssistHelp",
                            "Allow explicit handoffs to use the configured language model.",
                          )}
                        </span>
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
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
          <Suspense fallback={null}>
            <OmnibarMariPane
              active={pane === "mari"}
              reduceMotion={reduceMotion}
              proposalDraft={proposalDraft}
              acceptPending={createChat.isPending}
              onAcceptProposal={(proposal, options) => void acceptProposal(proposal, options)}
              onCancelProposal={() => {
                setProposalDraft(null);
                setPane(mariReturnPane);
              }}
              mariContext={mariContext}
              mariOpenChatId={mariOpenChatId}
              mariPendingReviewRequest={mariPendingReviewRequest}
              mariChatOpen={mariChatOpen}
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
              completionActions={completionActions}
              onCompletionAction={runCompletionAction}
            />
          </Suspense>
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
                        const preview = result.preview?.();
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
                            metadata={resultMetadata(result, visual.label, preview)}
                            tertiaryMetadata={
                              // A toggle/action control already shows the on/active state, so
                              // the status label ("Enabled"/"Active") next to it is redundant —
                              // keep only the informative metadata line in that case.
                              result.control?.type === "toggle"
                                ? preview?.metadataLine
                                : (preview?.status?.label ?? preview?.badges?.[0] ?? preview?.metadataLine)
                            }
                            description={result.description ?? preview?.description}
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
                            mediaSrc={preview?.media?.src}
                            mediaKind={preview?.media?.kind}
                            avatarCropStyle={preview?.media?.avatarCropStyle}
                            groupClassName={visual.groupClassName}
                            accent={preview?.accent}
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
                    {renderResultPreview()}
                  </motion.div>
                </AnimatePresence>
              </aside>
            ) : null}
          </div>
        ) : (
          <Suspense fallback={null}>
            <OmnibarBrowsePane
              detailOpen={pane === "detail"}
              filterLabel={filterLabels[browseFilter]}
              totalCount={browseResults.length}
              results={visibleBrowseResults}
              hasMore={visibleBrowseResults.length < browseResults.length}
              mariEnabled={mariEnabled}
              compareMode={browseCompareMode}
              compareIds={browseCompareIds}
              batchAttachCount={browseBatchAttach ? browseBatchAttach.ids.length : null}
              selectedId={browseSelectedId}
              resultVisual={resultVisual}
              resultIcon={resultIcon}
              onStartCompare={() => setBrowseCompareMode(true)}
              onCancelCompare={() => {
                setBrowseCompareMode(false);
                setBrowseCompareIds([]);
              }}
              onAttachSelection={attachBrowseSelection}
              onCompareWithMari={compareWithProfessorMari}
              onSelectedIdChange={setBrowseSelectedId}
              onToggleCompareResult={toggleBrowseCompareResult}
              onShowDetail={(result) => showResultDetail(result, "browse")}
              onLoadMore={() => setBrowseLimit(browseLimit + BROWSE_BATCH_SIZE)}
            />
          </Suspense>
        )}

        {pane === "detail" && detailOrigin === "browse" && previewResult ? (
          <aside
            data-component="GlobalOmnibar.Detail"
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain border-[var(--border)] pb-[env(safe-area-inset-bottom)] min-[85rem]:hidden"
          >
            {renderResultPreview()}
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
              {renderResultPreview()}
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      ) : null}
    </motion.div>,
    document.body,
  );
}
