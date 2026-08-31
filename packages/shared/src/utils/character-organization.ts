// ──────────────────────────────────────────────
// Character library organization proposals
// ──────────────────────────────────────────────
import { characterTagKey, characterTagKeys } from "./character-tags.js";

/**
 * How confident a proposal is.
 *
 * `high` means a deterministic rule fired (two spellings reduce to the same
 * letters). `possible` means a heuristic fired and a human should look. No
 * proposal is ever applied automatically regardless of confidence.
 */
export type OrganizationConfidence = "high" | "possible";

export type DuplicateTagGroup = {
  /** Canonical key proposed to absorb the others: the most used spelling. */
  canonicalKey: string;
  canonicalLabel: string;
  /** The other keys that would fold into the canonical one. */
  duplicateKeys: string[];
  /** Characters affected if the merge is accepted. */
  characterCount: number;
  confidence: OrganizationConfidence;
  /** Plain-language statement of why these were grouped. */
  reason: "same-letters" | "singular-plural";
};

/**
 * Reduce a tag to its bare letters and digits.
 *
 * "slow burn", "slow-burn", "Slow_Burn", and "slowburn" all reduce to
 * "slowburn". Two tags sharing this form differ only in punctuation and case,
 * which is a spelling difference rather than a difference in meaning.
 */
function squashTag(key: string): string {
  return key.replace(/[^\p{L}\p{N}]+/gu, "");
}

/**
 * Fold a very cautious English plural.
 *
 * Only a trailing "s" on a word of at least four letters, and never "ss".
 * Deliberately narrow: "vampires"/"vampire" is worth catching, but folding
 * more aggressively starts merging words that genuinely differ.
 */
function foldPlural(squashed: string): string {
  if (squashed.length < 4) return squashed;
  if (squashed.endsWith("ss")) return squashed;
  return squashed.endsWith("s") ? squashed.slice(0, -1) : squashed;
}

export type DuplicateTagInput = {
  key: string;
  label: string;
  count: number;
};

/**
 * Find tags that are probably the same tag spelled differently.
 *
 * Deliberately conservative. It reports only differences of punctuation, case,
 * and a narrow plural, never a general edit distance: "fantasy" and "fantast"
 * are one character apart and mean different things, and a wrong merge cannot
 * be undone by merging back.
 */
export function findDuplicateTagGroups(entries: readonly DuplicateTagInput[]): DuplicateTagGroup[] {
  const bySquash = new Map<string, DuplicateTagInput[]>();
  for (const entry of entries) {
    const squashed = squashTag(entry.key);
    if (!squashed) continue;
    const bucket = bySquash.get(squashed);
    if (bucket) bucket.push(entry);
    else bySquash.set(squashed, [entry]);
  }

  const groups: DuplicateTagGroup[] = [];
  const consumed = new Set<string>();

  const build = (members: DuplicateTagInput[], reason: DuplicateTagGroup["reason"]): DuplicateTagGroup | null => {
    if (members.length < 2) return null;
    // The most used spelling wins, ties broken by codepoint so the proposal is
    // identical on every run.
    const sorted = [...members].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
    const [canonical, ...rest] = sorted;
    if (!canonical) return null;
    return {
      canonicalKey: canonical.key,
      canonicalLabel: canonical.label,
      duplicateKeys: rest.map((member) => member.key),
      // An upper bound: a character carrying two of these spellings is counted
      // once per spelling, so the real figure can be lower. The apply path
      // previews the exact number before anything is written.
      characterCount: sorted.reduce((total, member) => total + member.count, 0),
      confidence: reason === "same-letters" ? "high" : "possible",
      reason,
    };
  };

  for (const [squashed, members] of bySquash) {
    const group = build(members, "same-letters");
    if (!group) continue;
    groups.push(group);
    consumed.add(squashed);
    for (const member of members) consumed.add(member.key);
  }

  // Second pass for singular/plural, over squash forms not already merged.
  const byPlural = new Map<string, DuplicateTagInput[]>();
  for (const [squashed, members] of bySquash) {
    if (consumed.has(squashed) && members.length > 1) continue;
    const folded = foldPlural(squashed);
    const bucket = byPlural.get(folded);
    if (bucket) bucket.push(...members);
    else byPlural.set(folded, [...members]);
  }
  for (const members of byPlural.values()) {
    if (members.length < 2) continue;
    // Skip anything the same-letters pass already reported.
    if (new Set(members.map((member) => squashTag(member.key))).size < 2) continue;
    const group = build(members, "singular-plural");
    if (group) groups.push(group);
  }

  return groups.sort((a, b) => b.characterCount - a.characterCount || (a.canonicalKey < b.canonicalKey ? -1 : 1));
}

