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
  | "pinned"
  | "recent"
  | "quick-controls"
  | "create-navigation"
  | "navigation"
  | Exclude<CommandCenterCategoryFilter, "all">
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
      if (pinnedIds.has(result.id)) addToGroup("pinned", result);
      else if (recentIds.has(result.id)) addToGroup("recent", result);
      else if (result.control) addToGroup("quick-controls", result);
      else addToGroup("create-navigation", result);
    }
    return {
      filter,
      results,
      groups: (["pinned", "recent", "quick-controls", "create-navigation"] as const).flatMap((id) => {
        const groupResults = groups.get(id);
        return groupResults ? [{ id, results: groupResults }] : [];
      }),
      categoryAvailability,
    };
  }

  for (const result of results) {
    const group =
      result.id === "ask-professor-mari" ? "professor-fallback" : (CATEGORY_GROUP[result.category] ?? "navigation");
    addToGroup(group, result);
  }
  return {
    filter,
    results,
    groups: COMMAND_CENTER_SEARCH_GROUP_ORDER.flatMap((id) => {
      const groupResults = groups.get(id);
      return groupResults ? [{ id, results: groupResults }] : [];
    }),
    categoryAvailability,
  };
}
