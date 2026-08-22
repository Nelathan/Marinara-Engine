import type { ProfessorMariAskContext } from "@marinara-engine/shared";
import type { ProfessorMariNavigationTarget } from "./professor-mari-navigation";

export type CommandKind = "navigation" | "chat" | "resource" | "settings" | "action";

export type CommandIcon =
  | "command"
  | "home"
  | "chats"
  | "character"
  | "persona"
  | "lorebook"
  | "preset"
  | "connection"
  | "agent"
  | "settings"
  | "extensions"
  | "documentation"
  | "game-assets"
  | "package"
  | "professor"
  | "music"
  | "upload"
  | "updates"
  | "diagnostics"
  | "backups"
  | "speech";

export type CommandCenterCategoryFilter =
  | "all"
  | "chats"
  | "characters"
  | "personas"
  | "lorebooks"
  | "presets"
  | "connections"
  | "agents"
  | "settings"
  | "docs";

export type CommandCenterResultCategory =
  | "navigation"
  | "chat"
  | "character"
  | "persona"
  | "lorebook"
  | "preset"
  | "connection"
  | "agent"
  | "settings"
  | "professor"
  | "docs";

export type CommandCenterResultGroupId =
  | "context"
  | "current-work"
  | "continue"
  | "pinned"
  | "recent"
  | "quick-controls"
  | "create-navigation"
  | "navigation"
  | "messages"
  | Exclude<CommandCenterCategoryFilter, "all">
  | "professor-suggested"
  | "professor-fallback";

export interface CommandCenterResultMetadata {
  label: string;
  value: string | number;
}

export interface CommandCenterResultMedia {
  src: string;
  alt: string;
}

export type CommandCenterPreviewKind = Exclude<CommandCenterResultCategory, "navigation" | "professor" | "settings">;

export interface CommandCenterPreviewData {
  kind: CommandCenterPreviewKind;
  title?: string;
  categoryLabel?: string;
  subtitle?: string;
  description?: string;
  media?: CommandCenterResultMedia;
  accent?: string;
  badges?: readonly string[];
  facts?: readonly CommandCenterResultMetadata[];
}

export interface CommandCenterPresentableResult {
  id: string;
  category: CommandCenterResultCategory;
  control?: unknown;
  metadata?: readonly CommandCenterResultMetadata[];
  media?: CommandCenterResultMedia;
  group?: CommandCenterResultGroupId;
}

export interface CommandCenterResultGroup<T extends CommandCenterPresentableResult> {
  id: CommandCenterResultGroupId;
  results: T[];
}

export interface CommandCenterPresentation<T extends CommandCenterPresentableResult> {
  filter: CommandCenterCategoryFilter;
  results: T[];
  groups: CommandCenterResultGroup<T>[];
  categoryAvailability: Record<CommandCenterCategoryFilter, number>;
}

export interface CommandDefinition {
  id: string;
  title: string;
  kind: CommandKind;
  icon: CommandIcon;
  aliases?: readonly string[];
  target?: ProfessorMariNavigationTarget;
  description?: string;
  availability?: {
    status: "available" | "requires-capability" | "requires-admin";
    capability?: string;
    setupTarget?: boolean;
  };
}

export interface CommandResult {
  command: CommandDefinition;
  score: number;
}

export interface CommandRecentEntry {
  id: string;
  lastUsedAt: number;
  useCount: number;
}

export interface CommandRankingState {
  pinnedIds: string[];
  recent: CommandRecentEntry[];
}

export interface RankedCommandResult<T extends CommandResult = CommandResult> {
  result: T;
  rankingScore: number;
  pinned: boolean;
}

export interface CommandControl {
  type: "toggle" | "choice" | "action";
  label: string;
  value?: string | boolean;
  options?: readonly { value: string; label: string }[];
  onChange: (value: string | boolean) => void;
}

