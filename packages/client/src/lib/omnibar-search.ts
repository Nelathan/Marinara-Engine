import {
  normalizeProfessorMariNavigationQuery,
  resolveProfessorMariNavigation,
  type ProfessorMariBrowserTab,
  type ProfessorMariNavigationChat,
  type ProfessorMariNavigationResource,
  type ProfessorMariNavigationTarget,
} from "./professor-mari-navigation";

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
  | "professor";
export type OmnibarResult = {
  id: string;
  title: string;
  category: OmnibarCategory;
  target?: ProfessorMariNavigationTarget;
  score: number;
};
export type OmnibarSearchData = {
  commands: readonly { id: string; title: string; target: ProfessorMariNavigationTarget; aliases?: string[] }[];
  chats: readonly ProfessorMariNavigationChat[];
  resources: readonly ProfessorMariNavigationResource[];
  connections: readonly { id: string; name: string }[];
  browserTabs?: readonly ProfessorMariBrowserTab[];
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
  for (const command of data.commands) {
    const score = scoreText(normalized, [command.title, ...(command.aliases ?? [])]);
    if (score >= 0)
      results.push({ ...command, category: command.id.startsWith("settings") ? "settings" : "navigation", score });
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
      });
  }
  for (const resource of data.resources) {
    const score = scoreText(normalized, [resource.name, ...(resource.aliases ?? [])]);
    if (score >= 0)
      results.push({
        id: `${resource.kind}:${resource.id}`,
        title: resource.name,
        category: resource.kind,
        target: { kind: "resource", resource: resource.kind, id: resource.id },
        score,
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
