import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const storageSource = readFileSync(
  new URL("../../packages/server/src/services/storage/characters.storage.ts", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

const applyBody = storageSource.slice(
  storageSource.indexOf("async applyTagOperation("),
  storageSource.indexOf("async listTagOperationHistory("),
);

// The reversal must record only the writes that actually landed. Recording the
// plan instead would offer to "restore" cards the operation never touched.
assert.match(applyBody, /undone\.push\(\{ id: change\.id, before: change\.before \}\)/u);
assert.match(applyBody, /if \(undone\.length > 0\)/u);

// A preview must never write history.
const previewGuard = applyBody.slice(0, applyBody.indexOf("let applied"));
assert.match(previewGuard, /if \(options\.preview\)/u);
assert.doesNotMatch(previewGuard, /characterTagOperationHistory/u);

const undoBody = storageSource.slice(
  storageSource.indexOf("async undoTagOperation("),
  storageSource.indexOf("async listSummariesByIds("),
);

// Undo restores the stored previous tags, not a recomputed inverse: a merge
// loses which card carried which spelling, so there is no inverse to compute.
assert.match(undoBody, /\{ tags: change\.before \}/u);

// Restoring must not spend a card revision, matching the operation it reverses.
assert.match(undoBody, /skipVersionSnapshot: true/u);

// A consumed reversal is removed, so the same undo cannot be applied twice and
// silently overwrite later edits.
assert.match(undoBody, /db\.delete\(characterTagOperationHistory\)/u);

// History is bounded: it exists for recent mistakes, not as an audit log.
assert.match(storageSource, /async pruneTagOperationHistory\(keep = 20\)/u);

console.info("Character tag undo regression checks passed.");
