// Beholder validator — runtime validation of an extraction before it reaches state.
//
// Ported from the reference extractor (GetBeholder/Beholder-ME, AGPL-3.0-only), which
// is itself a mirror of the datagen validator that produced Beholder's training labels.
// The extractor is deliberately small, so this is not belt-and-braces: it is the layer
// that keeps an impossible emission — a concussion on a back, a boot on a hand, clothing
// on an amputated limb — out of tracked state.
//
// Parity is gated by scripts/regressions/beholder-validator-parity.regression.ts against
// the shared fixture generated from the datagen validator. Change the logic only
// alongside that fixture, and keep beholder-validator-data.ts vendored verbatim.

import {
  ARMOR_FORM_PROSE_QUALIFIERS,
  COLOR_WORDS_FOR_ITEM_CHECK,
  CRITICAL_ESCALATORS,
  GARMENT_CANON,
  HAND_WORN_STAPLES,
  HIND_LEG_SLOTS,
  HOLDING_ADD_CUES,
  INTERACTION_CUE_PHRASES,
  ITEM_CATEGORIES,
  MINOR_DEFAULT_INJURY_NOUNS,
  MULTI_SLOT_TABLE,
  MUTEX_GARMENT_CLASSES,
  PASS_BY_BODY_FIELD,
  PROXIMAL_OF,
  SEVERITY_ESCALATORS_PROSE,
  SLOT_CATEGORY_STRIP,
  SOILING_ONLY_CUES,
  SPECIES_NO_LEGS,
  SPECIES_QUADRUPED,
  SPECIES_REJECT_DESCRIPTORS,
  STANDARD_LEG_SLOTS,
  STRUCTURAL_DAMAGE_CUES,
  VALID_SLOTS,
  WORN_DON_CUES,
  WOUND_SLOT_ANATOMY,
} from "./beholder-validator-data.js";

export type BeholderFindingSeverity = "error" | "warning" | "suggestion";

export interface BeholderFinding {
  rule_id: string;
  path: string;
  severity: BeholderFindingSeverity;
  pass_name: string | null;
}

export interface BeholderValidatorOptions {
  persona?: string | null;
  prevState?: Record<string, unknown>;
  prose?: string | null;
}

type Dict = Record<string, unknown>;

/** Rules implemented here. The datagen oracle carries further detect-only rules. */
export const PORTED_RULES: ReadonlySet<string> = new Set([
  "WRAPPER-NOT-OBJECT",
  "CHANGED-NOT-BOOL",
  "FALSE-HAS-DELTA",
  "TRUE-MISSING-DELTA",
  "STAMINA-DROPPED",
  "HOLDING-CLEAR-LEGACY-SENTINEL",
  "SPECIES-LEG-OMISSION",
  "HIND-ON-NON-QUADRUPED",
  "MISSING-DOMINANCE",
  "MISSING-CASCADE",
  "BARE-WORN-MUTEX",
  "ITEM-WRONG-SLOT",
  "MULTI-SLOT-INCOMPLETE",
  "ORPHAN-TAIL",
  "COLOR-IN-ITEM",
  "SLOT-NOT-IN-SCHEMA",
  "WOUND-WRONG-SLOT",
  "SPECIES-IS-SOCIAL-DESCRIPTOR",
  "CONFLICTING-WORN",
  "SEVERITY-INFLATION",
  "X3-GENERIC-ARMOR-PROSE-HAS-FORM",
  "X5-DAMAGE-NO-STRUCTURAL-CUE",
  "SOILING-WITH-DAMAGE-CHECK",
  "SEVERITY-DEFLATION-SUSPECTED",
  "WORN-ON-HAND-INTERACTION",
]);

const isObj = (value: unknown): value is Dict => value !== null && typeof value === "object" && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const escapeRe = (value: unknown): string => String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/** Multi-word or hyphenated cues match as substrings; single words on word boundaries. */
function proseHasPhrase(proseLower: string, cue: string): boolean {
  if (cue.includes(" ") || cue.includes("-")) return proseLower.includes(cue);
  return new RegExp(`\\b${escapeRe(cue)}\\b`, "u").test(proseLower);
}

// Python treats [] and {} as falsy; JavaScript does not. These keep the ported
// conditions reading the same way as the oracle they mirror.
function pyTruthy(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === "" || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Dict).length > 0;
  return true;
}

