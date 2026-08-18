/**
 * Recognises requests that turn the current chat into reusable world material
 * ("turn this chat into a lorebook", "extract the important characters").
 *
 * Pure and deterministic. The caller supplies the active chat and executes the
 * plan; nothing here reads stores or transcripts.
 */

export type ChatExtractionKind = "lorebook" | "characters" | "locations" | "campaign";

export interface ChatExtraction {
  kind: ChatExtractionKind;
  /** The user's original request, kept verbatim for the Mari handoff. */
  seed: string;
  /** What the app creates up front, if anything, before Mari fills it in. */
  creates: "lorebook" | null;
}

const EXTRACTION_PATTERNS: readonly (readonly [ChatExtractionKind, RegExp])[] = [
  // Order matters: a campaign request also mentions "from this story".
  ["campaign", /\b(?:campaign|adventure)\b/i],
  ["characters", /\b(?:characters?|cast|people|npcs?)\b/i],
  ["locations", /\b(?:locations?|places?|maps?|settings?)\b/i],
  ["lorebook", /\b(?:lorebook|world|lore|world\s*book)\b/i],
];

/** Phrases that point at the current chat rather than a named resource. */
const REFERS_TO_CHAT = /\b(?:this\s+(?:chat|story|scene|conversation|rp)|the\s+current\s+chat|here)\b/i;

/** Verbs that mean "derive something new from what already exists". */
const EXTRACTION_VERB = /\b(?:turn|convert|extract|pull|make|create|build|generate)\b/i;

/**
 * Parses an extraction request. Returns null unless the text both names an
 * extraction verb and points at the current chat, so ordinary creation and
 * search requests are unaffected.
 */
export function parseChatExtraction(query: string): ChatExtraction | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  if (!EXTRACTION_VERB.test(trimmed) || !REFERS_TO_CHAT.test(trimmed)) return null;

  const kind = EXTRACTION_PATTERNS.find(([, pattern]) => pattern.test(trimmed))?.[0];
  if (!kind) return null;

  // Only a lorebook has an empty shell worth creating before Mari fills it.
  // Characters, locations and campaigns need judgement about what exists first.
  return { kind, seed: trimmed, creates: kind === "lorebook" ? "lorebook" : null };
}
