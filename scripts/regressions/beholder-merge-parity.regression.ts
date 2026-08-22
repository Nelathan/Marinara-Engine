// Merge semantics that match the reference extractor. Each case here is a way tracked
// state used to drift away from what the story said.

import assert from "node:assert/strict";
import {
  dropHallucinatedCharacters,
  resolveBeholderStateResponse,
  stripModelMissing,
} from "../../packages/server/src/services/agents/beholder-state.js";
import { applyBeholderValidator } from "../../packages/server/src/services/agents/beholder-validator.js";

const persona = "Tim";
const wearing = (...items: Array<Record<string, unknown>>) => ({
  characters: [{ name: "Tim", body: { chest: { worn: items } } }],
});
const chestWorn = (state: { characters: Array<{ name: string; body: Record<string, unknown> }> }) =>
  (state.characters.find((c) => c.name === "Tim")?.body.chest as { worn?: Array<Record<string, unknown>> })?.worn ?? [];

// A delta that re-describes a garment must not drop what was already known about it.
// "The blazer is torn" says nothing about colour, so the navy has to survive.
const damaged = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "blazer", damage: "damaged" }] } } } } },
  wearing({ item: "blazer", color: "navy", damage: "pristine" }),
  persona,
);
assert.equal(damaged.valid, true);
assert.deepEqual(
  chestWorn(damaged.state),
  [{ item: "blazer", color: "navy", damage: "damaged" }],
  "an update keeps fields the delta did not re-emit",
);

// Singular and plural are one garment, not two entries stacking up.
const plural = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "boots", damage: "damaged" }] } } } } },
  wearing({ item: "boot", color: "black", damage: "pristine" }),
  persona,
);
const pluralWorn = chestWorn(plural.state);
assert.equal(pluralWorn.length, 1, '"boots" updates the stored "boot" instead of stacking');
assert.equal(pluralWorn[0]?.item, "boot", "the first-seen surface form is kept so the label does not flicker");
assert.equal(pluralWorn[0]?.damage, "damaged");
assert.equal(pluralWorn[0]?.color, "black");

// Co-located garments are untouched by an update to one of them.
const colocated = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "blazer", damage: "damaged" }] } } } } },
  wearing(
    { item: "blouse", color: "white", damage: "pristine" },
    { item: "blazer", color: "navy", damage: "pristine" },
  ),
  persona,
);
assert.deepEqual(
  chestWorn(colocated.state)
    .map((item) => item.item)
    .sort(),
  ["blazer", "blouse"],
  "updating one garment leaves the others in place",
);

// A takeoff names the garment; canonical matching means the plural clears the singular.
const removed = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn_remove: ["Boots"] } } } } },
  wearing({ item: "boot", color: "black", damage: "pristine" }, { item: "scarf", damage: "pristine" }),
  persona,
);
assert.deepEqual(
  chestWorn(removed.state).map((item) => item.item),
  ["scarf"],
  "worn_remove matches canonically and leaves the rest",
);

// A slot cannot be bare and clothed at once; the fresh assertion wins either way.
const stripped = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { bare: true } } } } },
  wearing({ item: "blazer", color: "navy", damage: "pristine" }),
  persona,
);
const strippedChest = stripped.state.characters.find((c) => c.name === "Tim")?.body.chest;
assert.equal(strippedChest?.bare, true);
assert.ok(!strippedChest?.worn?.length, "going bare empties the worn stack");

const redressed = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "shirt", damage: "pristine" }] } } } } },
  { characters: [{ name: "Tim", body: { chest: { bare: true } } }] },
  persona,
);
const redressedChest = redressed.state.characters.find((c) => c.name === "Tim")?.body.chest;
assert.equal(redressedChest?.bare, undefined, "putting something on clears a stale bare");
assert.equal(redressedChest?.worn?.length, 1);

// `missing` is manual-only: the extractor misfires on amputation badly enough that a
// model delta never sets it, and a slot left empty by the strip disappears.
const withMissing = {
  self: { body: { left_hand: { missing: true }, chest: { worn: [{ item: "coat" }] } } },
};
const cleaned = stripModelMissing(structuredClone(withMissing)) as typeof withMissing;
assert.equal(cleaned.self.body.left_hand, undefined, "a slot that carried only `missing` is dropped");
assert.ok(cleaned.self.body.chest, "other slots are untouched");
const keptFields = stripModelMissing({
  self: { body: { left_hand: { missing: true, wounds: [{ text: "burn" }] } } },
}) as { self: { body: { left_hand?: Record<string, unknown> } } };
assert.equal(keptFields.self.body.left_hand?.missing, undefined, "the flag goes");
assert.ok(keptFields.self.body.left_hand?.wounds, "the rest of the slot stays");

