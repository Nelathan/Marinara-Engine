/**
 * Recognises game-mode requests typed into the omnibar and routes them to Mari
 * with the game chat as context, because party, quest and scene changes need
 * judgement about the live state.
 *
 * Dice are deliberately not here: the game input bar already rolls them, and its
 * roll attaches the result to your turn so the model sees it. See
 * `docs/development/omnibar-feature-inventory.md`.
 *
 * Pure and deterministic: no store access.
 */

export type GameCommand = { kind: "assist"; topic: "party" | "quests" | "scene" | "encounter" };

const ASSIST_TOPICS: readonly (readonly [GameCommand["topic"], RegExp])[] = [
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

  const topic = ASSIST_TOPICS.find(([, pattern]) => pattern.test(trimmed))?.[0];
  return topic ? { kind: "assist", topic } : null;
}