export type SimilarCharacter = {
  id: string;
  name: string;
  tags: readonly string[];
  /** Calibrated 0-1 similarity to the character being organized. */
  similarity: number;
};

export type TagSuggestion = {
  tagKey: string;
  tagLabel: string;
  /** How many of the similar characters carry this tag. */
  support: number;
  /** Names of those characters, so the user can judge the suggestion. */
  evidence: string[];
  confidence: OrganizationConfidence;
};

/**
 * Suggest tags for a character from the tags its nearest neighbours carry.
 *
 * This is evidence, not invention: every suggestion names the characters it
 * came from, so the user can see why it was proposed and reject it on sight.
 * A language model asked to invent tags would produce plausible text with no
 * way to check it, which is the opposite of what a cleanup tool needs.
 */
export function suggestTagsFromSimilar(
  currentTags: readonly string[] | undefined,
  similar: readonly SimilarCharacter[],
  options: { minSupport?: number; limit?: number } = {},
): TagSuggestion[] {
  const minSupport = options.minSupport ?? 2;
  const limit = options.limit ?? 8;
  const present = characterTagKeys(currentTags);

  const tally = new Map<string, { label: string; evidence: string[]; weight: number }>();
  for (const neighbour of similar) {
    for (const key of characterTagKeys(neighbour.tags)) {
      if (present.has(key)) continue;
      const label = neighbour.tags.find((tag) => characterTagKey(tag) === key) ?? key;
      const entry = tally.get(key) ?? { label, evidence: [], weight: 0 };
      // One vote per neighbour, weighted by how similar that neighbour is, so
      // a tag shared by close matches outranks one shared by distant ones.
      if (!entry.evidence.includes(neighbour.name)) entry.evidence.push(neighbour.name);
      entry.weight += neighbour.similarity;
      tally.set(key, entry);
    }
  }

  return [...tally.entries()]
    .map(([tagKey, entry]) => ({
      tagKey,
      tagLabel: entry.label,
      support: entry.evidence.length,
      evidence: entry.evidence,
      confidence: (entry.evidence.length >= 3 ? "high" : "possible") as OrganizationConfidence,
      weight: entry.weight,
    }))
    .filter((suggestion) => suggestion.support >= minSupport)
    .sort((a, b) => b.weight - a.weight || (a.tagKey < b.tagKey ? -1 : 1))
    .slice(0, limit)
    .map(({ weight: _weight, ...suggestion }) => suggestion);
}

export type DuplicateCharacterPair = {
  leftId: string;
  leftName: string;
  rightId: string;
  rightName: string;
  similarity: number;
  confidence: OrganizationConfidence;
};

/**
 * Report character pairs similar enough to be versions of one card.
 *
 * Reporting only: two cards being alike is never grounds for deleting one, so
 * this produces a list to look at, never an action.
 */
export function findDuplicateCharacterPairs(
  pairs: readonly { leftId: string; leftName: string; rightId: string; rightName: string; similarity: number }[],
  options: { highThreshold?: number; minThreshold?: number; limit?: number } = {},
): DuplicateCharacterPair[] {
  const highThreshold = options.highThreshold ?? 0.9;
  const minThreshold = options.minThreshold ?? 0.75;
  return pairs
    .filter((pair) => pair.similarity >= minThreshold && pair.leftId !== pair.rightId)
    .sort((a, b) => b.similarity - a.similarity || (a.leftId < b.leftId ? -1 : 1))
    .slice(0, options.limit ?? 25)
    .map((pair) => ({
      ...pair,
      confidence: (pair.similarity >= highThreshold ? "high" : "possible") as OrganizationConfidence,
    }));
}

/** Everything the organization desk offers, as returned by the server. */
export type CharacterOrganizationProposals = {
  /** False when no embedder is available; tag-name cleanup still works. */
  semanticAvailable: boolean;
  duplicateTags: DuplicateTagGroup[];
  duplicateCharacters: DuplicateCharacterPair[];
  tagSuggestions: Array<{ characterId: string; characterName: string; suggestions: TagSuggestion[] }>;
};
