import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, X } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { api } from "../../../lib/api-client";
import BeholderDoll, { type BeholderDollLayout } from "./BeholderDoll";
import "./dock.css";

type BeholderStateResponse = {
  state: { characters: Array<{ name: string; species?: string; body: Record<string, unknown> }> };
  messageId: string | null;
  createdAt: string | null;
};

const LAYOUT_STORAGE_KEY = "marinara.beholder.layout";
const LAYOUTS: readonly BeholderDollLayout[] = ["paired", "columns", "list"];

function readStoredLayout(): BeholderDollLayout {
  if (typeof window === "undefined") return "paired";
  const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  return LAYOUTS.includes(stored as BeholderDollLayout) ? (stored as BeholderDollLayout) : "paired";
}

/**
 * The physical-state dock.
 *
 * It docks to the right of the roleplay view rather than floating over it, because
 * Marinara already knows how to make room for a right-side panel — so opening Beholder
 * shifts the chat instead of covering it. Position is measured from the live layout each
 * time it opens: `--bh-dock-top` from the app bar, `--bh-dock-right` from whatever is
 * already occupying the right edge, so it never parks on top of another panel.
 */
export default function BeholderDock({
  chatId,
  open,
  onClose,
}: {
  chatId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t: localizeUi } = useUiTranslation();
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<BeholderDollLayout>(readStoredLayout);
  const [activeName, setActiveName] = useState<string | null>(null);

  const queryKey = useMemo(() => ["beholder-state", chatId] as const, [chatId]);
  const stateQuery = useQuery({
    queryKey,
    queryFn: () => api.get<BeholderStateResponse>(`/agents/beholder-state/${encodeURIComponent(chatId)}`),
    staleTime: 30_000,
    enabled: open,
  });

  useEffect(() => {
    const onGenerationComplete = (event: Event) => {
      const detail = (event as CustomEvent<{ chatId?: string }>).detail;
      if (detail?.chatId === chatId) void queryClient.invalidateQueries({ queryKey });
    };
    window.addEventListener("marinara:generation-complete", onGenerationComplete);
    return () => window.removeEventListener("marinara:generation-complete", onGenerationComplete);
  }, [chatId, queryClient, queryKey]);

  // A narrow viewport gets the compact list; a wide one restores the chosen layout.
  useEffect(() => {
    const apply = () => setLayout(window.innerWidth < 768 ? "list" : readStoredLayout());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const syncDockOffset = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const main = document.querySelector(".mari-main");
    if (main) {
      const offset = Math.max(0, Math.round(window.innerWidth - main.getBoundingClientRect().right));
      panel.style.setProperty("--bh-dock-right", `${offset}px`);
    }
    const topbar = document.querySelector("header.mari-topbar");
    panel.style.setProperty("--bh-dock-top", `${topbar ? Math.round(topbar.getBoundingClientRect().bottom) : 0}px`);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    syncDockOffset();
    window.addEventListener("resize", syncDockOffset);
    return () => window.removeEventListener("resize", syncDockOffset);
  }, [open, syncDockOffset]);

  // Marinara reflows the chat around a right-side panel off this class.
  useEffect(() => {
    document.body.classList.toggle("bh-dock-open", open);
    return () => document.body.classList.remove("bh-dock-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const chooseLayout = useCallback((next: BeholderDollLayout) => {
    setLayout(next);
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
    } catch {
      // A blocked storage write must not break the dock.
    }
  }, []);

  const characters = stateQuery.data?.state.characters ?? [];

  return createPortal(
    <div
      ref={panelRef}
      data-chat-floating-panel
      className={`beholder-panel bh-embedded${open ? "" : " bh-collapsed"}`}
      data-empty={characters.length === 0 ? "true" : "false"}
      aria-hidden={open ? undefined : true}
    >
      <div className="bh-dock-header">
        <Eye size="0.875rem" className="text-[var(--primary)]" />
        <span className="flex-1 text-[0.75rem] font-semibold">{localizeUi("ui.chat.beholder.dockTitle")}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]"
          title={localizeUi("ui.chat.beholder.dockClose")}
          aria-label={localizeUi("ui.chat.beholder.dockClose")}
        >
          <X size="0.875rem" />
        </button>
      </div>
      {characters.length === 0 && !stateQuery.isLoading ? (
        <p className="p-3 text-[0.625rem] leading-snug text-[var(--muted-foreground)]">
          {localizeUi("ui.chat.beholder.emptyState")}
        </p>
      ) : (
        <BeholderDoll
          characters={characters}
          activeName={activeName}
          layout={layout}
          onSelectCharacter={setActiveName}
          onSelectLayout={chooseLayout}
        />
      )}
    </div>,
    document.body,
  );
}
