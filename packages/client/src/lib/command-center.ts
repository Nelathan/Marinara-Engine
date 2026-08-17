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
