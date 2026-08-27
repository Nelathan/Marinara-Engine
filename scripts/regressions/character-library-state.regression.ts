import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  matchesCharacterLibraryShelf,
  normalizeCharacterLibraryStatus,
  type CharacterLibraryEntry,
} from "../../packages/shared/src/types/character-library.js";

// Unknown or legacy values fall back to active rather than hiding a card.
assert.equal(normalizeCharacterLibraryStatus("archived"), "archived");
assert.equal(normalizeCharacterLibraryStatus("nonsense"), "active");
assert.equal(normalizeCharacterLibraryStatus(undefined), "active");

const entry = (over: Partial<CharacterLibraryEntry>): CharacterLibraryEntry => ({
  characterId: "c",
  status: "active",
  lastUsedAt: null,
  chatCount: 0,
  ...over,
});

const used = entry({ lastUsedAt: "2026-08-01T00:00:00.000Z", chatCount: 2 });
const unused = entry({});
const archived = entry({ status: "archived" });
const hidden = entry({ status: "hidden" });
const review = entry({ status: "needs-review" });

// Put-away cards stay out of every browsing shelf. That is the whole point of
// a status: the user wanted them out of the way, not deleted.
assert.equal(matchesCharacterLibraryShelf(archived, "all"), false);
assert.equal(matchesCharacterLibraryShelf(hidden, "all"), false);
assert.equal(matchesCharacterLibraryShelf(archived, "recently-used"), false);
assert.equal(matchesCharacterLibraryShelf(archived, "never-used"), false);

// ...but they remain reachable on their own shelf.
assert.equal(matchesCharacterLibraryShelf(archived, "archived"), true);
assert.equal(matchesCharacterLibraryShelf(hidden, "archived"), true);

// Used and never-used partition the active library exactly.
assert.equal(matchesCharacterLibraryShelf(used, "recently-used"), true);
assert.equal(matchesCharacterLibraryShelf(used, "never-used"), false);
assert.equal(matchesCharacterLibraryShelf(unused, "never-used"), true);
assert.equal(matchesCharacterLibraryShelf(unused, "recently-used"), false);

// Review shelves key off status, and a needs-review card still browses normally.
assert.equal(matchesCharacterLibraryShelf(review, "needs-review"), true);
assert.equal(matchesCharacterLibraryShelf(review, "all"), true);
assert.equal(matchesCharacterLibraryShelf(used, "needs-review"), false);

// Storage must not copy derivable usage into the new table: a second write
// path for last-used would be free to disagree with the real chat history.
const schemaSource = readFileSync(
  new URL("../../packages/server/src/db/schema/character-library.ts", import.meta.url),
  "utf8",
);
assert.doesNotMatch(schemaSource, /last_used|lastUsedAt|chat_count|chatCount/u);

// The status write must never touch the character card itself.
const storageSource = readFileSync(
  new URL("../../packages/server/src/services/storage/characters.storage.ts", import.meta.url),
  "utf8",
);
const setStatusBody = storageSource.slice(
  storageSource.indexOf("async setLibraryStatus("),
  storageSource.indexOf("async listSummariesByIds("),
);
assert.doesNotMatch(setStatusBody, /this\.update\(|update\(characters\)/u);

console.info("Character library state regression checks passed.");
