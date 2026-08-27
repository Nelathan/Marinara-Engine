// ──────────────────────────────────────────────
// Character tag index and tag filtering
// ──────────────────────────────────────────────
import { normalizeTextForMatch } from "./text-matching.js";

/**
 * One canonical tag plus every spelling that collapses onto it.
 *
 * Imported cards spell the same idea many ways (`Fantasy`, `fantasy`,
 * ` fantasy `). Filtering already treats those as equal, so the index does
 * too, and keeps the variants so cleanup tools can show what was merged.
 */
export type CharacterTagIndexEntry = {
  /** Canonical key. Case-, width-, and whitespace-insensitive. */
  key: string;
  /** Spelling shown in the UI: the most common variant, ties broken by sort. */
  label: string;
  /** Characters carrying this tag. A card with two variants counts once. */
  count: number;
  /** Every distinct raw spelling that normalizes to `key`, sorted. */
  variants: string[];
};

export type CharacterTagMatchMode = "any" | "all";

export type CharacterTagFilter = {
  /** Canonical keys that a character must carry. */
  include: readonly string[];
  /** Canonical keys that disqualify a character. */
  exclude: readonly string[];
  mode: CharacterTagMatchMode;
};

export const EMPTY_CHARACTER_TAG_FILTER: CharacterTagFilter = { include: [], exclude: [], mode: "any" };

/** Canonical key for a tag value. Empty string means "not a usable tag". */
export function characterTagKey(tag: unknown): string {
  return normalizeTextForMatch(tag);
}

/** Canonical keys carried by one character, deduplicated. */
export function characterTagKeys(tags: readonly unknown[] | undefined): Set<string> {
  const keys = new Set<string>();
  for (const tag of tags ?? []) {
    const key = characterTagKey(tag);
    if (key) keys.add(key);
  }
  return keys;
}

/**
 * Count tags across every character in the library.
 *
 * Takes tag lists rather than characters so the server, the client, and the
 * regression can all share one counting rule.
 */
export function buildCharacterTagIndex(tagLists: Iterable<readonly unknown[] | undefined>): CharacterTagIndexEntry[] {
  const counts = new Map<string, { count: number; variants: Map<string, number> }>();

  for (const tags of tagLists) {
    // Per character, not per value: `Fantasy` and `fantasy` on one card is one card.
    const seen = new Set<string>();
    for (const tag of tags ?? []) {
      if (typeof tag !== "string") continue;
      const key = characterTagKey(tag);
      if (!key) continue;
      let entry = counts.get(key);
      if (!entry) {
        entry = { count: 0, variants: new Map() };
        counts.set(key, entry);
      }
      entry.variants.set(tag.trim(), (entry.variants.get(tag.trim()) ?? 0) + 1);
      if (seen.has(key)) continue;
      seen.add(key);
      entry.count += 1;
    }
  }

  return [...counts.entries()]
    .map(([key, entry]) => {
      // Codepoint order, not localeCompare: variant order is part of the stored
      // index, so it must not shift with the host's ICU locale.
      const variants = [...entry.variants.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      const label =
        variants.reduce<string | null>((best, variant) => {
          if (best === null) return variant;
          const diff = (entry.variants.get(variant) ?? 0) - (entry.variants.get(best) ?? 0);
          return diff > 0 ? variant : best;
        }, null) ?? key;
      return { key, label, count: entry.count, variants };
    })
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** Whether a character's raw tag values satisfy an include/exclude filter. */
export function matchesCharacterTagFilter(tags: readonly unknown[] | undefined, filter: CharacterTagFilter): boolean {
  if (filter.include.length === 0 && filter.exclude.length === 0) return true;
  const keys = characterTagKeys(tags);
  if (filter.exclude.some((key) => keys.has(key))) return false;
  if (filter.include.length === 0) return true;
  return filter.mode === "all"
    ? filter.include.every((key) => keys.has(key))
    : filter.include.some((key) => keys.has(key));
}

/**
 * A library-wide tag edit.
 *
 * Rename and merge are the same operation: renaming several source keys onto
 * one target is a merge. Keeping them as one code path means the preview,
 * the write, and the duplicate handling cannot drift apart.
 */
export type CharacterTagOperation =
  | { type: "rename"; from: readonly string[]; to: string }
  | { type: "delete"; keys: readonly string[] };

export type CharacterTagOperationChange = {
  id: string;
  before: string[];
  after: string[];
};

export type CharacterTagOperationPlan = {
  changes: CharacterTagOperationChange[];
  /** Cards that carry one of the tags but need no write. */
  unchanged: number;
  /** Distinct canonical keys the operation removes or rewrites. */
  affectedKeys: string[];
};

export type CharacterTagOperationCard = {
  id: string;
  tags: readonly unknown[] | undefined;
};

function sameTags(before: readonly string[], after: readonly string[]) {
  return before.length === after.length && before.every((tag, index) => tag === after[index]);
}

/**
 * Work out what a tag operation would write, without writing it.
 *
 * Pure so the preview the user confirms and the write that follows are
 * produced by the same code.
 */
export function planCharacterTagOperation(
  cards: readonly CharacterTagOperationCard[],
  operation: CharacterTagOperation,
): CharacterTagOperationPlan {
  const targets = new Set(
    (operation.type === "rename" ? operation.from : operation.keys).map(characterTagKey).filter(Boolean),
  );
  const renameTo = operation.type === "rename" ? operation.to.trim() : "";
  const renameToKey = characterTagKey(renameTo);
  if (operation.type === "rename" && !renameToKey) {
    return { changes: [], unchanged: 0, affectedKeys: [] };
  }
  // Renaming a key onto itself is a re-spelling, not a no-op: the target
  // spelling still has to replace the old one on every card.

  const changes: CharacterTagOperationChange[] = [];
  const affectedKeys = new Set<string>();
  let unchanged = 0;

  for (const card of cards) {
    const before = (card.tags ?? []).filter((tag): tag is string => typeof tag === "string");
    if (!before.some((tag) => targets.has(characterTagKey(tag)))) continue;

    const after: string[] = [];
    const seen = new Set<string>();
    for (const tag of before) {
      const key = characterTagKey(tag);
      if (!key) continue;
      if (targets.has(key)) {
        affectedKeys.add(key);
        if (operation.type === "delete") continue;
        // Merging can collide with a tag the card already had; keep one.
        if (seen.has(renameToKey)) continue;
        seen.add(renameToKey);
        after.push(renameTo);
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      after.push(tag);
    }

    if (sameTags(before, after)) {
      unchanged += 1;
      continue;
    }
    changes.push({ id: card.id, before, after });
  }

  return { changes, unchanged, affectedKeys: [...affectedKeys].sort() };
}
