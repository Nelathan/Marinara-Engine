import {
  Bot,
  BookOpen,
  FileText,
  Gamepad2,
  Home,
  Link,
  MessageCircle,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ChatMode } from "@marinara-engine/shared";
import type { OmnibarScopeId } from "../../lib/omnibar-scope";

export const MARI_PEEK_URL = "/sprites/mari/generated/professor-mari-assistant-idle.png";

export type OmnibarIconEntry = {
  icon: LucideIcon;
  key: string;
  labelKey: string;
  scope?: OmnibarScopeId;
};

/** The nine top-bar destinations, in the order the intro swallows them. */
export const INTRO_ICONS: readonly OmnibarIconEntry[] = [
  { icon: Home, key: "home", labelKey: "navigation.topbar.home" },
  { icon: MessageCircle, key: "chats", labelKey: "omnibar.categories.chat", scope: "chat" },
  { icon: Users, key: "characters", labelKey: "omnibar.categories.character", scope: "character" },
  { icon: UserRound, key: "personas", labelKey: "omnibar.categories.persona", scope: "persona" },
  { icon: BookOpen, key: "lorebooks", labelKey: "omnibar.categories.lorebook", scope: "lorebook" },
  { icon: FileText, key: "presets", labelKey: "omnibar.categories.preset", scope: "preset" },
  { icon: Link, key: "connections", labelKey: "omnibar.categories.connection", scope: "connection" },
  { icon: Bot, key: "agents", labelKey: "omnibar.categories.agent", scope: "agent" },
  { icon: Settings, key: "settings", labelKey: "omnibar.categories.settings", scope: "settings" },
];

export const MODE_ICONS: Record<ChatMode, LucideIcon> = {
  conversation: MessageCircle,
  roleplay: Users,
  game: Gamepad2,
};