function isPresentField(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value as Dict).length > 0;
  return true;
}

function holdingPresent(holding: unknown): boolean {
  return !(
    holding === null ||
    holding === undefined ||
    holding === "" ||
    (typeof holding === "object" && !Array.isArray(holding) && Object.keys(holding as Dict).length === 0)
  );
}

const S_NO_LEGS = new Set<string>(SPECIES_NO_LEGS);
const S_STD_LEG = new Set<string>(STANDARD_LEG_SLOTS);
const S_QUAD = new Set<string>(SPECIES_QUADRUPED);
const S_HIND = new Set<string>(HIND_LEG_SLOTS);
const S_VALID_SLOTS = new Set<string>(VALID_SLOTS);
const SPECIES_REJECT = new Set<string>(SPECIES_REJECT_DESCRIPTORS);

// A worn cover sits OVER these losses (eyepatch, ear cover, gag), so `missing` does
// not strip a worn item here the way it does on a limb.
const COVERABLE_MISSING_SLOTS = new Set(["left_eye", "right_eye", "left_ear", "right_ear", "mouth"]);

const canonGarment = (value: unknown): string => {
  const name = String(value ?? "")
    .trim()
    .toLowerCase();
  return (GARMENT_CANON as Record<string, string>)[name] ?? name;
};

const MULTI_SLOT_CANON: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(MULTI_SLOT_TABLE as Record<string, string[]>).map(([item, slots]) => [
    canonGarment(item),
    new Set(slots),
  ]),
);

const ITEM_CATEGORY_TABLE = ITEM_CATEGORIES as Record<
  string,
  { items: string[]; allowed_slots: string[]; severity?: string }
>;

const ITEM_TO_CATEGORY = new Map<string, string>();
for (const [categoryName, category] of Object.entries(ITEM_CATEGORY_TABLE)) {
  for (const item of category.items) ITEM_TO_CATEGORY.set(item.toLowerCase(), categoryName);
}
const ITEM_KEYS_SORTED = [...ITEM_TO_CATEGORY.keys()].sort((a, b) => b.length - a.length);

const SLOT_CAT_STRIP: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(SLOT_CATEGORY_STRIP as Record<string, string[]>).map(([slot, categories]) => [
    slot,
    new Set(categories),
  ]),
);

const WOUND_SLOT_ENTRIES: Array<[string, Set<string>]> = Object.entries(
  WOUND_SLOT_ANATOMY as Record<string, string[]>,
).map(([wound, slots]) => [wound, new Set(slots)]);

const MUTEX_CLASSES: Array<[string, Set<string>]> = Object.entries(
  MUTEX_GARMENT_CLASSES as Record<string, string[]>,
).map(([className, members]) => [className, new Set(members)]);

/** The mutual-exclusion class an item belongs to: exact, multi-word substring, or token. */
function mutexGarmentClass(itemName: unknown): string | null {
  if (typeof itemName !== "string") return null;
  const name = itemName.toLowerCase().trim();
  if (!name) return null;
  for (const [className, members] of MUTEX_CLASSES) {
    if (members.has(name)) return className;
    for (const member of members) {
      if (member.includes(" ") && name.includes(member)) return className;
    }
    for (const token of name.split(/[\s-]+/u)) {
      if (members.has(token)) return className;
    }
  }
  return null;
}

/** The item category an item name belongs to: exact, multi-word substring, or token. */
export function classifyItem(itemName: unknown): string | null {
  if (typeof itemName !== "string") return null;
  const norm = itemName.toLowerCase().trim();
  if (!norm) return null;
  const exact = ITEM_TO_CATEGORY.get(norm);
  if (exact) return exact;
  for (const key of ITEM_KEYS_SORTED) {
    if (key.includes(" ") && norm.includes(key)) return ITEM_TO_CATEGORY.get(key) ?? null;
  }
  for (const token of norm.split(/[\s-]+/u)) {
    const hit = ITEM_TO_CATEGORY.get(token);
    if (hit) return hit;
  }
  return null;
}

