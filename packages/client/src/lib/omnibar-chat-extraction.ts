/**
 * Recognises requests that turn the current chat into a lorebook ("turn this
 * chat into a lorebook", "make a world book from this story").
 *
 * It once recognised characters, locations and campaigns too, but those three
 * created nothing — they handed the sentence to Mari, which is what the
 * Ask-Mari row already does. Only the lorebook has an empty shell worth
 * creating up front, so only the lorebook earns its own row.
 *
 * Pure and deterministic. The caller supplies the active chat and executes the
 * plan; nothing here reads stores or transcripts.
 */

export interface ChatExtraction {
  /** The user's original request, kept verbatim for the Mari handoff. */
  seed: string;
}

/** Phrases that point at the current chat rather than a named resource. */
const REFERS_TO_CHAT = /\b(?:this\s+(?:chat|story|scene|conversation|rp)|the\s+current\s+chat)\b/i;

/** Verbs that mean "derive something new from what already exists". */
const EXTRACTION_VERB = /\b(?:turn|convert|extract|pull|make|create|build|generate)\b/i;

const LOREBOOK = /\b(?:lorebook|world|lore|world\s*book)\b/i;

/**
 * Parses an extraction request. Returns null unless the text names an
 * extraction verb, points at the current chat, and asks for a lorebook, so
 * ordinary creation and search requests are unaffected.
 */
export function parseChatExtraction(query: string): ChatExtraction | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  if (!EXTRACTION_VERB.test(trimmed) || !REFERS_TO_CHAT.test(trimmed)) return null;
  return LOREBOOK.test(trimmed) ? { seed: trimmed } : null;
}