interface CommandStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const COMMAND_RANKING_STORAGE_KEY = "marinara:command-center:ranking:v1";
export const COMMAND_CENTER_SESSION_STORAGE_KEY = "marinara:command-center:session:v1";
export const COMMAND_CENTER_MAX_RESULTS = 75;
export const COMMAND_CENTER_CATEGORY_FILTERS: readonly CommandCenterCategoryFilter[] = [
  "all",
  "chats",
  "characters",
  "personas",
  "lorebooks",
  "presets",
  "connections",
  "agents",
  "settings",
  "docs",
];
export const COMMAND_CENTER_SEARCH_GROUP_ORDER: readonly CommandCenterResultGroupId[] = [
  // Intent rows ("Remove Eliza from this chat") first: the user named the verb,
  // so acting on the object beats another way to look at it. Omitting this group
  // dropped those rows back into their category bucket, where a same-named chat
  // outranked them.
  "current-work",
  "professor-suggested",
  "messages",
  "navigation",
  "chats",
  "characters",
  "personas",
  "lorebooks",
  "presets",
  "connections",
  "agents",
  "settings",
  "docs",
  "professor-fallback",
];
const MAX_PINNED_COMMANDS = 50;
const MAX_RECENT_COMMANDS = 100;
const MAX_COMMAND_ID_LENGTH = 256;
const MAX_USE_COUNT = 10_000;
const RECENCY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type CommandCenterPane = "results" | "browse" | "detail" | "quick" | "mari";
export type CommandCenterDetailOrigin = Exclude<CommandCenterPane, "detail" | "quick" | "mari">;
export type CommandCenterMariDestination = "chat" | "chats" | "memories" | "skills" | "context";

export interface CommandCenterQuickTask {
  id: string;
  status: "ready" | "streaming" | "complete" | "error";
  message: string;
  answer: string;
  resultId: string | null;
  createdAt: number;
}

export type CommandCenterReturnTarget =
  | { pane: "results"; resultId: string | null }
  | { pane: "browse"; resultId: string | null }
  | { pane: "detail"; resultId: string | null; origin: CommandCenterDetailOrigin }
  | { pane: "quick"; taskId: string | null }
  | { pane: "mari"; destination: CommandCenterMariDestination; detailId: string | null };

/**
 * A task handed to Professor Mari, held in session state rather than component
 * state because the omnibar dialog unmounts on close. `pending` means she has
 * not started, `working` that she has been seen active, and `finished` that she
 * stopped after working — the transition the omnibar offers actions for.
 */
export interface CommandCenterMariHandoff {
  status: "pending" | "working" | "finished";
  /** Only the part `omnibarCompletionActions` reads, so the stored blob stays small. */
  context: Pick<ProfessorMariAskContext, "capability" | "resource" | "field"> | null;
}

export interface CommandCenterSessionState {
  query: string;
  filter: CommandCenterCategoryFilter;
  pane: CommandCenterPane;
  activeResultId: string | null;
  detailResultId: string | null;
  detailOrigin: CommandCenterDetailOrigin;
  browseSelectedId: string | null;
  browseLimit: number;
  mariReturnResultId: string | null;
  mariHandoff: CommandCenterMariHandoff | null;
  mariDestination: CommandCenterMariDestination;
  mariDetailId: string | null;
  quickTask: CommandCenterQuickTask | null;
  returnStack: CommandCenterReturnTarget[];
}

export const DEFAULT_COMMAND_CENTER_SESSION_STATE: CommandCenterSessionState = {
  query: "",
  filter: "all",
  pane: "results",
  activeResultId: null,
  detailResultId: null,
  detailOrigin: "results",
  browseSelectedId: null,
  browseLimit: 48,
  mariReturnResultId: null,
  mariHandoff: null,
  mariDestination: "chat",
  mariDetailId: null,
  quickTask: null,
  returnStack: [],
};

function getCommandCenterSessionStorage(): CommandStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function normalizeCommandCenterSessionState(value: unknown): CommandCenterSessionState {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const filter = COMMAND_CENTER_CATEGORY_FILTERS.includes(source.filter as CommandCenterCategoryFilter)
    ? (source.filter as CommandCenterCategoryFilter)
    : "all";
  const pane =
    source.pane === "browse" || source.pane === "detail" || source.pane === "quick" || source.pane === "mari"
      ? source.pane
      : "results";
  const detailOrigin = source.detailOrigin === "browse" ? "browse" : "results";
  const stringOrNull = (next: unknown) => (typeof next === "string" && next.trim() ? next.trim() : null);
  const browseLimit =
    typeof source.browseLimit === "number" && Number.isFinite(source.browseLimit)
      ? Math.max(48, Math.min(480, Math.floor(source.browseLimit)))
      : DEFAULT_COMMAND_CENTER_SESSION_STATE.browseLimit;

  return {
    query: typeof source.query === "string" ? source.query.slice(0, 500) : "",
    filter,
    pane,
    activeResultId: stringOrNull(source.activeResultId),
    detailResultId: stringOrNull(source.detailResultId),
    detailOrigin,
    browseSelectedId: stringOrNull(source.browseSelectedId),
    browseLimit,
    mariReturnResultId: stringOrNull(source.mariReturnResultId),
    mariHandoff: normalizeMariHandoff(source.mariHandoff),
    mariDestination: normalizeMariDestination(source.mariDestination),
    mariDetailId: stringOrNull(source.mariDetailId),
    quickTask: normalizeQuickTask(source.quickTask),
    returnStack: normalizeReturnStack(source.returnStack),
  };
}