/** A phrase-local armor qualifier the prose names but a generic item="armor" omits. */
function armorFormForItem(proseLower: string, item: Dict): string | null {
  const itemName = String(item.item ?? "")
    .toLowerCase()
    .trim();
  if (itemName !== "armor") return null;
  const material = String(item.material ?? "")
    .toLowerCase()
    .trim();
  const haystack = [itemName, material].filter(Boolean).join(" ");
  for (const qualifier of [...(ARMOR_FORM_PROSE_QUALIFIERS as string[])].sort((a, b) => b.length - a.length)) {
    const escaped = escapeRe(qualifier);
    const pattern = new RegExp(
      `\\b${escaped}\\b(?:\\W+\\w+){0,2}\\W+armor\\b|\\barmor\\W+(?:\\w+\\W+){0,2}${escaped}\\b`,
      "u",
    );
    if (pattern.test(proseLower) && !haystack.includes(qualifier)) return qualifier;
  }
  return null;
}

const finding = (
  rule_id: string,
  path: string,
  severity: BeholderFindingSeverity = "error",
  pass_name: string | null = null,
): BeholderFinding => ({ rule_id, path, severity, pass_name });

const passForField = (field: string): string | null => (PASS_BY_BODY_FIELD as Record<string, string>)[field] ?? null;

/** Wrapper-shape rules: the {changed, delta} envelope itself. */
export function validateWrapperShape(parsed: unknown): BeholderFinding[] {
  if (parsed === null || parsed === undefined) return [];
  if (!isObj(parsed)) return [finding("WRAPPER-NOT-OBJECT", "root")];
  const out: BeholderFinding[] = [];
  const changed = parsed.changed;
  if (typeof changed !== "boolean") {
    out.push(finding("CHANGED-NOT-BOOL", "changed"));
    return out;
  }
  const hasDelta = "delta" in parsed;
  if (changed === false && hasDelta && pyTruthy(parsed.delta)) {
    out.push(finding("FALSE-HAS-DELTA", "delta"));
  } else if (changed === true) {
    if (!isObj(parsed.delta) || Object.keys(parsed.delta).length === 0) {
      out.push(finding("TRUE-MISSING-DELTA", "delta"));
    }
  }
  return out;
}

