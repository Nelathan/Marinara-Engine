import { useLayoutEffect, useRef } from "react";
import {
  Bot,
  BookOpen,
  ChevronRight,
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
import { useTranslation } from "react-i18next";
import type { ChatMode } from "@marinara-engine/shared";
import { omnibarScopePrefix, type OmnibarScopeId } from "../../lib/omnibar-scope";

type EmptyStateNode = {
  icon: LucideIcon;
  scope?: OmnibarScopeId;
  key: string;
  /** Matches `data-topbar-hover-key` on the real top-bar button this icon flies from. */
  topbarKey: string;
  top: string;
  left: string;
  rotate: number;
  /** Fallback flight vector when the top-bar button is off-screen (mobile, collapsed bar). */
  entry: { x: number; y: number };
};

const NODES: readonly EmptyStateNode[] = [
  { icon: Home, key: "home", topbarKey: "home", top: "18%", left: "15%", rotate: -10, entry: { x: -110, y: -80 } },
  {
    icon: MessageCircle,
    key: "chats",
    scope: "chat",
    topbarKey: "chats",
    top: "54%",
    left: "8%",
    rotate: 8,
    entry: { x: -150, y: 20 },
  },
  {
    icon: Users,
    key: "characters",
    scope: "character",
    topbarKey: "characters",
    top: "30%",
    left: "35%",
    rotate: -5,
    entry: { x: -80, y: 100 },
  },
  {
    icon: UserRound,
    key: "personas",
    scope: "persona",
    topbarKey: "personas",
    top: "72%",
    left: "28%",
    rotate: 7,
    entry: { x: -10, y: 130 },
  },
  {
    icon: BookOpen,
    key: "lorebooks",
    scope: "lorebook",
    topbarKey: "lorebooks",
    top: "20%",
    left: "64%",
    rotate: 9,
    entry: { x: 70, y: 110 },
  },
  {
    icon: FileText,
    key: "presets",
    scope: "preset",
    topbarKey: "presets",
    top: "69%",
    left: "60%",
    rotate: -7,
    entry: { x: 150, y: 35 },
  },
  {
    icon: Link,
    key: "connections",
    scope: "connection",
    topbarKey: "connections",
    top: "38%",
    left: "83%",
    rotate: 5,
    entry: { x: 130, y: -70 },
  },
  {
    icon: Bot,
    key: "agents",
    scope: "agent",
    topbarKey: "agents",
    top: "78%",
    left: "83%",
    rotate: -8,
    entry: { x: 35, y: -125 },
  },
  {
    icon: Settings,
    key: "settings",
    scope: "settings",
    topbarKey: "settings",
    top: "10%",
    left: "88%",
    rotate: 10,
    entry: { x: -30, y: -150 },
  },
];

const nodeByKey = (key: string) => NODES.find((node) => node.key === key)!;

/** The context chain reads left to right: what the open chat is made of. */
const CHAIN_KEYS = ["chats", "characters", "personas", "lorebooks", "presets", "connections"] as const;

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

const NODE_BUTTON_CLASS =
  "omnibar-empty-state__node inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,var(--primary))] text-[var(--muted-foreground)] shadow-sm transition-[color,background-color,border-color] hover:border-[color-mix(in_srgb,var(--primary)_48%,var(--border))] hover:bg-[var(--accent)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

/**
 * Fly each icon in from the on-screen position of the top-bar button it stands
 * for, so the intro reads as "the whole top bar collects into this one field".
 * Positions are measured at run time — hard-coded coordinates would drift on
 * every breakpoint. Nodes whose button is hidden fall back to a fixed vector.
 */
function useTopbarFlight(active: boolean) {
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const register = (key: string) => (element: HTMLElement | null) => {
    if (element) nodeRefs.current.set(key, element);
    else nodeRefs.current.delete(key);
  };

  useLayoutEffect(() => {
    if (!active) return;
    const entries = [...nodeRefs.current.entries()];
    for (const [key, element] of entries) {
      const node = nodeByKey(key);
      const source = document.querySelector(`[data-topbar-hover-key="${node.topbarKey}"]`);
      const target = element.getBoundingClientRect();
      let dx = node.entry.x;
      let dy = node.entry.y;
      if (source) {
        const from = source.getBoundingClientRect();
        dx = from.left + from.width / 2 - (target.left + target.width / 2);
        dy = from.top + from.height / 2 - (target.top + target.height / 2);
      }
      element.style.transition = "none";
      element.style.opacity = "0";
      element.style.transform = `translate(${dx}px, ${dy}px) scale(0.35) rotate(${dx / 8}deg)`;
    }
    const frame = requestAnimationFrame(() => {
      entries.forEach(([key, element], index) => {
        element.style.transition = `transform 620ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 55}ms, opacity 320ms ease-out ${index * 55}ms`;
        element.style.opacity = "1";
        element.style.transform = `translate(0px, 0px) scale(1) rotate(${nodeByKey(key).rotate}deg)`;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return register;
}

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
  const intro = introActive && !reduceMotion;
  const register = useTopbarFlight(intro);
  const label = (key: string) => t(NODE_LABEL_KEYS[key] ?? `omnibar.emptyState.${key}`, key);

  const renderNode = (node: EmptyStateNode, extraClass = "") => {
    const text = label(node.key);
    const Icon = node.key === "chats" && activeChatMode ? MODE_ICONS[activeChatMode] : node.icon;
    const content = <Icon size={17} strokeWidth={1.8} aria-hidden="true" />;
    const style = { transform: `rotate(${node.rotate}deg)` };
    return node.scope ? (
      <button
        type="button"
        ref={register(node.key)}
        title={text}
        aria-label={t("omnibar.emptyState.searchCategory", "Search {{category}}", { category: text })}
        onClick={() => onPick(node.scope!)}
        style={style}
        className={`${NODE_BUTTON_CLASS} ${extraClass}`}
      >
        {content}
      </button>
    ) : (
      <span
        ref={register(node.key)}
        style={style}
        className={`omnibar-empty-state__node inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--card)_70%,transparent)] text-[var(--muted-foreground)]/70 ${extraClass}`}
      >
        {content}
      </span>
    );
  };

  const ModeIcon = activeChatMode ? MODE_ICONS[activeChatMode] : Search;

  return (
    <section
      aria-label={t("omnibar.emptyState.label", "Everything is searchable here")}
      data-component="GlobalOmnibar.EmptyState"
      data-intro={intro ? "true" : "false"}
      className="omnibar-empty-state relative min-h-[19rem] flex-1 overflow-hidden px-3 pb-5 pt-3 sm:min-h-[22rem] sm:px-6"
    >
      <div className="pointer-events-none absolute inset-x-[18%] top-[28%] h-28 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_70%)]" />

      {activeChatMode ? (
        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {CHAIN_KEYS.map((key, index) => (
            <div key={key} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 ? (
                <ChevronRight size={14} className="shrink-0 text-[var(--muted-foreground)]/45" aria-hidden="true" />
              ) : null}
              {renderNode(nodeByKey(key))}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="omnibar-empty-state__core absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--primary)_34%,var(--border))] bg-[color-mix(in_srgb,var(--card)_94%,var(--primary))] text-[var(--primary)] shadow-[0_0_2rem_color-mix(in_srgb,var(--primary)_12%,transparent)]">
            <ModeIcon size={22} aria-hidden="true" />
          </div>
          <div className="omnibar-empty-state__orbit absolute left-1/2 top-1/2 size-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--border)]/60" />
          <div className="absolute inset-0">
            {NODES.map((node) => (
              <div
                key={node.key}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: node.top, left: node.left }}
              >
                {renderNode(node)}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[0.6875rem] font-medium text-[var(--muted-foreground)]/70">
        {activeChatMode
          ? t("omnibar.emptyState.contextHint", "This chat's context is ready to search")
          : t("omnibar.emptyState.hint", "Chats, characters, stories, tools, and settings")}
      </div>
      <div className="sr-only">
        {NODES.filter((node) => node.scope)
          .map((node) => `${label(node.key)}: ${omnibarScopePrefix(node.scope!)}`)
          .join(". ")}
      </div>
    </section>
  );
}
