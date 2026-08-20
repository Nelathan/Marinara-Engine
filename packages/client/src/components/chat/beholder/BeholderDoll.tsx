import { useEffect, useMemo, useRef, useState } from "react";
import { renderDollPanel, setDollLayout } from "./paperdoll.js";
import "./paperdoll.css";

export type BeholderDollView = "front" | "back";
export type BeholderDollLayout = "paired" | "columns" | "list";

export interface BeholderDollCharacter {
  name: string;
  species?: string;
  body: Record<string, unknown>;
}

/**
 * The reference extractor's paper doll, rendered as it was designed.
 *
 * `paperdoll.ts` is a port of that renderer and emits its own markup — an SVG
 * silhouette with a region per body slot, tinted by armour damage and wound severity,
 * plus the slot cards around it. It is kept as markup rather than rebuilt in JSX so it
 * stays diffable against its source; this component only feeds it state and mounts the
 * result. Every value it interpolates is escaped inside the renderer.
 */
export default function BeholderDoll({
  characters,
  activeName,
  updatedNames,
  layout = "paired",
  onSelectCharacter,
  onSelectLayout,
}: {
  characters: BeholderDollCharacter[];
  activeName?: string | null;
  updatedNames?: ReadonlySet<string>;
  layout?: BeholderDollLayout;
  onSelectCharacter?: (name: string) => void;
  onSelectLayout?: (layout: BeholderDollLayout) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<BeholderDollView>("front");

  // The renderer keys state by character name, the shape the reference panel uses.
  const stateByName = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const character of characters) {
      out[character.name] = {
        ...(character.species ? { species: character.species } : {}),
        body: character.body,
      };
    }
    return out;
  }, [characters]);

  const markup = useMemo(() => {
    setDollLayout(layout);
    const active = activeName ?? characters[0]?.name ?? null;
    // The renderer returns { html, activeName } — it resolves the active character
    // itself when the caller's choice is no longer present.
    const rendered = renderDollPanel(stateByName, active, updatedNames ?? new Set(), view) as {
      html: string;
      activeName: string | null;
    };
    return rendered.html ?? "";
  }, [stateByName, activeName, characters, updatedNames, layout, view]);

  // The markup carries its own controls. Delegate from the host so the buttons the
  // renderer draws drive React state: the view toggle also carries data-char, so it is
  // matched first and the character tabs are matched after it.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest(".bh-view-toggle")) {
        setView((current) => (current === "front" ? "back" : "front"));
        return;
      }

      const layoutButton = target.closest<HTMLElement>("[data-layout]");
      const nextLayout = layoutButton?.dataset.layout;
      if (nextLayout && (nextLayout === "paired" || nextLayout === "columns" || nextLayout === "list")) {
        onSelectLayout?.(nextLayout);
        return;
      }

      const characterTab = target.closest<HTMLElement>("button[data-char]");
      const name = characterTab?.dataset.char;
      if (name) onSelectCharacter?.(name);
    };
    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [onSelectCharacter, onSelectLayout]);

  return (
    <div
      ref={hostRef}
      className="beholder-panel bh-embedded"
      data-empty={characters.length === 0 ? "true" : "false"}
      // The renderer escapes every interpolated value; see escapeHtml in paperdoll.ts.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