/** Cross-field and prose-aware rules over a merged delta. */
export function validateMergedDelta(merged: unknown, options: BeholderValidatorOptions = {}): BeholderFinding[] {
  const prose = options.prose ?? null;
  const prevState: Dict = options.prevState ?? {};
  let errors = validateWrapperShape(merged);
  if (errors.some((entry) => entry.severity === "error")) return errors;
  if (!isObj(merged)) return errors;

  if (!merged.changed) {
    if (typeof prose === "string" && prose.trim()) {
      errors = errors.concat(proseAwareChecks(merged, prose, prevState));
    }
    return errors;
  }

  const delta = merged.delta;
  if (!isObj(delta)) return errors;

  for (const [char, charDataRaw] of Object.entries(delta)) {
    if (!isObj(charDataRaw)) continue;
    const charData = charDataRaw;
    if ("stamina" in charData) errors.push(finding("STAMINA-DROPPED", `delta.${char}.stamina`));

    const prevCharRaw = prevState[char];
    const prevChar: Dict = isObj(prevCharRaw) ? prevCharRaw : {};
    const speciesRaw = charData.species ?? prevChar.species;
    const speciesNorm = typeof speciesRaw === "string" ? speciesRaw.toLowerCase().trim() : null;

    // A species-only character (no body) still runs the per-character rules below.
    const bodyRaw = charData.body ?? {};
    if (!isObj(bodyRaw)) continue;
    const body = bodyRaw;

    // A newly emitted species that exactly matches a social, rank, or blood-status
    // descriptor is model confusion, not anatomy — unless the same delta co-emits
    // species-conditional anatomy.
    if (typeof charData.species === "string") {
      const normalized = charData.species.trim().toLowerCase().replace(/\s+/gu, " ");
      if (SPECIES_REJECT.has(normalized)) {
        const tail = body.tail;
        const hasAnatomySignal =
          (isObj(tail) && Object.keys(tail).length > 0) || Object.keys(body).some((slot) => S_HIND.has(slot));
        if (!hasAnatomySignal) {
          errors.push(finding("SPECIES-IS-SOCIAL-DESCRIPTOR", `delta.${char}.species`, "error", "species"));
        }
      }
    }

    const itemsBySlot = new Map<string, string[]>();

    for (const [slot, slotDataRaw] of Object.entries(body)) {
      if (!isObj(slotDataRaw)) continue;
      const slotData = slotDataRaw;

      if (!S_VALID_SLOTS.has(slot)) {
        errors.push(finding("SLOT-NOT-IN-SCHEMA", `delta.${char}.body.${slot}`, "error", null));
        continue;
      }

      if (slotData.holding === "") {
        errors.push(finding("HOLDING-CLEAR-LEGACY-SENTINEL", `delta.${char}.body.${slot}.holding`, "error", "holding"));
      }

      if (speciesNorm && S_NO_LEGS.has(speciesNorm) && S_STD_LEG.has(slot)) {
        let ownerPass = "species";
        for (const field of Object.keys(slotData)) {
          ownerPass = passForField(field) ?? ownerPass;
          if (ownerPass !== "species") break;
        }
        errors.push(finding("SPECIES-LEG-OMISSION", `delta.${char}.body.${slot}`, "error", ownerPass));
      }

      if (S_HIND.has(slot) && !S_QUAD.has(speciesNorm ?? "human")) {
        errors.push(finding("HIND-ON-NON-QUADRUPED", `delta.${char}.body.${slot}`, "suggestion", "species"));
      }

      if (slotData.missing === true) {
        for (const conflict of ["worn", "wounds", "holding", "bare"]) {
          if (conflict === "worn" && COVERABLE_MISSING_SLOTS.has(slot)) continue;
          if (isPresentField(slotData[conflict])) {
            errors.push(
              finding("MISSING-DOMINANCE", `delta.${char}.body.${slot}.${conflict}`, "error", passForField(conflict)),
            );
          }
        }
      }

      if (slotData.missing !== true) {
        const hasState =
          pyTruthy(slotData.worn) ||
          pyTruthy(slotData.wounds) ||
          holdingPresent(slotData.holding) ||
          slotData.bare === true;
        if (hasState) {
          const prevBody: Dict = isObj(prevChar.body) ? prevChar.body : {};
          for (const ancestor of (PROXIMAL_OF as Record<string, string[]>)[slot] ?? []) {
            const ancestorInDelta = body[ancestor];
            const ancestorInPrev = prevBody[ancestor];
            const inDelta = isObj(ancestorInDelta) && ancestorInDelta.missing === true;
            const inPrev = isObj(ancestorInPrev) && ancestorInPrev.missing === true;
            if (inDelta || inPrev) {
              errors.push(finding("MISSING-CASCADE", `delta.${char}.body.${slot}`, "error", null));
              break;
            }
          }
        }
      }

      if (slotData.bare === true && Array.isArray(slotData.worn) && slotData.worn.length > 0) {
        errors.push(finding("BARE-WORN-MUTEX", `delta.${char}.body.${slot}.bare`, "error", "flags"));
      }

      if (Array.isArray(slotData.worn)) {
        slotData.worn.forEach((entry, index) => {
          if (!isObj(entry)) return;
          const itemName = entry.item;
          if (typeof itemName !== "string") return;
          const norm = canonGarment(itemName);
          const slots = itemsBySlot.get(norm);
          if (slots) slots.push(slot);
          else itemsBySlot.set(norm, [slot]);
          const category = classifyItem(itemName);
          if (!category) return;
          const categoryRules = ITEM_CATEGORY_TABLE[category];
          if (!categoryRules || categoryRules.allowed_slots.includes(slot)) return;
          const severity: BeholderFindingSeverity = SLOT_CAT_STRIP[slot]?.has(category)
            ? "error"
            : ((categoryRules.severity as BeholderFindingSeverity | undefined) ?? "warning");
          errors.push(
            finding(
              `ITEM-WRONG-SLOT-${category.toUpperCase()}`,
              `delta.${char}.body.${slot}.worn[${index}]`,
              severity,
              "worn",
            ),
          );
        });

        // Two or more mutually exclusive garments on one slot: keep the first of each
        // class, strip the rest.
        const seenMutex = new Map<string, number>();
        slotData.worn.forEach((entry, index) => {
          if (!isObj(entry)) return;
          const className = mutexGarmentClass(entry.item);
          if (className === null) return;
          if (seenMutex.has(className)) {
            errors.push(finding("CONFLICTING-WORN", `delta.${char}.body.${slot}.worn[${index}]`, "error", "worn"));
          } else {
            seenMutex.set(className, index);
          }
        });
      }

      // A wound naming unambiguous anatomy on a slot that anatomy cannot occupy.
      if (Array.isArray(slotData.wounds)) {
        slotData.wounds.forEach((wound, index) => {
          if (!isObj(wound)) return;
          const text = wound.text;
          if (typeof text !== "string") return;
          const textNorm = text.toLowerCase();
          for (const [woundKey, okSlots] of WOUND_SLOT_ENTRIES) {
            if (!textNorm.includes(woundKey) || okSlots.has(slot)) continue;
            // A legless species has no leg or foot slot, so a foot-bound wound stays put.
            if (speciesNorm && S_NO_LEGS.has(speciesNorm) && [...okSlots].every((s) => S_STD_LEG.has(s))) break;
            errors.push(finding("WOUND-WRONG-SLOT", `delta.${char}.body.${slot}.wounds[${index}]`, "error", "wounds"));
            break;
          }
        });
      }
    }

    // A multi-slot garment emitted on only some of the slots it covers.
    for (const [itemNorm, slotsSeen] of itemsBySlot) {
      const required = MULTI_SLOT_CANON[itemNorm];
      if (!required) continue;
      const seen = new Set(slotsSeen);
      const missingSlots = [...required].filter((slot) => !seen.has(slot));
      if (!missingSlots.length) continue;
      const prevBody: Dict = isObj(prevChar.body) ? prevChar.body : {};
      const stillMissing = missingSlots.filter((slot) => {
        const prevSlot = prevBody[slot];
        const prevWorn = isObj(prevSlot) ? asArray(prevSlot.worn) : [];
        return !prevWorn.some((entry) => isObj(entry) && canonGarment(entry.item) === itemNorm);
      });
      if (stillMissing.length) {
        const seenPath = [...slotsSeen].sort().join("/");
        errors.push(
          finding("MULTI-SLOT-INCOMPLETE", `delta.${char}.body.${seenPath}.worn[item=${itemNorm}]`, "warning", "worn"),
        );
      }
    }

    if ("tail" in body && speciesNorm === null) {
      const tailData: Dict = isObj(body.tail) ? body.tail : {};
      const meaningful = ["worn", "wounds", "holding", "bare", "missing"].some((key) => pyTruthy(tailData[key]));
      if (meaningful) errors.push(finding("ORPHAN-TAIL", `delta.${char}.body.tail`, "warning", "species"));
    }
  }

  if (typeof prose === "string" && prose.trim()) {
    errors = errors.concat(proseAwareChecks(merged, prose, prevState));
  }
  return errors;
}

