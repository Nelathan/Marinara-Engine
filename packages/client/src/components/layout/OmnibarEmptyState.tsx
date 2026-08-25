import {
  Bot,
  BookOpen,
  FileText,
  Gamepad2,
  Home,
  Link,
  MessageCircle,
  Search,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { ChatMode } from "@marinara-engine/shared";
import { omnibarScopePrefix, type OmnibarScopeId } from "../../lib/omnibar-scope";

type EmptyStateNode = {
  icon: LucideIcon;
  scope?: OmnibarScopeId;
  key: string;
  top: string;
  left: string;
  rotate: number;
};

const NODES: readonly EmptyStateNode[] = [
  { icon: Home, key: "home", top: "18%", left: "15%", rotate: -10 },
  { icon: MessageCircle, key: "chats", scope: "chat", top: "54%", left: "8%", rotate: 8 },
  { icon: Users, key: "characters", scope: "character", top: "30%", left: "35%", rotate: -5 },
  { icon: UserRound, key: "personas", scope: "persona", top: "72%", left: "28%", rotate: 7 },
  { icon: BookOpen, key: "lorebooks", scope: "lorebook", top: "20%", left: "64%", rotate: 9 },
  { icon: FileText, key: "presets", scope: "preset", top: "69%", left: "60%", rotate: -7 },
  { icon: Link, key: "connections", scope: "connection", top: "38%", left: "83%", rotate: 5 },
  { icon: Bot, key: "agents", scope: "agent", top: "78%", left: "83%", rotate: -8 },
  { icon: Settings, key: "settings", scope: "settings", top: "10%", left: "88%", rotate: 10 },
];

const MODE_ICONS: Record<ChatMode, LucideIcon> = {
  conversation: MessageCircle,
  roleplay: Users,
  game: Gamepad2,
};

const NODE_LABEL_KEYS: Record<string, string> = {
  home: "navigation.topbar.home",
  chats: "omnibar.categories.chat",
  characters: "omnibar.categories.character",
  personas: "omnibar.categories.persona",
  lorebooks: "omnibar.categories.lorebook",
  presets: "omnibar.categories.preset",
  connections: "omnibar.categories.connection",
  agents: "omnibar.categories.agent",
  settings: "omnibar.categories.settings",
};

const ENTRY_VECTORS = [
  { x: -110, y: -80 },
  { x: -150, y: 20 },
  { x: -80, y: 100 },
  { x: -10, y: 130 },
  { x: 70, y: 110 },
  { x: 150, y: 35 },
  { x: 130, y: -70 },
  { x: 35, y: -125 },
  { x: -30, y: -150 },
] as const;

const nodeVariants: Variants = {
  hidden: ({ index }: { index: number }) => ({
    opacity: 0,
    scale: 0.35,
    x: ENTRY_VECTORS[index]?.x ?? 0,
    y: ENTRY_VECTORS[index]?.y ?? 0,
    rotate: (ENTRY_VECTORS[index]?.x ?? 0) / 3,
  }),
  visible: ({ index }: { index: number }) => ({
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    rotate: NODES[index]?.rotate ?? 0,
    transition: { delay: index * 0.055, duration: 0.62, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function OmnibarEmptyState({
  activeChatMode,
  introActive,
  reduceMotion,
  onPick,
}: {
  activeChatMode?: ChatMode;
  introActive: boolean;
  reduceMotion: boolean;
  onPick: (scope: OmnibarScopeId) => void;
}) {
  const { t } = useTranslation();
  const ModeIcon = activeChatMode ? MODE_ICONS[activeChatMode] : Search;
  const intro = introActive && !reduceMotion;

  return (
    <section
      aria-label={t("omnibar.emptyState.label", "Everything is searchable here")}
      data-component="GlobalOmnibar.EmptyState"
      data-intro={intro ? "true" : "false"}
      className="omnibar-empty-state relative min-h-[19rem] flex-1 overflow-hidden px-3 pb-5 pt-3 sm:min-h-[22rem] sm:px-6"
    >
      <div className="pointer-events-none absolute inset-x-[18%] top-[28%] h-28 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_70%)]" />
      <div className="omnibar-empty-state__core absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--primary)_34%,var(--border))] bg-[color-mix(in_srgb,var(--card)_94%,var(--primary))] text-[var(--primary)] shadow-[0_0_2rem_color-mix(in_srgb,var(--primary)_12%,transparent)]">
        <ModeIcon size={22} aria-hidden="true" />
      </div>
      <div className="omnibar-empty-state__orbit absolute left-1/2 top-1/2 size-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--border)]/60" />
      <div className="omnibar-empty-state__nodes absolute inset-0">
        {NODES.map(({ icon: Icon, scope, key, top, left }, index) => {
          const label = t(NODE_LABEL_KEYS[key] ?? `omnibar.emptyState.${key}`, key);
          const content = <Icon size={17} strokeWidth={1.8} aria-hidden="true" />;
          return (
            <motion.div
              key={key}
              custom={{ index }}
              variants={nodeVariants}
              initial={intro ? "hidden" : false}
              animate="visible"
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top, left }}
            >
              {scope ? (
                <button
                  type="button"
                  title={label}
                  aria-label={t("omnibar.emptyState.searchCategory", "Search {{category}}", { category: label })}
                  onClick={() => onPick(scope)}
                  className="omnibar-empty-state__node inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,var(--primary))] text-[var(--muted-foreground)] shadow-sm transition-[color,background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_48%,var(--border))] hover:bg-[var(--accent)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-95"
                >
                  {content}
                </button>
              ) : (
                <span className="omnibar-empty-state__node inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--card)_70%,transparent)] text-[var(--muted-foreground)]/70">
                  {content}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[0.6875rem] font-medium text-[var(--muted-foreground)]/70">
        {activeChatMode
          ? t("omnibar.emptyState.contextHint", "This chat's context is ready to search")
          : t("omnibar.emptyState.hint", "Chats, characters, stories, tools, and settings")}
      </div>
      <div className="sr-only">
        {NODES.filter((node) => node.scope)
          .map((node) => `${t(NODE_LABEL_KEYS[node.key] ?? node.key, node.key)}: ${omnibarScopePrefix(node.scope!)}`)
          .join(". ")}
      </div>
    </section>
  );
}
