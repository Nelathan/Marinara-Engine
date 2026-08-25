import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * The empty launcher keeps the search field primary. One quiet hint explains
 * scope syntax and one deliberate action enters Professor Mari's workspace.
 */
export function OmnibarEmptyState({ onAskMari }: { onAskMari: () => void }) {
  const { t } = useTranslation();

  return (
    <div
      data-component="GlobalOmnibar.EmptyState"
      className="pointer-events-none fixed left-1/2 top-[calc(var(--omnibar-top,10vh)+5rem)] z-[101] flex w-[min(36rem,88vw)] -translate-x-1/2 flex-col items-center gap-3 text-center"
    >
      <p className="text-sm font-medium text-[var(--foreground)]/75">
        {t("omnibar.emptyState.hint", "Type to search chats, characters, lorebooks, settings, and more.")}
      </p>
      <p className="text-xs text-[var(--muted-foreground)]">
        {t("omnibar.emptyState.scopeHint", "Use a scope such as char: or lorebook: when you want a focused search.")}
      </p>
      <button
        type="button"
        onClick={onAskMari}
        title={t("omnibar.emptyState.askMari", "Ask Professor Mari")}
        className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3.5 text-xs font-semibold text-[var(--primary)] shadow-[0_0.5rem_1.5rem_color-mix(in_srgb,var(--primary)_10%,transparent)] transition-[background-color,transform,box-shadow] hover:bg-[var(--primary)]/15 hover:shadow-[0_0.65rem_1.75rem_color-mix(in_srgb,var(--primary)_16%,transparent)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <Sparkles size={14} aria-hidden="true" />
        {t("omnibar.emptyState.askMari", "Ask Professor Mari")}
      </button>
    </div>
  );
}
