// ──────────────────────────────────────────────
// Local Character Library Organization
// ──────────────────────────────────────────────

/**
 * What the user intends to do with a card.
 *
 * A controlled value rather than a tag, because "old", "todo", "review", and
 * "done" are the same four ideas spelled a dozen ways once they are freeform.
 */
export const CHARACTER_LIBRARY_STATUSES = ["active", "needs-review", "try-later", "archived", "hidden"] as const;

export type CharacterLibraryStatus = (typeof CHARACTER_LIBRARY_STATUSES)[number];

export const DEFAULT_CHARACTER_LIBRARY_STATUS: CharacterLibraryStatus = "active";

export function isCharacterLibraryStatus(value: unknown): value is CharacterLibraryStatus {
  return typeof value === "string" && (CHARACTER_LIBRARY_STATUSES as readonly string[]).includes(value);
}

export function normalizeCharacterLibraryStatus(value: unknown): CharacterLibraryStatus {
  return isCharacterLibraryStatus(value) ? value : DEFAULT_CHARACTER_LIBRARY_STATUS;
}

/**
 * Per-character library facts.
 *
 * `status` is stored. `lastUsedAt` and `chatCount` are derived from the user's
 * chats on read, so they cannot drift from the real chat history.
 */
export type CharacterLibraryEntry = {
  characterId: string;
  status: CharacterLibraryStatus;
  /** Newest message timestamp across this character's chats; null if never used. */
  lastUsedAt: string | null;
  chatCount: number;
};

/** Named result sets the library offers before any filtering. */
export const CHARACTER_LIBRARY_SHELVES = [
  "all",
  "recently-used",
  "never-used",
  "needs-review",
  "try-later",
  "archived",
] as const;

export type CharacterLibraryShelf = (typeof CHARACTER_LIBRARY_SHELVES)[number];

/**
 * Whether a character belongs on a shelf.
 *
 * Archived and hidden cards stay out of every browsing shelf except their own,
 * which is the point of having a status at all: the user wanted them out of
 * the way, not deleted.
 */
export function matchesCharacterLibraryShelf(entry: CharacterLibraryEntry, shelf: CharacterLibraryShelf): boolean {
  const putAway = entry.status === "archived" || entry.status === "hidden";
  switch (shelf) {
    case "all":
      return !putAway;
    case "recently-used":
      return !putAway && entry.lastUsedAt !== null;
    case "never-used":
      return !putAway && entry.lastUsedAt === null;
    case "needs-review":
      return entry.status === "needs-review";
    case "try-later":
      return entry.status === "try-later";
    case "archived":
      return entry.status === "archived" || entry.status === "hidden";
  }
}
