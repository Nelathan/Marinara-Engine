import type { DocsIndex, DocsSearchResponse } from "../hooks/use-docs";
import type { CommandResult } from "./command-center";

export const DOCS_COMMAND_SEARCH_MIN_QUERY_LENGTH = 2;

export interface DocsCommandSearchPassage extends CommandResult {
  id: string;
  title: string;
  source: string;
  snippet: string;
  path: string;
  line: number | null;
}

export function searchDocsCommandTitles(query: string, index: DocsIndex | undefined): DocsCommandSearchPassage[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (normalized.length < DOCS_COMMAND_SEARCH_MIN_QUERY_LENGTH) return [];

  return (index?.docs ?? [])
    .filter((doc) => doc.title.toLocaleLowerCase().includes(normalized))
    .map((doc) => ({
      id: `docs:${doc.path}:title`,
      title: doc.title,
      source: doc.path,
      snippet: doc.title,
      path: doc.path,
      line: null,
      command: {
        id: `docs:${doc.path}:title`,
        title: doc.title,
        kind: "resource" as const,
        icon: "documentation" as const,
      },
      score: 200,
    }));
}

export function toDocsCommandPassages(search: DocsSearchResponse | undefined): DocsCommandSearchPassage[] {
  return (search?.results ?? []).flatMap((result) => {
    const snippets = result.snippets.length > 0 ? result.snippets : [{ line: null, text: result.title }];
    return snippets.map((snippet) => ({
      id: `docs:${result.path}:${snippet.line ?? "title"}`,
      title: result.title,
      source: result.path,
      snippet: snippet.text,
      path: result.path,
      line: snippet.line,
      command: {
        id: `docs:${result.path}:${snippet.line ?? "title"}`,
        title: result.title,
        kind: "resource" as const,
        icon: "documentation" as const,
      },
      score: 100 + result.matches,
    }));
  });
}
