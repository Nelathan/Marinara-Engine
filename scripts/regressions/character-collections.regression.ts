import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { libraryFolderScopeSchema } from "../../packages/shared/src/schemas/library-folder.schema.js";

// Collections reuse the existing folder table rather than a parallel schema.
assert.equal(libraryFolderScopeSchema.safeParse("character-collections").success, true);
assert.equal(libraryFolderScopeSchema.safeParse("lorebooks").success, true);
assert.equal(libraryFolderScopeSchema.safeParse("nonsense").success, false);

const storageSource = readFileSync(
  new URL("../../packages/server/src/services/storage/library-folders.storage.ts", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

const addBody = storageSource.slice(
  storageSource.indexOf("async addItems("),
  storageSource.indexOf("async removeItems("),
);
const moveBody = storageSource.slice(
  storageSource.indexOf("async moveItems("),
  storageSource.indexOf("async migrate("),
);

// The single difference between a folder and a collection: moveItems strips
// the moved IDs from every other folder, addItems must not. If addItems ever
// grows that strip, collections silently become exclusive folders again.
assert.match(moveBody, /filter\(\(id\) => !movingIds\.has\(id\)\)/u);
assert.doesNotMatch(addBody, /movingIds|filter\(\(id\) => !/u);

// Adding is idempotent: re-adding a member must not duplicate it.
assert.match(addBody, /if \(!nextIds\.includes\(id\)\) nextIds\.push\(id\)/u);

// Removing from a collection must not delete the character itself.
const removeBody = storageSource.slice(
  storageSource.indexOf("async removeItems("),
  storageSource.indexOf("async moveItems("),
);
assert.doesNotMatch(removeBody, /db\.delete\(/u);

console.info("Character collections regression checks passed.");