/** Rules that need the narration as well as the delta. */
function proseAwareChecks(merged: Dict, prose: string, prevState: Dict): BeholderFinding[] {
  const out: BeholderFinding[] = [];
  const delta = merged.delta;
  if (!isObj(delta)) return out;
  const proseLower = prose.toLowerCase();
  const hasEscalator = (SEVERITY_ESCALATORS_PROSE as string[]).some((cue) => proseLower.includes(cue));
  const hasStructuralDamageCue = (STRUCTURAL_DAMAGE_CUES as string[]).some((cue) => proseHasPhrase(proseLower, cue));
  const hasSoilingOnlyCue = (SOILING_ONLY_CUES as string[]).some((cue) => proseHasPhrase(proseLower, cue));
  const hasHoldingAddCue = (HOLDING_ADD_CUES as string[]).some((cue) => proseHasPhrase(proseLower, cue));
  const hasInteractionCue = (INTERACTION_CUE_PHRASES as string[]).some((cue) => proseHasPhrase(proseLower, cue));
  const hasHandInteraction = hasHoldingAddCue || hasInteractionCue;
  const hasDonCue = (WORN_DON_CUES as string[]).some((cue) => proseHasPhrase(proseLower, cue));

  for (const [char, charData] of Object.entries(delta)) {
    if (!isObj(charData)) continue;
    const body = charData.body;
    if (!isObj(body)) continue;
    const prevChar = prevState[char];
    const prevCharBody: Dict = isObj(prevChar) && isObj(prevChar.body) ? prevChar.body : {};

    for (const [slot, slotDataRaw] of Object.entries(body)) {
      if (!isObj(slotDataRaw)) continue;
      const slotData = slotDataRaw;
      const worn = asArray(slotData.worn);

      // An unclassified item newly worn on a hand that the prose grips or reaches for,
      // with no donning cue, is a held object mis-filed as worn.
      if ((slot === "left_hand" || slot === "right_hand") && hasHandInteraction && !hasDonCue) {
        const prevSlot = prevCharBody[slot];
        const prevWorn = isObj(prevSlot) ? asArray(prevSlot.worn) : [];
        const prevItems = new Set(prevWorn.filter(isObj).map((entry) => canonGarment(entry.item)));
        worn.forEach((entry, index) => {
          if (!isObj(entry) || typeof entry.item !== "string") return;
          if (prevItems.has(canonGarment(entry.item))) return;
          if (classifyItem(entry.item) !== null) return;
          const itemLower = entry.item.trim().toLowerCase();
          if (!itemLower || !proseLower.includes(itemLower)) return;
          if ((HAND_WORN_STAPLES as string[]).some((staple) => itemLower.includes(staple))) return;
          out.push(finding("WORN-ON-HAND-INTERACTION", `delta.${char}.body.${slot}.worn[${index}]`, "warning", "worn"));
        });
      }

      // A minor-default injury noun labelled serious or critical with no prose escalator.
      asArray(slotData.wounds).forEach((wound, index) => {
        if (!isObj(wound)) return;
        const text = String(wound.text ?? "")
          .toLowerCase()
          .trim();
        const severity = String(wound.severity ?? "")
          .toLowerCase()
          .trim();
        if (severity !== "serious" && severity !== "critical") return;
        if ((MINOR_DEFAULT_INJURY_NOUNS as string[]).some((noun) => text.includes(noun)) && !hasEscalator) {
          out.push(
            finding("SEVERITY-INFLATION", `delta.${char}.body.${slot}.wounds[${index}].severity`, "warning", "wounds"),
          );
        }
      });

      // A color word inside the item name instead of its own field.
      worn.forEach((entry, index) => {
        if (!isObj(entry) || typeof entry.item !== "string") return;
        const itemLower = entry.item.toLowerCase().trim();
        let colorFound: string | null = null;
        for (const color of COLOR_WORDS_FOR_ITEM_CHECK as string[]) {
          if (color.includes(" ") || color.includes("-")) {
            if (itemLower.includes(color)) {
              colorFound = color;
              break;
            }
          } else if (new RegExp(`\\b${escapeRe(color)}\\b`, "u").test(itemLower)) {
            colorFound = color;
            break;
          }
        }
        if (colorFound) {
          out.push(finding("COLOR-IN-ITEM", `delta.${char}.body.${slot}.worn[${index}].item`, "error", "worn"));
        }
      });

      // A generic item="armor" where the prose names a specific form.
      worn.forEach((entry, index) => {
        if (isObj(entry) && armorFormForItem(proseLower, entry)) {
          out.push(
            finding(
              "X3-GENERIC-ARMOR-PROSE-HAS-FORM",
              `delta.${char}.body.${slot}.worn[${index}].item`,
              "warning",
              "worn",
            ),
          );
        }
      });

      // Damage upgraded with no structural cue in the prose, or only a soiling cue.
      const damageEntries: Array<[string, unknown[]]> = [
        ["worn", worn],
        ["holding", isObj(slotData.holding) ? [slotData.holding] : []],
      ];
      for (const [fieldName, entries] of damageEntries) {
        entries.forEach((entry, index) => {
          if (!isObj(entry)) return;
          const damage = String(entry.damage ?? "")
            .toLowerCase()
            .trim();
          if (damage !== "damaged" && damage !== "broken") return;
          const owner = fieldName === "holding" ? "holding" : "worn";
          const suffix = fieldName === "holding" ? "" : `[${index}]`;
          const path = `delta.${char}.body.${slot}.${fieldName}${suffix}.damage`;
          if (!hasStructuralDamageCue) {
            out.push(finding("X5-DAMAGE-NO-STRUCTURAL-CUE", path, "warning", owner));
          } else if (hasSoilingOnlyCue) {
            out.push(finding("SOILING-WITH-DAMAGE-CHECK", path, "suggestion", owner));
          }
        });
      }

      // A critical escalator near this slot in the prose, but no critical wound on it.
      const wounds = asArray(slotData.wounds).filter(isObj);
      if (wounds.length && wounds.every((wound) => String(wound.severity ?? "") !== "critical")) {
        const phrase = slot.replace(/_/gu, " ");
        const at = proseLower.indexOf(phrase);
        if (at >= 0) {
          const window = proseLower.slice(Math.max(0, at - 50), at + phrase.length + 50);
          if ((CRITICAL_ESCALATORS as string[]).some((cue) => window.includes(cue))) {
            out.push(
              finding("SEVERITY-DEFLATION-SUSPECTED", `delta.${char}.body.${slot}.wounds`, "suggestion", "wounds"),
            );
          }
        }
      }
    }
  }
  return out;
}

