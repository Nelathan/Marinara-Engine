import type { ChatMode } from "@marinara-engine/shared";

import type { OmnibarCategory } from "@/lib/omnibar-search";

export type CommandCenterVisualTone = "neutral" | "cool" | "warm" | "playful" | "natural";

export interface CommandCenterVisual {
  label: string;
  tone: CommandCenterVisualTone;
  groupClassName: string;
}

export type CommandCenterCategoryLabels = Record<OmnibarCategory, string>;
export type CommandCenterChatModeLabels = Record<ChatMode, string>;

const CATEGORY_VISUALS: Record<OmnibarCategory, Omit<CommandCenterVisual, "label">> = {
  navigation: {
    tone: "neutral",
    groupClassName: "mari-panel-gradient--settings",
  },
  chat: { tone: "playful", groupClassName: "mari-panel-gradient--backgrounds" },
  character: { tone: "playful", groupClassName: "mari-panel-gradient--characters" },
  persona: { tone: "natural", groupClassName: "mari-panel-gradient--personas" },
  lorebook: { tone: "warm", groupClassName: "mari-panel-gradient--lorebooks" },
  preset: { tone: "playful", groupClassName: "mari-panel-gradient--presets" },
  connection: { tone: "cool", groupClassName: "mari-panel-gradient--connections" },
  agent: { tone: "playful", groupClassName: "mari-panel-gradient--agents" },
  settings: { tone: "neutral", groupClassName: "mari-panel-gradient--settings" },
  professor: {
    tone: "playful",
    groupClassName: "[--mari-panel-gradient-start:var(--primary)] [--mari-panel-gradient-end:var(--primary)]",
  },
  docs: {
    tone: "neutral",
    groupClassName: "mari-panel-gradient--settings",
  },
};

const CHAT_MODE_VISUALS: Record<ChatMode, Omit<CommandCenterVisual, "label">> = {
  conversation: { tone: "cool", groupClassName: "mari-panel-gradient--connections" },
  roleplay: { tone: "warm", groupClassName: "mari-panel-gradient--lorebooks" },
  game: { tone: "playful", groupClassName: "mari-panel-gradient--characters" },
};

export function getCommandCenterCategoryVisual(
  category: OmnibarCategory,
  labels: CommandCenterCategoryLabels,
): CommandCenterVisual {
  return { ...CATEGORY_VISUALS[category], label: labels[category] };
}

export function getCommandCenterChatModeVisual(
  mode: ChatMode,
  labels: CommandCenterChatModeLabels,
): CommandCenterVisual {
  return { ...CHAT_MODE_VISUALS[mode], label: labels[mode] };
}

export function getValidatedCommandCenterAccent(accent: string | null | undefined): string | undefined {
  const value = accent?.trim();
  if (!value || value.length > 64 || typeof CSS === "undefined" || !CSS.supports("color", value)) return undefined;
  return value;
}
