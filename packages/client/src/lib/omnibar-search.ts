import {
  normalizeProfessorMariNavigationQuery,
  resolveProfessorMariNavigation,
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
  professorNavigationTitle?: string;
  askProfessorTitle?: string;
};

function scoreText(query: string, values: readonly string[]) {
  return values.reduce((best, value) => {
    const normalized = normalizeProfessorMariNavigationQuery(value);
    if (normalized === query) return Math.max(best, 300 + normalized.length);
    if (normalized.startsWith(query)) return Math.max(best, 200 + query.length);
    if (normalized.includes(query)) return Math.max(best, 100 + query.length);
    return best;
  }, -1);
}

export function searchOmnibar(query: string, data: OmnibarSearchData): OmnibarResult[] {
  const normalized = normalizeProfessorMariNavigationQuery(query);
  if (!normalized) return [];
  const results: OmnibarResult[] = [];
  for (const control of data.controls ?? []) {
    const score = scoreText(normalized, [control.title, ...(control.aliases ?? [])]);
    if (score >= 0) results.push({ ...control, score });
  }
  for (const command of data.commands) {
    const score = scoreText(normalized, [command.title, ...(command.aliases ?? [])]);
    if (score >= 0)
      results.push({
        ...command,
        category: command.kind === "settings" ? "settings" : "navigation",
        kind: command.kind,
        icon: command.icon,
        availability: command.availability,
        score,
      });
  }
  for (const chat of data.chats) {
    const score = scoreText(normalized, [chat.name]);
    if (score >= 0)
      results.push({
        id: `chat:${chat.id}`,
        title: chat.name,
        category: "chat",
        target: { kind: "chat", chatId: chat.id },
        score,
        description: chat.description,
        preview: chat.preview,
        kind: "chat",
        icon: "chats",
      });
  }
  for (const resource of data.resources) {
    const score = scoreText(normalized, [resource.name, ...(resource.aliases ?? [])]);
    if (score >= 0)
      results.push({
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
      });
  }
  for (const connection of data.connections) {
    const score = scoreText(normalized, [connection.name]);
    if (score >= 0)
      results.push({
        id: `connection:${connection.id}`,
        title: connection.name,
        category: "connection",
        target: { kind: "panel", panel: "connections" },
        score,
        preview: connection.preview,
        kind: "settings",
        icon: "connection",
      });
  }
  const mariTarget = resolveProfessorMariNavigation(normalized, data.browserTabs, data.resources, data.chats);
  if (mariTarget)
    results.push({
      id: "professor-mari-navigation",
      title: data.professorNavigationTitle ?? "Professor Mari navigation",
      category: "professor",
      target: mariTarget,
      score: 50,
      kind: "navigation",
      icon: "professor",
    });
  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))
    .concat({
      id: "ask-professor-mari",
      title: data.askProfessorTitle ?? "Ask Professor Mari",
      category: "professor",
      score: -1,
    });
}
