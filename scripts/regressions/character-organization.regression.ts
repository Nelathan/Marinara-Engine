import assert from "node:assert/strict";
import {
  findDuplicateCharacterPairs,
  findDuplicateTagGroups,
  suggestTagsFromSimilar,
} from "../../packages/shared/src/utils/character-organization.js";

// ── Duplicate tags: punctuation and case only ──
const groups = findDuplicateTagGroups([
  { key: "slow burn", label: "slow burn", count: 9 },
  { key: "slow-burn", label: "slow-burn", count: 2 },
  { key: "slowburn", label: "slowburn", count: 4 },
  { key: "vampire", label: "vampire", count: 12 },
  { key: "vampires", label: "vampires", count: 3 },
  { key: "fantasy", label: "fantasy", count: 42 },
]);

const slowBurn = groups.find((group) => group.canonicalKey === "slow burn");
assert.ok(slowBurn, "punctuation variants must group");
// The most used spelling absorbs the others.
assert.deepEqual(slowBurn.duplicateKeys.sort(), ["slow-burn", "slowburn"]);
assert.equal(slowBurn.confidence, "high");
assert.equal(slowBurn.reason, "same-letters");

// Singular/plural is reported, but only as "possible".
const vampire = groups.find((group) => group.canonicalKey === "vampire");
assert.ok(vampire, "singular/plural must be reported");
assert.deepEqual(vampire.duplicateKeys, ["vampires"]);
assert.equal(vampire.confidence, "possible");
assert.equal(vampire.reason, "singular-plural");

// A tag with no variant is never proposed for merging.
assert.equal(
  groups.some((group) => group.canonicalKey === "fantasy"),
  false,
);

// Near-miss words must NOT merge. One edit apart is not evidence of sameness,
// and a wrong merge cannot be undone by merging back.
assert.deepEqual(
  findDuplicateTagGroups([
    { key: "fantasy", label: "fantasy", count: 5 },
    { key: "fantast", label: "fantast", count: 1 },
    { key: "horror", label: "horror", count: 3 },
    { key: "honor", label: "honor", count: 2 },
  ]),
  [],
);

// Short words and "ss" endings are excluded from plural folding, so "bass"
// and "bas", or "gas" and "ga", never collapse.
assert.deepEqual(
  findDuplicateTagGroups([
    { key: "bass", label: "bass", count: 2 },
    { key: "bas", label: "bas", count: 1 },
  ]),
  [],
);

// ── Tag suggestions come with evidence ──
const suggestions = suggestTagsFromSimilar(
  ["vampire"],
  [
    { id: "1", name: "Mira", tags: ["vampire", "romance", "dark"], similarity: 0.9 },
    { id: "2", name: "Kael", tags: ["romance", "dark"], similarity: 0.8 },
    { id: "3", name: "Ines", tags: ["romance"], similarity: 0.7 },
    { id: "4", name: "Otto", tags: ["comedy"], similarity: 0.2 },
  ],
);

// A tag the character already carries is never suggested back to it.
assert.equal(
  suggestions.some((suggestion) => suggestion.tagKey === "vampire"),
  false,
);

// Ranked by weighted support, and every suggestion names its sources.
assert.equal(suggestions[0].tagKey, "romance");
assert.deepEqual(suggestions[0].evidence, ["Mira", "Kael", "Ines"]);
assert.equal(suggestions[0].support, 3);
assert.equal(suggestions[0].confidence, "high");

// Two supporters is "possible", not "high".
const dark = suggestions.find((suggestion) => suggestion.tagKey === "dark");
assert.equal(dark?.support, 2);
assert.equal(dark?.confidence, "possible");

// A tag held by a single neighbour falls below the support floor.
assert.equal(
  suggestions.some((suggestion) => suggestion.tagKey === "comedy"),
  false,
);

// ── Duplicate characters are reported, never acted on ──
const pairs = findDuplicateCharacterPairs([
  { leftId: "a", leftName: "Mira", rightId: "b", rightName: "Mira v2", similarity: 0.95 },
  { leftId: "c", leftName: "Kael", rightId: "d", rightName: "Ines", similarity: 0.8 },
  { leftId: "e", leftName: "Otto", rightId: "f", rightName: "Rune", similarity: 0.4 },
]);
assert.equal(pairs.length, 2);
assert.equal(pairs[0].confidence, "high");
assert.equal(pairs[1].confidence, "possible");

console.info("Character organization regression checks passed.");

// ── Trust boundaries the desk must keep ──
const { readFileSync } = await import("node:fs");
const serviceSource = readFileSync(
  new URL("../../packages/server/src/services/character-organization.service.ts", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

// Proposals are read-only. If this service ever writes, an "AI suggestion"
// silently edits cards the user never approved.
assert.doesNotMatch(serviceSource, /db\.(update|insert|delete)\(/u);

// It must degrade rather than fail when no embedder is present: the tag-name
// cleanup needs no embeddings and is the most useful part on a cold library.
assert.match(serviceSource, /if \(!semanticAvailable\)/u);
assert.match(serviceSource, /semanticAvailable: false, duplicateTags/u);

const deskSource = readFileSync(
  new URL("../../packages/client/src/components/characters/CharacterOrganizationDesk.tsx", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

// Similar characters are reported, never acted on: no apply/merge/delete
// handler may exist for that section.
assert.doesNotMatch(deskSource, /onMergeCharacters|onDeleteCharacter/u);

console.info("Character organization trust-boundary checks passed.");
