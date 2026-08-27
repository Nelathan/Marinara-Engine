import { extractLeadingThinkingBlocks, type CombatEncounterObjective } from "@marinara-engine/shared";
import { logger } from "../../lib/logger.js";
import { parseGameJsonish, parseRepairedGameJsonish } from "./jsonish.js";

export const FLEEING_ESCAPE_OBJECTIVE: CombatEncounterObjective = {
  id: "reach-the-exit",
  kind: "escape",
  label: "Reach the exit",
  requiredProgress: 1,
};

export const COMBAT_INIT_DROPPED_STREAM_ERROR =
  "Encounter init failed: the AI provider connection dropped mid-response";

const DROPPED_STREAM_FINISH_REASONS = new Set([
  "error",
  "terminated",
  "abort",
  "aborted",
  "cancelled",
  "canceled",
]);

export function isDroppedStreamFinishReason(finishReason?: string | null): boolean {
  const normalized = (finishReason ?? "").trim().toLowerCase();
  return DROPPED_STREAM_FINISH_REASONS.has(normalized);
}

/** High-signal party-is-fleeing phrases. Ordinary "run into the guards" stand-and-fight scenes must not match. */
const FLEEING_HISTORY_PATTERNS: RegExp[] = [
  /\byou run\.(?:\s|$)/i,
  /\byou run[,!]?(?:\s+(?:away|for (?:it|cover|the (?:exit|door|hills?))|toward|towards|from|out|off|back))\b/i,
  /\byou(?:['’]re| are)? (?:running away|fleeing|escaping|retreating|getting away)\b/i,
  /\byou (?:flee|fled|escape[d]?|retreat(?:ed)?)\b/i,
  /\b(?:the )?party (?:runs? away|is running away|flees|is fleeing|escapes|is escaping|retreats|is retreating|gets away)\b/i,
  /\b(?:try(?:ing)? to|attempts? to) (?:flee|escape|get away|run away|retreat)\b/i,
  /\b(?:make|making) (?:a |your |our )?break (?:for (?:it|the (?:exit|door))|away)\b/i,
  /\bget(?:ting)? away\b/i,
];

export function historyIndicatesFleeing(history: Array<{ content?: string } | string>): boolean {
  const text = history
    .slice(-8)
    .map((entry) => (typeof entry === "string" ? entry : (entry.content ?? "")))
    .join("\n");
  if (!text.trim()) return false;
  return FLEEING_HISTORY_PATTERNS.some((pattern) => pattern.test(text));
}

export const COMBAT_INIT_OBJECTIVE_NOTES =
  `- objectives: include one or more goals that match the scene. Use eliminate for ordinary stand-and-fight scenes. If the recent history shows the party running, retreating, escaping, or getting away, the PRIMARY objective MUST be kind "escape" (reach the exit) — never default a chase to eliminate. Use exact party/enemy names in targetNames for defend, escort, or targeted elimination. requiredProgress is the number of rounds/interactions/targets required. The two entries above are format examples, not a required pair — emit only the goals this scene actually needs.\n`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isUsableCombatBlueprint(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.party) &&
    value.party.length > 0 &&
    Array.isArray(value.enemies) &&
    value.enemies.length > 0
  );
}

function objectiveKind(value: unknown): string | null {
  if (!isRecord(value) || typeof value.kind !== "string") return null;
  return value.kind;
}

/** glm-5.2 often wraps the blueprint as a same-line markdown fence: json code fence then the object. */
function stripMarkdownCodeFences(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```(?:json|markdown)?\s*/i, "");
  text = text.replace(/\s*```\s*$/i, "");
  return text.trim();
}

export function parseCombatInitBlueprint(raw: string): Record<string, unknown> | null {
  const content = stripMarkdownCodeFences(extractLeadingThinkingBlocks(raw).content);
  if (content.trim()) {
    for (const parse of [parseGameJsonish, parseRepairedGameJsonish]) {
      try {
        const parsed = parse(content);
        if (isUsableCombatBlueprint(parsed)) return parsed;
      } catch {
        // Nested fragments or unrepaired JSON are not a usable combat blueprint.
      }
    }
  }
  logger.warn(
    { preview: raw.slice(0, 280).replace(/\s+/g, " ") },
    "[combat-init] failed to parse a usable party+enemies blueprint",
  );
  return null;
}

export function ensureFleeingEscapeObjective(
  blueprint: Record<string, unknown>,
  history: Array<{ content?: string } | string>,
): Record<string, unknown> {
  if (!historyIndicatesFleeing(history)) return blueprint;
  const existing = Array.isArray(blueprint.objectives) ? [...blueprint.objectives] : [];
  const escapeIndex = existing.findIndex((entry) => objectiveKind(entry) === "escape");
  if (escapeIndex === 0) return blueprint;
  if (escapeIndex > 0) {
    const [escape] = existing.splice(escapeIndex, 1);
    return { ...blueprint, objectives: [escape, ...existing] };
  }
  return { ...blueprint, objectives: [FLEEING_ESCAPE_OBJECTIVE, ...existing] };
}

export type CombatInitResolveResult =
  | { ok: true; combatState: Record<string, unknown>; salvaged: boolean }
  | { ok: false; status: 502; error: string };

export function resolveCombatInitFromLlm(input: {
  content: string | null | undefined;
  finishReason?: string | null;
  history: Array<{ content?: string } | string>;
}): CombatInitResolveResult {
  const raw = input.content ?? "";
  const dropped = isDroppedStreamFinishReason(input.finishReason);
  const combatState = parseCombatInitBlueprint(raw);
  if (!combatState) {
    if (dropped) {
      return { ok: false, status: 502, error: COMBAT_INIT_DROPPED_STREAM_ERROR };
    }
    if (!raw.trim()) return { ok: false, status: 502, error: "No response from AI" };
    return { ok: false, status: 502, error: "AI returned invalid JSON" };
  }
  return {
    ok: true,
    combatState: ensureFleeingEscapeObjective(combatState, input.history),
    salvaged: dropped,
  };
}
