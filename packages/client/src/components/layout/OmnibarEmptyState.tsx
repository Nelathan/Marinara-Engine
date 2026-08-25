import { ArrowUp, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ChatMode } from "@marinara-engine/shared";
import { omnibarScopePrefix, type OmnibarScopeId } from "../../lib/omnibar-scope";
import {
  INTRO_ICONS,
  MARI_BLINK_URL,
  MARI_PEEK_URL,
  MODE_ICONS,
  type OmnibarIconEntry,
} from "./omnibar-empty-state-icons";

const entry = (key: string) => INTRO_ICONS.find((item) => item.key === key)!;

/** What the open chat is made of, left to right. */
const CHAIN_KEYS = ["chats", "characters", "personas", "lorebooks", "presets", "connections"] as const;

const CHIP_CLASS =
  "group inline-flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

/**
 * The idle hint field. It sits in the empty screen *below* the collapsed bar —
 * never inside it — so an empty omnibar stays a bare bar while the room under
 * it explains what the bar reaches. Arrows point back up at the field.
 */
export function OmnibarEmptyState({
  activeChatMode,
  onPick,
  onAskMari,
}: {
  activeChatMode?: ChatMode;
  onPick: (scope: OmnibarScopeId) => void;
  onAskMari: () => void;
}) {
  const { t } = useTranslation();
  const scoped = INTRO_ICONS.filter((item) => item.scope);

  const renderChip = (item: OmnibarIconEntry) => {
    const text = t(item.labelKey, item.key);
    const Icon = item.key === "chats" && activeChatMode ? MODE_ICONS[activeChatMode] : item.icon;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => onPick(item.scope!)}
        title={t("omnibar.emptyState.searchCategory", "Search {{category}}", { category: text })}
        className={CHIP_CLASS}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm transition-colors group-hover:border-[var(--primary)]/50 group-hover:text-[var(--primary)]">
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="text-[0.6875rem] font-medium">{text}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mari keeps the spot the intro left her on, so she never blinks out. */}
      <button
        type="button"
        onClick={onAskMari}
        title={t("omnibar.emptyState.askMari", "Ask Professor Mari")}
        className="omnibar-mari-anchor omnibar-mari-anchor--idle z-[101]"
      >
        <img src={MARI_PEEK_URL} alt="" draggable={false} data-part="idle" />
        <img src={MARI_BLINK_URL} alt="" draggable={false} data-part="blink" />
      </button>
      <p className="omnibar-mari-bubble omnibar-mari-bubble--idle z-[101]">
        {t("omnibar.intro.line", "And this is where I live. Search for a thing, or just ask me for it.")}
      </p>

      <div
        data-component="GlobalOmnibar.EmptyState"
        className="pointer-events-none fixed left-1/2 top-[calc(var(--omnibar-top,10vh)+5rem)] z-[101] hidden w-[min(52rem,92vw)] -translate-x-1/2 flex-col items-center gap-3 text-center sm:flex"
      >
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <ArrowUp size={16} className="omnibar-hint-arrow" aria-hidden="true" />
          <span className="text-xs font-semibold text-white/70">
            {activeChatMode
              ? t("omnibar.emptyState.contextHint", "This chat's context is ready to search")
              : t("omnibar.emptyState.hint", "Everything below is one keystroke away in that bar")}
          </span>
          <ArrowUp size={16} className="omnibar-hint-arrow" aria-hidden="true" />
        </div>

        {activeChatMode ? (
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1">
            {CHAIN_KEYS.map((key, index) => (
              <div key={key} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight size={14} className="shrink-0 text-white/25" aria-hidden="true" /> : null}
                {renderChip(entry(key))}
              </div>
            ))}
          </div>
        ) : (
          <div className="pointer-events-auto flex flex-wrap items-start justify-center gap-1">
            {scoped.map(renderChip)}
          </div>
        )}

        <p className="text-[0.6875rem] font-medium text-white/40">
          {scoped.map((item) => omnibarScopePrefix(item.scope!)).join("  ")}
        </p>
      </div>
    </>
  );
}
