import {
  normalizeProfessorMariNavigationQuery,
  type ProfessorMariBrowserTab,
  type ProfessorMariNavigationChat,
  type ProfessorMariNavigationResource,
  type ProfessorMariNavigationTarget,
} from "./professor-mari-navigation";
import type {
  CommandCenterResultGroupId,
  CommandCenterResultMedia,
  CommandCenterResultMetadata,
  CommandIcon,
  CommandKind,
} from "./command-center";
import type { CommandCenterPreviewData } from "../components/command-center/command-result-preview.types";

export type OmnibarCategory =
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
export type OmnibarResult = {
  id: string;
  title: string;
  category: OmnibarCategory;
  target?: ProfessorMariNavigationTarget;
  score: number;
  aliases?: readonly string[];
  description?: string;
  preview?: CommandCenterPreviewData;
  metadata?: readonly CommandCenterResultMetadata[];
  media?: CommandCenterResultMedia;
  group?: CommandCenterResultGroupId;
  source?: string;
  snippet?: string;
  path?: string;
  line?: number | null;
  contextLabel?: string;
  control?: {
    type: "toggle" | "choice";
    label: string;
    value: string | boolean;
    options?: readonly { value: string; label: string }[];
    onChange: (value: string | boolean) => void;
  };
  kind?: CommandKind;
  icon?: CommandIcon;
  availability?:
    | "available"
    | "unavailable"
    | { status: "available" | "requires-capability" | "requires-admin"; capability?: string; setupTarget?: boolean };
};
export type OmnibarSearchData = {
  commands: readonly {
    id: string;
    title: string;
    target?: ProfessorMariNavigationTarget;
    aliases?: readonly string[];
    kind?: CommandKind;
    icon?: CommandIcon;
    availability?: {
      status: "available" | "requires-capability" | "requires-admin";
      capability?: string;
      setupTarget?: boolean;
    };
  }[];
  chats: readonly (ProfessorMariNavigationChat & {
    mode?: string;
    description?: string;
    preview?: CommandCenterPreviewData;
  })[];
  resources: readonly (ProfessorMariNavigationResource & {
    description?: string;
    preview?: CommandCenterPreviewData;
  })[];
  connections: readonly {
    id: string;
    name: string;
    provider?: string;
    model?: string;
    isDefault?: boolean;
    imagePath?: string | null;
    preview?: CommandCenterPreviewData;
  }[];
  browserTabs?: readonly ProfessorMariBrowserTab[];
  controls?: readonly OmnibarResult[];
  context?: OmnibarContext;
  contextLabels?: Partial<Record<OmnibarContextReason, string>>;
  askProfessorTitle?: string;
};

export type OmnibarIntentKind = "navigate" | "action" | "create" | "explain" | "recommend" | "repair";

export type OmnibarIntent = {
  kind: OmnibarIntentKind;
  verb: string;
  targetQuery: string;
};

export type OmnibarSurface = "home" | "chat" | "editor" | "settings" | "library" | "game";
export type OmnibarContextReason =
  | "surface"
  | "open-resource"
  | "active-chat"
  | "settings-target"
  | "dirty"
  | "setup"
  | "error"
  | "pinned"
  | "recent";

export type OmnibarContext = {
  surface: OmnibarSurface;
  surfaceResultIds: readonly string[];
  activeChat?: { id: string; mode?: string; resultIds: readonly string[] };
  openResource?: { kind: OmnibarCategory; id: string; resultId: string };
  settingsTarget?: { tab?: string; controlId?: string; resultId: string };
  editorDirty: boolean;
  pinnedResultIds: readonly string[];
  recentResultIds: readonly string[];
  setupResultIds: readonly string[];
  error?: { resultIds: readonly string[]; message?: string };
};

const MAX_CONTEXT_IDS = 32;

function boundedIds(values: readonly string[] | undefined): string[] {
  return [...new Set((values ?? []).filter((value) => value.trim()).map((value) => value.slice(0, 256)))].slice(
    0,
    MAX_CONTEXT_IDS,
  );
}

export function createOmnibarContext(input: Partial<OmnibarContext> & Pick<OmnibarContext, "surface">): OmnibarContext {
  const openResource = input.openResource;
  const settingsTarget = input.settingsTarget;
  return {
    surface: input.surface,
    surfaceResultIds: boundedIds(input.surfaceResultIds),
    activeChat: input.activeChat
      ? {
          id: input.activeChat.id.slice(0, 256),
          mode: input.activeChat.mode?.slice(0, 32),
          resultIds: boundedIds(input.activeChat.resultIds),
        }
      : undefined,
    openResource: openResource
      ? {
          kind: openResource.kind,
          id: openResource.id.slice(0, 256),
          resultId: openResource.resultId.slice(0, 256),
        }
      : undefined,
    settingsTarget: settingsTarget
      ? {
          tab: settingsTarget.tab?.slice(0, 64),
          controlId: settingsTarget.controlId?.slice(0, 128),
          resultId: settingsTarget.resultId.slice(0, 256),
        }
      : undefined,
    editorDirty: input.editorDirty === true,
    pinnedResultIds: boundedIds(input.pinnedResultIds),
    recentResultIds: boundedIds(input.recentResultIds),
    setupResultIds: boundedIds(input.setupResultIds),
    error: input.error
      ? { resultIds: boundedIds(input.error.resultIds), message: input.error.message?.slice(0, 160) }
      : undefined,
  };
}