function normalizeMariDestination(value: unknown): CommandCenterMariDestination {
  return value === "chats" || value === "memories" || value === "skills" || value === "context" ? value : "chat";
}

function normalizeQuickTask(value: unknown): CommandCenterQuickTask | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const status = source.status;
  if (status !== "ready" && status !== "streaming" && status !== "complete" && status !== "error") return null;
  if (typeof source.id !== "string" || typeof source.message !== "string") return null;
  return {
    id: source.id.slice(0, 128),
    status,
    message: source.message.slice(0, 4_000),
    answer: typeof source.answer === "string" ? source.answer.slice(0, 20_000) : "",
    resultId: typeof source.resultId === "string" ? source.resultId.slice(0, 256) : null,
    createdAt:
      typeof source.createdAt === "number" && Number.isFinite(source.createdAt) ? source.createdAt : Date.now(),
  };
}

function normalizeReturnStack(value: unknown): CommandCenterReturnTarget[] {
  if (!Array.isArray(value)) return [];
  const targets: CommandCenterReturnTarget[] = [];
  for (const item of value.slice(-8)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const source = item as Record<string, unknown>;
    const resultId = typeof source.resultId === "string" ? source.resultId.slice(0, 256) : null;
    if (source.pane === "results" || source.pane === "browse") targets.push({ pane: source.pane, resultId });
    else if (source.pane === "detail") {
      targets.push({ pane: "detail", resultId, origin: source.origin === "browse" ? "browse" : "results" });
    } else if (source.pane === "quick") {
      targets.push({ pane: "quick", taskId: typeof source.taskId === "string" ? source.taskId.slice(0, 128) : null });
    } else if (source.pane === "mari") {
      targets.push({
        pane: "mari",
        destination: normalizeMariDestination(source.destination),
        detailId: typeof source.detailId === "string" ? source.detailId.slice(0, 256) : null,
      });
    }
  }
  return targets;
}

/**
 * Moves a handed-off task along as Mari's active flag changes. `pending` only
 * becomes `finished` by way of `working`, so a handoff she never picked up does
 * not look finished on the next poll. Idempotent: the same flag twice is a
 * no-op, which is what makes the persisted status survive the omnibar closing.
 */
export function advanceMariHandoff(
  handoff: CommandCenterMariHandoff | null,
  mariActive: boolean,
): CommandCenterMariHandoff | null {
  if (!handoff) return null;
  const status = mariActive ? "working" : handoff.status === "working" ? "finished" : handoff.status;
  return status === handoff.status ? handoff : { ...handoff, status };
}

function normalizeMariHandoff(value: unknown): CommandCenterMariHandoff | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const status = source.status;
  if (status !== "pending" && status !== "working" && status !== "finished") return null;
  // The context only feeds `omnibarCompletionActions`, which already tolerates a
  // missing capability, resource or field, so a shallow check is enough here.
  const context =
    source.context && typeof source.context === "object" && !Array.isArray(source.context)
      ? (source.context as CommandCenterMariHandoff["context"])
      : null;
  return { status, context };
}

export function readCommandCenterSessionState(
  storage: CommandStorage | null = getCommandCenterSessionStorage(),
): CommandCenterSessionState {
  if (!storage) return DEFAULT_COMMAND_CENTER_SESSION_STATE;
  try {
    return normalizeCommandCenterSessionState(
      JSON.parse(storage.getItem(COMMAND_CENTER_SESSION_STORAGE_KEY) ?? "null"),
    );
  } catch {
    return DEFAULT_COMMAND_CENTER_SESSION_STATE;
  }
}