type PathToken = ["key", string] | ["idx", string];

function tokenizePath(path: string): PathToken[] {
  let rest = path.slice("delta".length);
  if (rest.startsWith(".")) rest = rest.slice(1);
  const tokens: PathToken[] = [];
  let current = "";
  let index = 0;
  while (index < rest.length) {
    const character = rest[index];
    if (character === ".") {
      if (current) {
        tokens.push(["key", current]);
        current = "";
      }
      index += 1;
    } else if (character === "[") {
      if (current) {
        tokens.push(["key", current]);
        current = "";
      }
      const close = rest.indexOf("]", index);
      if (close === -1) return tokens;
      tokens.push(["idx", rest.slice(index + 1, close)]);
      index = close + 1;
    } else {
      current += character;
      index += 1;
    }
  }
  if (current) tokens.push(["key", current]);
  return tokens;
}

function removePath(root: Dict, path: string): void {
  if (!path.startsWith("delta")) return;
  const delta = root.delta;
  if (!isObj(delta)) return;

  // A character name is free text and may contain the very characters the path
  // grammar uses — "Dr. Vance", "A[B]". Tokenizing blindly would split inside the
  // name, the lookup would miss, and the offending field would be reported but never
  // stripped. Match the longest actual key first, then parse only what follows it.
  let rest = path.slice("delta".length);
  if (rest.startsWith(".")) rest = rest.slice(1);
  const charKey = Object.keys(delta)
    .filter((key) => rest === key || rest.startsWith(`${key}.`) || rest.startsWith(`${key}[`))
    .sort((left, right) => right.length - left.length)[0];

  const tokens: PathToken[] = charKey
    ? [["key", charKey], ...tokenizePath(`delta${rest.slice(charKey.length)}`)]
    : tokenizePath(path);
  if (!tokens.length) return;

  let parent: unknown = delta;
  for (const [kind, value] of tokens.slice(0, -1)) {
    if (kind === "key") {
      if (!isObj(parent) || !(value in parent)) return;
      parent = parent[value];
    } else {
      const index = Number.parseInt(value, 10);
      if (!Array.isArray(parent) || Number.isNaN(index) || index >= parent.length) return;
      parent = parent[index];
    }
  }

  const last = tokens[tokens.length - 1];
  if (!last) return;
  const [lastKind, lastValue] = last;
  if (lastKind === "key") {
    if (isObj(parent) && lastValue in parent) delete parent[lastValue];
  } else {
    const index = Number.parseInt(lastValue, 10);
    if (Array.isArray(parent) && index >= 0 && index < parent.length) parent.splice(index, 1);
  }
}

