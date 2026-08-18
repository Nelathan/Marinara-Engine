/**
 * Recognises game-mode requests typed into the omnibar. Only rolls are executed
 * directly; everything else is routed to Mari with the game chat as context,
 * because party, quest and scene changes need judgement about the live state.
 *
 * Pure and deterministic: no store access, no dice are actually rolled here.
 */

export type GameCommand =
  | { kind: "roll"; notation: string }
  | { kind: "assist"; topic: "party" | "quests" | "scene" | "encounter" };

/** Standard dice notation: 2d6, d20, 3d8+2, 1d4-1. */
const DICE_NOTATION = /\b(\d*)d(\d+)\s*([+-]\s*\d+)?\b/i;
const ROLL_VERB = /\b(?:roll|throw)\b/i;

const ASSIST_TOPICS: readonly (readonly [Extract<GameCommand, { kind: "assist" }>["topic"], RegExp])[] = [
  ["party", /\b(?:party|healer|tank|rogue|companion|recruit|member)\b/i],
  ["quests", /\b(?:quests?|objectives?|goals?)\b/i],
  ["encounter", /\b(?:encounter|battle|fight|combat|initiative)\b/i],
  ["scene", /\b(?:scene|map|location|setting)\b/i],
];

/**
 * Parses a game request. Returns null when the text is not a game command, so
 * the omnibar falls through to normal search.
 */
export function parseGameCommand(query: string): GameCommand | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const dice = trimmed.match(DICE_NOTATION);
  // "roll 2d6" and a bare "2d6" are both rolls; "d20 lorebook" is not, because
  // the notation must be the whole request apart from the verb.
  if (dice && (ROLL_VERB.test(trimmed) || trimmed.replace(DICE_NOTATION, "").trim() === "")) {
    const count = dice[1] && dice[1] !== "" ? dice[1] : "1";
    const modifier = dice[3] ? dice[3].replace(/\s+/g, "") : "";
    return { kind: "roll", notation: `${count}d${dice[2]}${modifier}` };
  }

  const topic = ASSIST_TOPICS.find(([, pattern]) => pattern.test(trimmed))?.[0];
  return topic ? { kind: "assist", topic } : null;
}