const INTENT_PATTERNS: readonly [OmnibarIntentKind, RegExp][] = [
  ["navigate", /^(open|show|go\s+to)\b\s*/],
  ["action", /^(add|use|activate|set)\b\s*/],
  ["create", /^(create|new|import)\b\s*/],
  ["explain", /^(explain|why|how)\b\s*/],
  ["recommend", /^(compare|recommend|improve)\b\s*/],
  ["repair", /^(fix|broken|failed|error)\b\s*/],
];

export function parseOmnibarIntent(query: string): OmnibarIntent | null {
  const normalized = normalizeProfessorMariNavigationQuery(query);
  for (const [kind, pattern] of INTENT_PATTERNS) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const targetQuery = normalized
      .slice(match[0].length)
      .replace(/^(?:a|an|the)\s+/, "")
      .replace(/\s+(?:to\s+this\s+chat|in\s+this\s+chat|as\s+(?:the\s+)?default)$/, "")
      .trim();
    return { kind, verb: match[1]!.replace(/\s+/g, " "), targetQuery };
  }
  if (/\b(?:broken|failed|error)\b/.test(normalized)) {
    return { kind: "repair", verb: normalized.match(/\b(broken|failed|error)\b/)![1]!, targetQuery: normalized };
  }
  return null;
}

export type OmnibarActiveChatContext = {
  id: string;
  characterIds?: readonly string[];
  personaId?: string | null;
  promptPresetId?: string | null;
  connectionId?: string | null;
  lorebookIds?: readonly string[];
  enableAgents?: boolean;
  activeAgentIds?: readonly string[];
};

export function getOmnibarActiveChatContextResultIds(
  activeChatId: string | null | undefined,
  chat: OmnibarActiveChatContext | null | undefined,
): Set<string> {
  const ids = new Set<string>();
  if (!activeChatId || !chat || chat.id !== activeChatId) return ids;
  ids.add(`chat:${chat.id}`);
  for (const characterId of chat.characterIds ?? []) ids.add(`character:${characterId}`);
  if (chat.personaId) ids.add(`persona:${chat.personaId}`);
  if (chat.promptPresetId) ids.add(`preset:${chat.promptPresetId}`);
  if (chat.connectionId) ids.add(`connection:${chat.connectionId}`);
  for (const lorebookId of chat.lorebookIds ?? []) ids.add(`lorebook:${lorebookId}`);
  if (chat.enableAgents) {
    for (const agentId of chat.activeAgentIds ?? []) ids.add(`agent:${agentId}`);
  }
  return ids;
}

function scoreText(query: string, values: readonly string[]) {
  return values.reduce((best, value) => {
    const normalized = normalizeProfessorMariNavigationQuery(value);
    if (!normalized) return best;
    if (normalized === query) return Math.max(best, 300 + normalized.length);
    if (normalized.startsWith(query)) return Math.max(best, 200 + query.length);
    if (normalized.length >= 2 && ` ${query} `.includes(` ${normalized} `)) {
      return Math.max(best, 150 + normalized.length);
    }
    if (normalized.includes(query)) return Math.max(best, 100 + query.length);
    return best;
  }, -1);
}

function scoreIntent(
  intent: OmnibarIntent | null,
  result: Pick<OmnibarResult, "id" | "category" | "kind" | "availability" | "control">,
) {
  if (!intent) return 0;
  if (intent.kind === "navigate") return result.category === "navigation" || result.kind === "resource" ? 70 : 25;
  if (intent.kind === "action")
    return result.kind === "action" || result.control ? 80 : result.kind === "resource" ? 55 : 0;
  if (intent.kind === "create") return /^(?:create-|import-)/.test(result.id) ? 100 : 0;
  if (intent.kind === "explain") return result.category === "docs" ? 80 : result.category === "settings" ? 25 : 0;
  if (intent.kind === "repair") {
    return typeof result.availability === "object" && result.availability.status === "requires-capability" ? 90 : 0;
  }
  return 0;
}

function getContextScore(resultId: string, context: OmnibarContext | undefined) {
  if (!context) return { score: 0, reason: undefined };
  const matches = (ids: readonly string[]) => ids.includes(resultId);
  if (context.openResource?.resultId === resultId)
    return { score: 80, reason: context.editorDirty ? ("dirty" as const) : ("open-resource" as const) };
  if (context.settingsTarget?.resultId === resultId) return { score: 80, reason: "settings-target" as const };
  if (context.activeChat && matches(context.activeChat.resultIds)) return { score: 55, reason: "active-chat" as const };
  if (context.error && matches(context.error.resultIds)) return { score: 50, reason: "error" as const };
  if (matches(context.setupResultIds)) return { score: 35, reason: "setup" as const };
  if (matches(context.surfaceResultIds)) return { score: 30, reason: "surface" as const };
  if (matches(context.pinnedResultIds)) return { score: 25, reason: "pinned" as const };
  if (matches(context.recentResultIds)) return { score: 15, reason: "recent" as const };
  return { score: 0, reason: undefined };
}

