import { useEffect, useState } from "react";
import {
  DOCS_COMMAND_SEARCH_MIN_QUERY_LENGTH,
  searchDocsCommandTitles,
  toDocsCommandPassages,
  type DocsCommandSearchPassage,
} from "../lib/docs-command-search";
import { useDocsIndex, useDocsSearch } from "./use-docs";

export type DocsCommandSearchStage = "idle" | "titles" | "passages";

export interface DocsCommandSearchProvider {
  results: DocsCommandSearchPassage[];
  stage: DocsCommandSearchStage;
  isSearching: boolean;
  isError: boolean;
}

export function useDocsCommandSearchProvider(
  query: string,
  options: { enabled?: boolean; delay?: number } = {},
): DocsCommandSearchProvider {
  const { enabled = true, delay = 250 } = options;
  const trimmed = query.trim().slice(0, 200);
  const eligible = enabled && trimmed.length >= DOCS_COMMAND_SEARCH_MIN_QUERY_LENGTH;
  const [delayedQuery, setDelayedQuery] = useState("");

  useEffect(() => {
    if (!eligible) {
      setDelayedQuery("");
      return;
    }
    const timer = window.setTimeout(() => setDelayedQuery(trimmed), delay);
    return () => window.clearTimeout(timer);
  }, [delay, eligible, trimmed]);

  const stagedQuery = eligible && delayedQuery === trimmed ? delayedQuery : "";
  const index = useDocsIndex(eligible);
  const search = useDocsSearch(stagedQuery);
  const passages = search.data?.query === stagedQuery ? toDocsCommandPassages(search.data) : [];
  const hasPassageStage =
    stagedQuery.length >= DOCS_COMMAND_SEARCH_MIN_QUERY_LENGTH && !search.isFetching && !search.isError;

  if (!eligible) return { results: [], stage: "idle", isSearching: false, isError: false };
  if (hasPassageStage) {
    return { results: passages, stage: "passages", isSearching: false, isError: false };
  }
  return {
    results: searchDocsCommandTitles(trimmed, index.data),
    stage: "titles",
    isSearching: index.isLoading || stagedQuery === "" || search.isFetching,
    isError: index.isError || search.isError,
  };
}