/**
 * Paths where the model itself emitted an already-empty worn or wounds list. That empty
 * list is an explicit clear — "took it all off" — which the merge honours, so it has to
 * survive pruning. A list that only became empty because an invalid item was stripped
 * must NOT survive: collapsing it to a no-op keeps a bad emission from wiping a stack
 * the model never meant to clear.
 */
function keepOriginallyEmpty(parsed: unknown): Set<string> {
  const keep = new Set<string>();
  if (!isObj(parsed)) return keep;
  const delta = parsed.delta;
  if (!isObj(delta)) return keep;
  for (const [char, charData] of Object.entries(delta)) {
    if (!isObj(charData)) continue;
    const body = charData.body;
    if (!isObj(body)) continue;
    for (const [slot, slotData] of Object.entries(body)) {
      if (!isObj(slotData)) continue;
      for (const listField of ["worn", "wounds"]) {
        const value = slotData[listField];
        if (Array.isArray(value) && value.length === 0) keep.add(`${char}.${slot}.${listField}`);
      }
    }
  }
  return keep;
}

function pruneEmpties(parsed: Dict, keep: ReadonlySet<string>): void {
  const delta = parsed.delta;
  if (!isObj(delta)) return;
  for (const char of Object.keys(delta)) {
    const charData = delta[char];
    if (!isObj(charData)) continue;
    const body = charData.body;
    if (isObj(body)) {
      for (const slot of Object.keys(body)) {
        const slotData = body[slot];
        if (isObj(slotData)) {
          for (const listField of ["worn", "wounds"]) {
            const value = slotData[listField];
            if (listField in slotData && Array.isArray(value) && value.length === 0) {
              if (keep.has(`${char}.${slot}.${listField}`)) continue; // the model's own clear
              delete slotData[listField];
            }
          }
          if (Object.keys(slotData).length === 0) delete body[slot];
        } else if (
          slotData === null ||
          slotData === undefined ||
          slotData === "" ||
          (Array.isArray(slotData) && slotData.length === 0)
        ) {
          delete body[slot];
        }
      }
      if (Object.keys(body).length === 0) delete charData.body;
    }
    if (Object.keys(charData).length === 0) delete delta[char];
  }
  if (Object.keys(delta).length === 0) {
    parsed.changed = false;
    delete parsed.delta;
  }
}

