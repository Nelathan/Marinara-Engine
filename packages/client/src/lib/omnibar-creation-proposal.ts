/**
 * Turns a creation seed typed into the omnibar ("start a mystery with Luna",
 * "create a campaign about a haunted train") into a compact proposal the user
 * can read before anything is created.
 *
 * Pure and deterministic: no LLM, no store access. The caller resolves named
 * characters against the workspace and executes the plan.
 */

export type CreationProposalGoal = "scene" | "campaign" | "world";

export type CreationProposalItemKind = "chat" | "character" | "lorebook" | "campaign" | "world";

export interface CreationProposalItem {
  kind: CreationProposalItemKind;
  label: string;
  /** "known" resolves to an existing resource; "missing" must be created. */
  status: "known" | "missing";
  id?: string;
  /** How many to create, for unresolved role counts like "three characters". */
  count?: number;
}

export interface CreationProposal {
  goal: CreationProposalGoal;
  /** The user's original seed, kept verbatim for the Mari handoff. */
  seed: string;
  title: string;
  genre?: string;
  setting?: string;
  /** Names the user mentioned, before workspace resolution. */
  characterNames: string[];
  /** Additional unnamed characters requested, e.g. "with three characters". */
  extraCharacterCount: number;
  items: CreationProposalItem[];
  /** High-value choices the seed left open. Mari should ask these one at a time. */
  missingDecisions: string[];
}

const GOAL_PATTERNS: readonly (readonly [CreationProposalGoal, RegExp])[] = [
  ["campaign", /\b(?:campaign|adventure|quest\s+line)\b/i],
  ["world", /\b(?:world|setting|universe)\b/i],
  ["scene", /\b(?:scene|story|chat|roleplay|rp)\b/i],
];

const SEED_VERB = /^(?:start|begin|create|make|build|set\s+up|run)\s+(?:a|an|the|my)?\s*/i;

// Longest first, so "dark fantasy" wins over "fantasy".
const GENRES = [
  "slow-burn romance",
  "science fiction",
  "dark fantasy",
  "cyberpunk",
  "mystery",
  "thriller",
  "romance",
  "fantasy",
  "western",
  "comedy",
  "horror",
  "sci-fi",
  "noir",
] as const;

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

/** Splits "Luna and Rowan" / "Luna, Rowan" into names, dropping filler. */
function splitNames(raw: string): string[] {
  return raw
    .split(/\s*(?:,|\band\b|&)\s*/i)
    .map((part) => part.replace(/^(?:a|an|the)\s+/i, "").trim())
    .filter((part) => part.length > 0 && part.length <= 60 && !/^\d+$/.test(part));
}

/**
 * Parses a creation seed. Returns null when the text is not a creation request,
 * so the omnibar can fall through to normal search.
 */
export function parseCreationSeed(query: string): CreationProposal | null {
  const trimmed = query.trim();
  if (!trimmed || !SEED_VERB.test(trimmed)) return null;

  const goal = GOAL_PATTERNS.find(([, pattern]) => pattern.test(trimmed))?.[0];
  const genre = GENRES.find((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(trimmed));
  // A seed needs a recognisable shape; a bare "create a thing" is not a proposal.
  if (!goal && !genre) return null;

  const settingMatch = trimmed.match(/\b(?:about|in|set\s+in|based\s+on)\s+(?:a|an|the)?\s*([^,]+?)(?:\s+with\b|$)/i);
  const setting = settingMatch?.[1]?.trim();

  const withMatch = trimmed.match(/\bwith\s+(.+)$/i);
  let characterNames: string[] = [];
  let extraCharacterCount = 0;
  if (withMatch?.[1]) {
    // "with Luna in a haunted hotel" names Luna and sets the scene elsewhere:
    // stop the cast at the first setting preposition.
    const withPart = withMatch[1].replace(/\s+\b(?:in|at|about|set\s+in|based\s+on)\b\s+.*$/i, "").trim();
    const countMatch = withPart.match(
      /^(\d+|one|two|three|four|five|six)\s+(?:more\s+)?(?:characters?|people|npcs?)\b/i,
    );
    if (countMatch) {
      const token = countMatch[1]!.toLowerCase();
      extraCharacterCount = NUMBER_WORDS[token] ?? Number.parseInt(token, 10) ?? 0;
    } else {
      characterNames = splitNames(withPart);
    }
  }

  const resolvedGoal: CreationProposalGoal = goal ?? "scene";
  const titleBase = [genre, resolvedGoal].filter(Boolean).join(" ");
  const title = setting ? `${titleBase}: ${setting}` : titleBase;

  const items: CreationProposalItem[] = [];
  if (resolvedGoal === "campaign") items.push({ kind: "campaign", label: title, status: "missing" });
  if (resolvedGoal === "world") items.push({ kind: "world", label: setting ?? title, status: "missing" });
  for (const name of characterNames) items.push({ kind: "character", label: name, status: "known" });
  if (extraCharacterCount > 0)
    items.push({
      kind: "character",
      label: `${extraCharacterCount} more characters`,
      status: "missing",
      count: extraCharacterCount,
    });
  // A campaign or a named world is worth its own lorebook; a bare scene is not.
  if (resolvedGoal !== "scene" && setting) items.push({ kind: "lorebook", label: setting, status: "missing" });
  items.push({ kind: "chat", label: title, status: "missing" });

  const missingDecisions: string[] = [];
  if (!genre) missingDecisions.push("Tone");
  if (!setting) missingDecisions.push("Setting");
  if (characterNames.length === 0 && extraCharacterCount === 0) missingDecisions.push("Who leads it");

  return {
    goal: resolvedGoal,
    seed: trimmed,
    title,
    ...(genre ? { genre } : {}),
    ...(setting ? { setting } : {}),
    characterNames,
    extraCharacterCount,
    items,
    missingDecisions,
  };
}

/**
 * Splits a proposal into what the app can create deterministically now and what
 * needs Mari's judgement. Items whose named characters did not resolve against
 * the workspace move to the Mari side rather than being silently invented.
 */
export function splitProposalWork(
  proposal: CreationProposal,
  resolveCharacter: (name: string) => string | undefined,
): { direct: CreationProposalItem[]; assisted: CreationProposalItem[] } {
  const direct: CreationProposalItem[] = [];
  const assisted: CreationProposalItem[] = [];
  for (const item of proposal.items) {
    if (item.kind === "character" && item.status === "known") {
      const id = resolveCharacter(item.label);
      if (id) direct.push({ ...item, id });
      else assisted.push({ ...item, status: "missing" });
      continue;
    }
    if (item.kind === "chat") direct.push(item);
    else assisted.push(item);
  }
  return { direct, assisted };
}
