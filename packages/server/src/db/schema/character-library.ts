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
