import {
  BookOpen,
  Bot,
  Boxes,
  Command,
  Gamepad2,
  Home,
  LibraryBig,
  MessageCircle,
  Music2,
  Package,
  Plug,
  RefreshCw,
  ScrollText,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Volume2,
  Activity,
  ArchiveRestore,
  type LucideIcon,
} from "lucide-react";
import type { CommandIcon, CommandKind } from "./command-center";

export const COMMAND_ICONS = {
  command: Command,
  home: Home,
  chats: MessageCircle,
  character: Users,
  persona: UserRound,
  lorebook: BookOpen,
  preset: ScrollText,
  connection: Plug,
  agent: Bot,
  settings: Settings,
  extensions: Boxes,
  documentation: LibraryBig,
  "game-assets": Gamepad2,
  package: Package,
  professor: Sparkles,
  music: Music2,
  upload: Upload,
  updates: RefreshCw,
  diagnostics: Activity,
  backups: ArchiveRestore,
  speech: Volume2,
} satisfies Record<CommandIcon, LucideIcon>;

export const DEFAULT_COMMAND_ICON_BY_KIND = {
  navigation: "command",
  chat: "chats",
  resource: "package",
  settings: "settings",
  action: "command",
} as const satisfies Record<CommandKind, CommandIcon>;

export function getCommandIcon(icon: CommandIcon | undefined, kind: CommandKind): LucideIcon {
  return COMMAND_ICONS[icon ?? DEFAULT_COMMAND_ICON_BY_KIND[kind]];
}