export function writeCommandCenterSessionState(
  state: CommandCenterSessionState,
  storage: CommandStorage | null = getCommandCenterSessionStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(COMMAND_CENTER_SESSION_STORAGE_KEY, JSON.stringify(normalizeCommandCenterSessionState(state)));
    return true;
  } catch {
    return false;
  }
}

function normalizeCommandId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id && id.length <= MAX_COMMAND_ID_LENGTH ? id : null;
}

function normalizeTimestamp(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

function getBrowserStorage(): CommandStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeCommandRankingState(value: unknown): CommandRankingState {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const pinnedIds: string[] = [];
  for (const value of Array.isArray(source.pinnedIds) ? source.pinnedIds : []) {
    const id = normalizeCommandId(value);
    if (!id || pinnedIds.includes(id)) continue;
    pinnedIds.push(id);
    if (pinnedIds.length === MAX_PINNED_COMMANDS) break;
  }

  const recentById = new Map<string, CommandRecentEntry>();
  for (const value of Array.isArray(source.recent) ? source.recent : []) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const entry = value as Record<string, unknown>;
    const id = normalizeCommandId(entry.id);
    const lastUsedAt = normalizeTimestamp(entry.lastUsedAt);
    if (!id || lastUsedAt === null) continue;
    const useCount =
      typeof entry.useCount === "number" && Number.isFinite(entry.useCount)
        ? Math.max(1, Math.min(MAX_USE_COUNT, Math.floor(entry.useCount)))
        : 1;
    const current = recentById.get(id);
    if (!current || lastUsedAt > current.lastUsedAt) recentById.set(id, { id, lastUsedAt, useCount });
  }

  return {
    pinnedIds,
    recent: [...recentById.values()].sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, MAX_RECENT_COMMANDS),
  };
}

export function readCommandRankingState(storage: CommandStorage | null = getBrowserStorage()): CommandRankingState {
  if (!storage) return { pinnedIds: [], recent: [] };
  try {
    return normalizeCommandRankingState(JSON.parse(storage.getItem(COMMAND_RANKING_STORAGE_KEY) ?? "null"));
  } catch {
    return { pinnedIds: [], recent: [] };
  }
}

export function writeCommandRankingState(
  state: CommandRankingState,
  storage: CommandStorage | null = getBrowserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(COMMAND_RANKING_STORAGE_KEY, JSON.stringify(normalizeCommandRankingState(state)));
    return true;
  } catch {
    return false;
  }
}

export function recordCommandUse(state: CommandRankingState, commandId: string, now = Date.now()): CommandRankingState {
  const id = normalizeCommandId(commandId);
  const lastUsedAt = normalizeTimestamp(now);
  if (!id || lastUsedAt === null) return normalizeCommandRankingState(state);
  const current = state.recent.find((entry) => entry.id === id);
  return normalizeCommandRankingState({
    ...state,
    recent: [
      { id, lastUsedAt, useCount: Math.min(MAX_USE_COUNT, (current?.useCount ?? 0) + 1) },
      ...state.recent.filter((entry) => entry.id !== id),
    ],
  });
}

export function setCommandPinned(state: CommandRankingState, commandId: string, pinned: boolean): CommandRankingState {
  const id = normalizeCommandId(commandId);
  if (!id) return normalizeCommandRankingState(state);
  return normalizeCommandRankingState({
    ...state,
    pinnedIds: pinned
      ? [id, ...state.pinnedIds.filter((value) => value !== id)]
      : state.pinnedIds.filter((value) => value !== id),
  });
}

export function rankCommandResults<T extends CommandResult>(
  results: readonly T[],
  state: CommandRankingState,
  now = Date.now(),
): RankedCommandResult<T>[] {
  const normalized = normalizeCommandRankingState(state);
  const pinned = new Set(normalized.pinnedIds);
  const recent = new Map(normalized.recent.map((entry) => [entry.id, entry]));
  const currentTime = normalizeTimestamp(now) ?? Date.now();

  return results
    .map((result, index) => {
      const entry = recent.get(result.command.id);
      const age = entry ? Math.max(0, currentTime - entry.lastUsedAt) : RECENCY_WINDOW_MS;
      const recencyBoost = entry ? Math.max(0, 40 * (1 - age / RECENCY_WINDOW_MS)) : 0;
      const frequencyBoost = entry ? Math.min(20, Math.log2(entry.useCount + 1) * 4) : 0;
      const isPinned = pinned.has(result.command.id);
      return {
        result,
        rankingScore: result.score + (isPinned ? 1000 : 0) + recencyBoost + frequencyBoost,
        pinned: isPinned,
        index,
      };
    })
    .sort((a, b) => b.rankingScore - a.rankingScore || a.index - b.index)
    .map(({ index: _index, ...result }) => result);
}