function finishResult(result: OmnibarResult, intent: OmnibarIntent | null, data: OmnibarSearchData): OmnibarResult {
  const context = getContextScore(result.id, data.context);
  return {
    ...result,
    score: result.score + context.score + scoreIntent(intent, result),
    contextLabel: context.reason ? data.contextLabels?.[context.reason] : undefined,
  };
}

export function searchOmnibar(query: string, data: OmnibarSearchData): OmnibarResult[] {
  const normalized = normalizeProfessorMariNavigationQuery(query);
  if (!normalized) return [];
  const intent = parseOmnibarIntent(query);
  const searchQuery = intent?.targetQuery || normalized;
  const results: OmnibarResult[] = [];
  for (const control of data.controls ?? []) {
    const score = Math.max(
      scoreText(searchQuery, [control.title, ...(control.aliases ?? [])]),
      scoreText(normalized, [control.title, ...(control.aliases ?? [])]),
    );
    if (score >= 0) results.push(finishResult({ ...control, score }, intent, data));
  }
  for (const command of data.commands) {
    const score = Math.max(
      scoreText(searchQuery, [command.title, ...(command.aliases ?? [])]),
      scoreText(normalized, [command.title, ...(command.aliases ?? [])]),
    );
    const contextualRepair =
      intent?.kind === "repair" &&
      (command.availability?.status === "requires-capability" || data.context?.error?.resultIds.includes(command.id));
    if (score >= 0 || contextualRepair)
      results.push(
        finishResult(
          {
            ...command,
            category: command.kind === "settings" ? "settings" : "navigation",
            kind: command.kind,
            icon: command.icon,
            availability: command.availability,
            score: contextualRepair ? Math.max(score, 80) : score,
          },
          intent,
          data,
        ),
      );
  }
  for (const chat of data.chats) {
    const score = Math.max(scoreText(searchQuery, [chat.name]), scoreText(normalized, [chat.name]));
    if (score >= 0)
      results.push(
        finishResult(
          {
            id: `chat:${chat.id}`,
            title: chat.name,
            category: "chat",
            target: { kind: "chat", chatId: chat.id },
            score,
            description: chat.description,
            preview: chat.preview,
            kind: "chat",
            icon: "chats",
          },
          intent,
          data,
        ),
      );
  }
  for (const resource of data.resources) {
    const score = Math.max(
      scoreText(searchQuery, [resource.name, ...(resource.aliases ?? [])]),
      scoreText(normalized, [resource.name, ...(resource.aliases ?? [])]),
    );
    if (score >= 0)
      results.push(
        finishResult(
          {
            ...resource,
            id: `${resource.kind}:${resource.id}`,
            title: resource.name,
            category: resource.kind,
            target: { kind: "resource", resource: resource.kind, id: resource.id },
            score,
            description: resource.description,
            preview: resource.preview,
            kind: "resource",
            icon:
              resource.kind === "character"
                ? "character"
                : resource.kind === "persona"
                  ? "persona"
                  : resource.kind === "lorebook"
                    ? "lorebook"
                    : resource.kind === "preset"
                      ? "preset"
                      : resource.kind === "agent"
                        ? "agent"
                        : "package",
          },
          intent,
          data,
        ),
      );
  }
  for (const connection of data.connections) {
    const values = [connection.name, connection.provider ?? "", connection.model ?? ""];
    const score = Math.max(scoreText(searchQuery, values), scoreText(normalized, values));
    if (score >= 0)
      results.push(
        finishResult(
          {
            id: `connection:${connection.id}`,
            title: connection.name,
            category: "connection",
            target: { kind: "panel", panel: "connections" },
            score,
            preview: connection.preview,
            kind: "settings",
            icon: "connection",
          },
          intent,
          data,
        ),
      );
  }
  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))
    .concat({
      id: "ask-professor-mari",
      title: data.askProfessorTitle ?? "Ask Professor Mari",
      category: "professor",
      score: -1,
    });
}

export function getUnambiguousOmnibarResult(results: readonly OmnibarResult[]): OmnibarResult | null {
  const direct = results.filter((result) => result.id !== "ask-professor-mari");
  const first = direct[0];
  if (!first) return null;
  return direct[1]?.score === first.score ? null : first;
}

export function isDirectActiveChatAction(
  query: string,
  result: Pick<OmnibarResult, "id" | "category">,
  results: readonly OmnibarResult[],
): boolean {
  const intent = parseOmnibarIntent(query);
  if (intent?.kind !== "action") return false;
  const directResult = getUnambiguousOmnibarResult(results);
  if (directResult?.id !== result.id) return false;
  if (/\b(?:add|use)\b.*\b(?:this|current)\s+chat\b/i.test(query)) return true;
  return intent.verb === "add" && result.category === "character";
}
