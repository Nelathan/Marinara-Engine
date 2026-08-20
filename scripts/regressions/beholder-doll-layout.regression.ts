// Layout and missing-limb derivation for the Beholder panel.

import assert from "node:assert/strict";
import {
  LAYOUT_SLOT_ORDER,
  buildBeholderRows,
  isSlotEmpty,
  slotLabel,
  withDependentMissing,
  type BeholderBodyView,
} from "../../packages/client/src/components/chat/beholder-doll.js";

// A missing limb carries its dependents with it, transitively, and each derived entry
// is marked so the panel can show it as a consequence rather than a separate record.
const severedShoulder = withDependentMissing({ left_shoulder: { missing: true } });
assert.equal(severedShoulder.left_arm?.missing, true, "shoulder implies arm");
assert.equal(severedShoulder.left_hand?.missing, true, "and transitively the hand");
assert.equal(severedShoulder.left_arm?.derivedMissing, true, "derived entries are marked");
assert.equal(severedShoulder.left_shoulder?.derivedMissing, undefined, "the recorded loss is not marked derived");
assert.equal(severedShoulder.right_arm, undefined, "the other side is untouched");

// The cascade is limbs only: a missing face does not imply missing eyes.
const face = withDependentMissing({ face: { missing: true } });
assert.equal(face.left_eye, undefined, "a missing face does not blind the character");

// Legs carry feet, including the quadruped slots.
assert.equal(withDependentMissing({ right_leg: { missing: true } }).right_foot?.missing, true);
assert.equal(withDependentMissing({ hind_left_leg: { missing: true } }).hind_left_foot?.missing, true);

// The input is not mutated — the derivation is a view, never persisted.
const original: BeholderBodyView = { left_arm: { missing: true } };
withDependentMissing(original);
assert.equal(original.left_hand, undefined, "deriving must not write back into stored state");

// A slot already recorded as missing keeps whatever else it holds.
const both = withDependentMissing({ left_arm: { missing: true }, left_hand: { missing: true } });
assert.equal(both.left_hand?.derivedMissing, undefined, "an explicitly recorded loss stays explicit");

assert.deepEqual(withDependentMissing(null), {}, "no body yields no rows rather than throwing");
assert.deepEqual(withDependentMissing(undefined), {});

// Emptiness: only real state earns a row.
assert.equal(isSlotEmpty(undefined), true);
assert.equal(isSlotEmpty({}), true);
assert.equal(isSlotEmpty({ worn: [] }), true);
assert.equal(isSlotEmpty({ bare: true }), false);
assert.equal(isSlotEmpty({ worn: [{ item: "boot", damage: "pristine" }] }), false);

// Paired layout puts left and right on one row, and keeps both cells when only one
// side has state so the asymmetry is visible rather than a missing row.
const asymmetric: BeholderBodyView = { left_foot: { worn: [{ item: "boot", damage: "pristine" }] } };
const pairedRows = buildBeholderRows(asymmetric, "paired");
assert.equal(pairedRows.length, 1);
assert.deepEqual(pairedRows[0]?.slots, ["left_foot", "right_foot"], "the empty side is still drawn");

// The list layout keeps one slot per row and drops the empty partner entirely.
const listRows = buildBeholderRows(asymmetric, "list");
assert.deepEqual(
  listRows.map((row) => row.slots),
  [["left_foot"]],
);

// Rows follow anatomy top to bottom, not object key order.
const scrambled: BeholderBodyView = {
  left_foot: { bare: true },
  head: { worn: [{ item: "hood", damage: "pristine" }] },
  chest: { worn: [{ item: "coat", damage: "pristine" }] },
};
const ordered = buildBeholderRows(scrambled, "list").map((row) => row.slots[0]);
assert.deepEqual(ordered, ["head", "chest", "left_foot"], "anatomical order wins over key order");

// An unknown slot the model emitted still gets a row rather than disappearing.
const exotic = buildBeholderRows({ wings: { worn: [{ item: "harness", damage: "pristine" }] } }, "list");
assert.deepEqual(
  exotic.map((row) => row.slots),
  [["wings"]],
  "an unmapped slot is still shown",
);

// Nothing tracked means no rows at all.
assert.deepEqual(buildBeholderRows({}, "paired"), []);
assert.deepEqual(buildBeholderRows({ chest: {} }, "paired"), []);

// Every paired slot appears in the anatomical order, or it could never be rendered.
for (const slot of ["left_eye", "right_hand", "hind_right_foot", "tail", "mouth"]) {
  assert.ok(LAYOUT_SLOT_ORDER.includes(slot), `${slot} is missing from the layout order`);
}

assert.equal(slotLabel("hind_left_foot"), "hind left foot");
