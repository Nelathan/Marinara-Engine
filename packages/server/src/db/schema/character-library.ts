// ──────────────────────────────────────────────
// Schema: Local Character Library Organization
// ──────────────────────────────────────────────
import { fileTable, text } from "../file-schema.js";

/**
 * Local, per-install organization state for a character.
 *
 * Deliberately separate from the character card: this is the user's view of
 * their own library, not card content, so it must never reach an export or
 * bump a card revision.
 *
 * Deliberately minimal. "Last used", "never used", and chat counts are all
 * derivable from `chats.characterIds` and `chats.lastMessageAt`, so storing
 * them here would only create a second copy that can drift. Status is the one
 * thing nothing else in the store already knows.
 */
export const characterLibraryState = fileTable("character_library_state", {
  characterId: text("character_id").primaryKey(),
  /** active | needs-review | try-later | archived | hidden */
  status: text("status").notNull().default("active"),
  updatedAt: text("updated_at").notNull(),
});

/**
 * Reversal record for a library-wide tag operation.
 *
 * Merge and delete rewrite many cards at once and cannot be reversed by
 * repeating them: merging "slowburn" into "slow burn" loses which cards had
 * which spelling. Storing the previous tag list per affected card is the only
 * way back.
 *
 * Local organization history, never card content, so it is not exported and
 * does not appear in card versions.
 */
export const characterTagOperationHistory = fileTable("character_tag_operation_history", {
  id: text("id").primaryKey(),
  /** rename | delete */
  kind: text("kind").notNull(),
  /** Human-readable summary, e.g. the tags involved. */
  summary: text("summary").notNull().default(""),
  /** JSON array of { id, before } — the tag list each card had beforehand. */
  changes: text("changes").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
});
