import type { CommandResult } from "../../lib/command-center";

export type CommandCenterPreviewKind =
  | "chat"
  | "character"
  | "persona"
  | "lorebook"
  | "preset"
  | "connection"
  | "agent"
  | "docs";

export interface CommandCenterPreviewFact {
  label: string;
  value: string | number;
}

export interface CommandCenterPreviewMedia {
  src: string;
  alt: string;
}

export interface CommandCenterPreviewData {
  kind: CommandCenterPreviewKind;
  title?: string;
  categoryLabel?: string;
  subtitle?: string;
  description?: string;
  media?: CommandCenterPreviewMedia;
  accent?: string;
  badges?: readonly string[];
  facts?: readonly CommandCenterPreviewFact[];
}

export interface RichCommandResult extends CommandResult {
  preview?: CommandCenterPreviewData;
}

export interface CommandResultPreviewAction {
  label: string;
  onSelect: (result: RichCommandResult) => void;
  disabled?: boolean;
}
