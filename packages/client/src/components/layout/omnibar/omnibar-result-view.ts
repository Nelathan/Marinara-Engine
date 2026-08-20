import type { CommandCenterCategoryFilter } from "../../../lib/command-center";
import type { OmnibarCategory, OmnibarResult } from "../../../lib/omnibar-search";
import type { RichCommandResult } from "../../command-center/command-result-preview.types";
export { formatDate, readNamedRow, readString } from "../../../lib/omnibar-row-readers";

export type OmnibarPane = "results" | "browse" | "detail" | "quick" | "mari";
export type DetailOrigin = Exclude<OmnibarPane, "detail" | "quick" | "mari">;
export type BrowseFilter = Exclude<CommandCenterCategoryFilter, "all" | "settings" | "docs">;
export type RankedOmnibarResult = OmnibarResult & {
  command: RichCommandResult["command"];
};

export const FILTER_CATEGORY: Partial<Record<CommandCenterCategoryFilter, OmnibarCategory>> = {
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

export const BROWSE_FILTERS: readonly BrowseFilter[] = [
  "chats",
  "characters",
  "personas",
  "lorebooks",
  "presets",
  "connections",
  "agents",
];

export function isRichResult(result: RankedOmnibarResult, preview = result.preview?.()) {
  return Boolean(
    preview &&
    (preview.description ||
      preview.media ||
      preview.facts?.length ||
      result.command.availability?.status !== "available"),
  );
}

export function resultMetadata(result: RankedOmnibarResult, categoryLabel: string, preview = result.preview?.()) {
  if (result.control?.type === "choice") return result.control.label;
  return (
    result.contextLabel ??
    preview?.subtitle ??
    preview?.facts?.[0]?.value?.toString() ??
    result.description ??
    categoryLabel
  );
}

export function getOmnibarResourceId(result: Pick<RankedOmnibarResult, "id">) {
  const parts = result.id.split(":");
  return parts[0] === "context" ? (parts.at(-1) ?? "") : parts.slice(1).join(":");
}
