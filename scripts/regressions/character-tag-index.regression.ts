import assert from "node:assert/strict";
import {
  buildCharacterTagIndex,
  characterTagKey,
  matchesCharacterTagFilter,
} from "../../packages/shared/src/utils/character-tags.js";

// Case, padding, and width variants collapse onto one canonical key.
assert.equal(characterTagKey("  Slow Burn  "), "slow burn");
assert.equal(characterTagKey("SLOW   BURN"), "slow burn");
assert.equal(characterTagKey(""), "");
assert.equal(characterTagKey(undefined), "");

const index = buildCharacterTagIndex([
  ["Fantasy", "romance", "slow burn"],
  ["fantasy", "Romance"],
  ["fantasy", "Fantasy", " fantasy "], // one card, three spellings
  undefined,
  ["", "   ", 42 as unknown as string],
]);

const byKey = new Map(index.map((entry) => [entry.key, entry]));

// A card carrying several spellings of one tag counts once.
assert.equal(byKey.get("fantasy")?.count, 3);
assert.equal(byKey.get("romance")?.count, 2);
assert.equal(byKey.get("slow burn")?.count, 1);

// Blank and non-string values never become tags.
assert.equal(byKey.has(""), false);
assert.equal(index.length, 3);

// Display label is the most common spelling; every variant stays recoverable.
assert.equal(byKey.get("fantasy")?.label, "fantasy");
assert.deepEqual(byKey.get("fantasy")?.variants, ["Fantasy", "fantasy"]);
// Codepoint order, so the index does not shift with the host locale.

// Sorted by count, then key, so the order is stable across runs.
assert.deepEqual(
  index.map((entry) => entry.key),
  ["fantasy", "romance", "slow burn"],
);

const tags = ["Fantasy", "Romance"];

// Match-any needs one hit, match-all needs every hit.
assert.equal(matchesCharacterTagFilter(tags, { include: ["fantasy", "horror"], exclude: [], mode: "any" }), true);
assert.equal(matchesCharacterTagFilter(tags, { include: ["fantasy", "horror"], exclude: [], mode: "all" }), false);
assert.equal(matchesCharacterTagFilter(tags, { include: ["fantasy", "romance"], exclude: [], mode: "all" }), true);

// Exclusion wins over inclusion.
assert.equal(matchesCharacterTagFilter(tags, { include: ["fantasy"], exclude: ["romance"], mode: "any" }), false);

// An empty filter matches everything, including untagged cards.
assert.equal(matchesCharacterTagFilter(tags, { include: [], exclude: [], mode: "all" }), true);
assert.equal(matchesCharacterTagFilter(undefined, { include: [], exclude: [], mode: "any" }), true);
assert.equal(matchesCharacterTagFilter(undefined, { include: ["fantasy"], exclude: [], mode: "any" }), false);

console.info("Character tag index regression checks passed.");
