// Layout and derivation for the Beholder physical-state panel.
//
// Kept apart from the component so the ordering and the missing-limb cascade can be
// tested on their own. The slot order and pairing mirror the reference extractor's
// panel: anatomical top to bottom, with left and right on one row so an asymmetric
// state — one boot gone, one arm wounded — reads at a glance instead of being two
// entries several rows apart.

export type BeholderLayout = "paired" | "columns" | "list";

export const BEHOLDER_LAYOUTS: readonly BeholderLayout[] = ["paired", "columns", "list"];

/** Slots that sit side by side on one row in the paired layout. */
export const LAYOUT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["left_eye", "right_eye"],
  ["left_ear", "right_ear"],
  ["left_shoulder", "right_shoulder"],
  ["left_arm", "right_arm"],
  ["left_hand", "right_hand"],
  ["left_leg", "right_leg"],
  ["hind_left_leg", "hind_right_leg"],
  ["left_foot", "right_foot"],
  ["hind_left_foot", "hind_right_foot"],
];

const PAIR_OF: Record<string, string> = {};
for (const [left, right] of LAYOUT_PAIRS) {
  PAIR_OF[left] = right;
  PAIR_OF[right] = left;
}

/** Anatomical top-to-bottom order the panel walks. */
export const LAYOUT_SLOT_ORDER: readonly string[] = [
  "head",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "face",
  "mouth",
  "neck",
  "left_shoulder",
  "right_shoulder",
  "chest",
  "back",
  "left_arm",
  "right_arm",
  "waist",
  "left_hand",
  "right_hand",
  "left_leg",
  "right_leg",
  "hind_left_leg",
  "hind_right_leg",
  "tail",
  "left_foot",
  "right_foot",
  "hind_left_foot",
  "hind_right_foot",
];

/**
 * A missing limb implies its dependents are missing too: shoulder to arm to hand,
 * leg to foot. Limbs only — a missing face does not imply missing eyes.
 */
const MISSING_DEPENDENTS: Record<string, readonly string[]> = {
  left_shoulder: ["left_arm"],
  right_shoulder: ["right_arm"],
  left_arm: ["left_hand"],
  right_arm: ["right_hand"],
  left_leg: ["left_foot"],
  right_leg: ["right_foot"],
  hind_left_leg: ["hind_left_foot"],
  hind_right_leg: ["hind_right_foot"],
};

export interface BeholderSlotView {
  worn?: Array<{ item: string; material?: string; color?: string; damage: string }>;
  holding?: { item: string; damage: string };
  wounds?: Array<{ text: string; severity: string; bleeding: boolean }>;
  bare?: boolean;
  missing?: boolean;
  /** True when this slot is missing only because a limb above it is. */
  derivedMissing?: boolean;
}

export type BeholderBodyView = Record<string, BeholderSlotView>;

/**
 * Mark dependents of a missing limb as missing, transitively, without touching the
 * stored state. Derived entries are flagged so the panel can show them as a
 * consequence rather than as something separately recorded — restoring the limb
 * restores them on its own.
 */
export function withDependentMissing(body: BeholderBodyView | undefined | null): BeholderBodyView {
  if (!body || typeof body !== "object") return {};
  const out: BeholderBodyView = {};
  for (const [slot, value] of Object.entries(body)) out[slot] = { ...value };

  let changed = true;
  while (changed) {
    changed = false;
    for (const [parent, children] of Object.entries(MISSING_DEPENDENTS)) {
      if (out[parent]?.missing !== true) continue;
      for (const child of children) {
        if (out[child]?.missing === true) continue;
        out[child] = { ...(out[child] ?? {}), missing: true, derivedMissing: true };
        changed = true;
      }
    }
  }
  return out;
}

/** True when a slot holds nothing worth drawing a row for. */
export function isSlotEmpty(slot: BeholderSlotView | undefined): boolean {
  if (!slot) return true;
  return !slot.worn?.length && !slot.wounds?.length && !slot.holding && slot.bare !== true && slot.missing !== true;
}

export interface BeholderRow {
  /** One slot, or a left/right pair rendered side by side. */
  slots: string[];
}

/**
 * Walk the anatomy in order and group it into rows for a layout.
 *
 * `paired` couples left and right so an asymmetry is visible on one line; the other
 * layouts keep one slot per row. Empty slots are dropped, but a pair with state on
 * only one side keeps both cells so the gap itself is legible — "the right boot is
 * gone" reads as an absence next to a present left boot, not as a missing row.
 */
export function buildBeholderRows(body: BeholderBodyView, layout: BeholderLayout): BeholderRow[] {
  const rows: BeholderRow[] = [];
  const consumed = new Set<string>();

  for (const slot of LAYOUT_SLOT_ORDER) {
    if (consumed.has(slot)) continue;
    const partner = PAIR_OF[slot];

    if (layout === "paired" && partner) {
      const hasSlot = !isSlotEmpty(body[slot]);
      const hasPartner = !isSlotEmpty(body[partner]);
      consumed.add(slot);
      consumed.add(partner);
      if (hasSlot || hasPartner) rows.push({ slots: [slot, partner] });
      continue;
    }

    consumed.add(slot);
    if (!isSlotEmpty(body[slot])) rows.push({ slots: [slot] });
  }

  // Anything the model emitted that is not in the canonical order still gets a row,
  // rather than vanishing from the panel with no trace.
  for (const slot of Object.keys(body)) {
    if (consumed.has(slot) || isSlotEmpty(body[slot])) continue;
    rows.push({ slots: [slot] });
  }
  return rows;
}

/** "left_hand" -> "left hand", for display. */
export function slotLabel(slot: string): string {
  return slot.replaceAll("_", " ");
}