// An empty list the MODEL emitted is an explicit clear and must reach the merge.
const explicitClear = applyBeholderValidator(
  { changed: true, delta: { Tim: { body: { chest: { worn: [] } } } } },
  { persona, prevState: {}, prose: null },
);
assert.deepEqual(
  explicitClear.stripped,
  { changed: true, delta: { Tim: { body: { chest: { worn: [] } } } } },
  "the model's own clear survives pruning",
);

// An empty list that only appeared because an invalid item was stripped must NOT
// survive — otherwise a bad emission silently wipes a stack the model never cleared.
const strippedToEmpty = applyBeholderValidator(
  { changed: true, delta: { Tim: { body: { chest: { worn: [{ item: "red scarf" }] } } } } },
  { persona, prevState: {}, prose: "He adjusts the red scarf." },
);
assert.ok(
  !JSON.stringify(strippedToEmpty.stripped).includes('"worn":[]'),
  "a list emptied by stripping collapses to a no-op instead of clearing the slot",
);

// A character the extractor invented — named nowhere, never tracked — is discarded,
// while everyone with a claim to being real is kept.
const guarded = dropHallucinatedCharacters(
  { self: {}, Hesperia: {}, Mara: {}, Rissha: {} },
  "Hesperia steps back as the stone cracks.",
  "Tim",
  ["Rissha"],
);
assert.deepEqual(Object.keys(guarded.delta as Record<string, unknown>).sort(), ["Hesperia", "Rissha", "self"]);
assert.deepEqual(guarded.dropped, ["Mara"], "only the invented name is dropped");

// The persona is kept under its own name as well as `self`.
assert.deepEqual(
  Object.keys(dropHallucinatedCharacters({ Tim: {} }, "She waits.", "Tim").delta as Record<string, unknown>),
  ["Tim"],
);

// Matching is whole-word, so a name inside another word does not count as present.
assert.deepEqual(
  dropHallucinatedCharacters({ Ann: {} }, "The banner is torn.", null).dropped,
  ["Ann"],
  "a substring match does not make a character real",
);

// A name with regex-significant characters must not throw or silently drop.
assert.deepEqual(
  Object.keys(dropHallucinatedCharacters({ "A.B": {} }, "A.B nods once.", null).delta as Record<string, unknown>),
  ["A.B"],
);

// A delta that omits a field must not reset it to the schema default. "The blazer is
// torn" says nothing about condition elsewhere, so a stored `broken` survives an update
// that never mentions damage — the same rule that protects colour.
const stillBroken = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "blazer", color: "navy" }] } } } } },
  wearing({ item: "blazer", color: "black", damage: "broken" }),
  persona,
);
assert.deepEqual(
  chestWorn(stillBroken.state),
  [{ item: "blazer", color: "navy", damage: "broken" }],
  "an omitted damage keeps the stored value instead of resetting to pristine",
);

// The same for a wound: re-describing it without a severity keeps the severity it had.
const stillCritical = resolveBeholderStateResponse(
  { changed: true, delta: { Tim: { body: { head: { wounds: [{ text: "skull fracture" }] } } } } },
  {
    characters: [
      { name: "Tim", body: { head: { wounds: [{ text: "skull fracture", severity: "critical", bleeding: true }] } } },
    ],
  },
  persona,
);
const headWounds = stillCritical.state.characters.find((c) => c.name === "Tim")?.body.head?.wounds ?? [];
assert.equal(headWounds[0]?.severity, "critical", "an omitted severity does not downgrade a wound");
assert.equal(headWounds[0]?.bleeding, true, "an omitted bleeding flag is not cleared");

// A garment appearing for the first time is new state, so it does take the default.
const fresh = resolveBeholderStateResponse(
  { changed: true, delta: { self: { body: { chest: { worn: [{ item: "scarf" }] } } } } },
  { characters: [] },
  persona,
);
assert.equal(chestWorn(fresh.state)[0]?.damage, "pristine", "a newly seen garment gets the default condition");
