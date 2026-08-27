import assert from "node:assert/strict";
import { planCharacterTagOperation } from "../../packages/shared/src/utils/character-tags.js";

const cards = [
  { id: "a", tags: ["slowburn", "romance"] },
  { id: "b", tags: ["slow burn", "fantasy"] },
  { id: "c", tags: ["Slow-Burn"] },
  { id: "d", tags: ["fantasy"] },
  { id: "e", tags: undefined },
];

// Merge: several source keys collapse onto one target spelling.
const merge = planCharacterTagOperation(cards, {
  type: "rename",
  from: ["slowburn", "slow-burn"],
  to: "slow burn",
});
assert.deepEqual(
  merge.changes.map((change) => change.id),
  ["a", "c"],
);
assert.deepEqual(merge.changes[0].after, ["slow burn", "romance"]);
assert.deepEqual(merge.affectedKeys, ["slow-burn", "slowburn"]);

// Card "b" already spells it the target way, so it is counted, not rewritten.
assert.equal(merge.unchanged, 0);

// A merge that collides with a tag the card already carries keeps one copy.
const collide = planCharacterTagOperation([{ id: "x", tags: ["slowburn", "slow burn", "romance"] }], {
  type: "rename",
  from: ["slowburn"],
  to: "slow burn",
});
assert.deepEqual(collide.changes[0].after, ["slow burn", "romance"]);

// Re-spelling a key onto itself still rewrites the stored value.
const respell = planCharacterTagOperation([{ id: "x", tags: ["FANTASY"] }], {
  type: "rename",
  from: ["fantasy"],
  to: "Fantasy",
});
assert.deepEqual(respell.changes[0].after, ["Fantasy"]);

// A rename with no usable target writes nothing rather than blanking tags.
assert.deepEqual(planCharacterTagOperation(cards, { type: "rename", from: ["fantasy"], to: "   " }).changes, []);

// Delete removes every spelling of the key and touches nothing else.
const removed = planCharacterTagOperation(cards, { type: "delete", keys: ["slow burn", "slowburn", "slow-burn"] });
assert.deepEqual(
  removed.changes.map((change) => change.id),
  ["a", "b", "c"],
);
assert.deepEqual(removed.changes[0].after, ["romance"]);
assert.deepEqual(removed.changes[2].after, []);

// Cards without the tag are never rewritten, including untagged cards.
assert.equal(
  removed.changes.some((change) => change.id === "d" || change.id === "e"),
  false,
);

console.info("Character tag operation regression checks passed.");
