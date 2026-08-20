// The two state helpers the paperdoll needs, kept beside it so the ported file
// can be diffed against its source without rewriting its imports.
import { GARMENT_CANON } from "./garment-data.js";

/** Garment identity folded onto its canonical form ("boots" -> "boot"). */
export function canonicalGarment(item: unknown): string {
  if (typeof item !== "string") return "";
  const name = item.trim().toLowerCase();
  return (GARMENT_CANON as Record<string, string>)[name] ?? name;
}

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

/**
 * A missing limb implies its dependents are missing too, applied transitively.
 * Derived for display only — never written back — so restoring the limb restores
 * everything below it.
 */
export function withDependentMissing(body: any): Record<string, any> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const out: Record<string, any> = { ...body };
  let changed = true;
  while (changed) {
    changed = false;
    for (const [parent, children] of Object.entries(MISSING_DEPENDENTS)) {
      if (out[parent]?.missing !== true) continue;
      for (const child of children) {
        if (out[child]?.missing === true) continue;
        out[child] = { ...(out[child] || {}), missing: true, derivedMissing: true };
        changed = true;
      }
    }
  }
  return out;
}