/** The trailing list index in a path, or -1 when it addresses no list element. */
function lastListIndex(path: string): number {
  const matches = path.match(/\[(\d+)\]/gu);
  if (!matches) return -1;
  const last = matches[matches.length - 1];
  return last ? Number.parseInt(last.slice(1, -1), 10) : -1;
}

/**
 * Remove every error-severity path, deepest first and then by descending list index so
 * that strips within one list do not shift each other's positions.
 */
export function stripInvalidFields(parsed: unknown, errors: readonly BeholderFinding[]): unknown {
  if (!parsed) return parsed;
  // Snapshot the model's explicit clears before stripping, then preserve exactly those
  // through pruning so a takeoff reaches the merge instead of collapsing to a no-op.
  const keep = keepOriginallyEmpty(parsed);
  const result = JSON.parse(JSON.stringify(parsed)) as Dict;
  const fatal = errors.filter((entry) => entry.severity === "error");
  const depth = (path: string): number => path.split(".").length - 1;
  fatal.sort(
    (left, right) => depth(right.path) - depth(left.path) || lastListIndex(right.path) - lastListIndex(left.path),
  );
  for (const entry of fatal) removePath(result, entry.path);
  pruneEmpties(result, keep);
  return result;
}

/** Validate and strip in one step: the transform the runtime applies to every extraction. */
export function applyBeholderValidator(
  merged: unknown,
  options: BeholderValidatorOptions = {},
): { findings: BeholderFinding[]; stripped: unknown } {
  const findings = validateMergedDelta(merged, options);
  return { findings, stripped: stripInvalidFields(merged, findings) };
}

/**
 * One-shot sweep over already-persisted state rather than a delta, so impossible
 * entries recorded before validation existed can be cleaned retroactively. Only
 * error-severity findings strip, a locked slot is never touched, and prose-aware rules
 * are skipped because a snapshot has no single narration.
 */
export function sweepBeholderState(
  state: unknown,
  options: { persona?: string | null; isSlotLocked?: (char: string, slot: string) => boolean } = {},
): { cleaned: Dict; findings: BeholderFinding[]; removed: BeholderFinding[]; changed: boolean } {
  const isSlotLocked = options.isSlotLocked ?? (() => false);
  if (!isObj(state) || Object.keys(state).length === 0) {
    return { cleaned: isObj(state) ? state : {}, findings: [], removed: [], changed: false };
  }
  const wrapped: Dict = { changed: true, delta: state };
  const findings = validateMergedDelta(wrapped, { persona: options.persona ?? null, prevState: {}, prose: null });
  const removed = findings.filter((entry) => {
    if (entry.severity !== "error") return false;
    const match = /^delta\.(.+?)\.body\.([^.[]+)/u.exec(entry.path);
    if (match && match[1] && match[2] && isSlotLocked(match[1], match[2])) return false;
    return true;
  });
  const out = stripInvalidFields(wrapped, removed);
  const cleaned: Dict = isObj(out) && out.changed && isObj(out.delta) ? out.delta : {};
  return { cleaned, findings, removed, changed: JSON.stringify(cleaned) !== JSON.stringify(state) };
}
