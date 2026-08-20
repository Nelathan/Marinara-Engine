import { createHash } from "node:crypto";

export function quickEditFingerprint(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function validateQuickEditProposal(
  proposal: { expiresAt: string; fingerprint: string },
  currentValue: string,
  now = Date.now(),
): "ok" | "expired" | "stale" {
  if (Date.parse(proposal.expiresAt) <= now) return "expired";
  return quickEditFingerprint(currentValue) === proposal.fingerprint ? "ok" : "stale";
}