const FILTER_CATEGORY: Record<Exclude<CommandCenterCategoryFilter, "all">, CommandCenterResultCategory> = {
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

const CATEGORY_GROUP: Partial<Record<CommandCenterResultCategory, CommandCenterResultGroupId>> = {
  navigation: "navigation",
  chat: "chats",
  character: "characters",
  persona: "personas",
  lorebook: "lorebooks",
  preset: "presets",
  connection: "connections",
  agent: "agents",
  settings: "settings",
  docs: "docs",
  professor: "navigation",
};

export function presentCommandCenterResults<T extends CommandCenterPresentableResult>(
  rankedResults: readonly T[],
  options: {
    query: string;
    filter?: CommandCenterCategoryFilter;
    rankingState?: CommandRankingState;
  },
): CommandCenterPresentation<T> {
  const filter = options.filter ?? "all";
  const uniqueResults: T[] = [];
  const seenIds = new Set<string>();
  for (const result of rankedResults) {
    if (seenIds.has(result.id)) continue;
    seenIds.add(result.id);
    uniqueResults.push(result);
  }
  const categoryAvailability = Object.fromEntries(
    COMMAND_CENTER_CATEGORY_FILTERS.map((category) => [
      category,
      category === "all"
        ? uniqueResults.length
        : uniqueResults.filter((result) => result.category === FILTER_CATEGORY[category]).length,
    ]),
  ) as Record<CommandCenterCategoryFilter, number>;
  const results = uniqueResults
    .filter((result) => filter === "all" || result.category === FILTER_CATEGORY[filter])
    .slice(0, COMMAND_CENTER_MAX_RESULTS);
  const groups = new Map<CommandCenterResultGroupId, T[]>();
  const addToGroup = (id: CommandCenterResultGroupId, result: T) => {
    const group = groups.get(id);
    if (group) group.push(result);
    else groups.set(id, [result]);
  };

  if (!options.query.trim()) {
    const ranking = normalizeCommandRankingState(options.rankingState);
    const pinnedIds = new Set(ranking.pinnedIds);
    const recentIds = new Set(ranking.recent.map((entry) => entry.id));
    for (const result of results) {
      if (result.group === "current-work" || result.group === "context") addToGroup("current-work", result);
      else if (result.group === "continue") addToGroup("continue", result);
      else if (pinnedIds.has(result.id)) addToGroup("pinned", result);
      else if (recentIds.has(result.id)) addToGroup("recent", result);
      else if (result.control) addToGroup("quick-controls", result);
      else addToGroup("create-navigation", result);
    }
    const visibleResults = (
      ["current-work", "continue", "pinned", "recent", "quick-controls", "create-navigation"] as const
    ).flatMap((id) => groups.get(id) ?? []);
    return {
      filter,
      results: visibleResults,
      groups: (
        ["current-work", "continue", "pinned", "recent", "quick-controls", "create-navigation"] as const
      ).flatMap((id) => {
        const groupResults = groups.get(id);
        return groupResults ? [{ id, results: groupResults }] : [];
      }),
      categoryAvailability,
    };
  }

  for (const result of results) {
    // An explicit group wins when it is one this view renders; otherwise the
    // result would silently vanish into a group nobody lists.
    const group =
      result.id === "ask-professor-mari"
        ? (result.group ?? "professor-fallback")
        : result.group && COMMAND_CENTER_SEARCH_GROUP_ORDER.includes(result.group)
          ? result.group
          : (CATEGORY_GROUP[result.category] ?? "navigation");
    addToGroup(group, result);
  }
  const presentedGroups = COMMAND_CENTER_SEARCH_GROUP_ORDER.flatMap((id) => {
    const groupResults = groups.get(id);
    return groupResults ? [{ id, results: groupResults }] : [];
  });
  return {
    filter,
    results: presentedGroups.flatMap((group) => group.results),
    groups: presentedGroups,
    categoryAvailability,
  };
}
