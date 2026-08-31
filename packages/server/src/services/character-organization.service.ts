// ──────────────────────────────────────────────
// Character library organization proposals
// ──────────────────────────────────────────────
//
// Suggestions are derived from evidence already on this device, not generated
// prose. Two reasons:
//
//  - A language model asked to invent tags returns plausible text with nothing
//    to check it against. A cleanup tool that quietly invents metadata makes
//    the library worse in a way the user cannot see.
//  - The on-device embedder (#4768) already indexes every character's name,
//    description, personality, scenario, and tags. Nearest-neighbour tags are
//    a real signal, they cost nothing, and no card content leaves the machine.
//
// Every proposal names the characters it came from, and nothing here writes.
import {
  buildCharacterTagIndex,
  findDuplicateCharacterPairs,
  findDuplicateTagGroups,
  suggestTagsFromSimilar,
  type CharacterData,
  type CharacterOrganizationProposals,
} from "@marinara-engine/shared";
import type { DB } from "../db/connection.js";
import { characters } from "../db/schema/index.js";
import { logger } from "../lib/logger.js";
import { createEntityEmbeddingStore } from "./entity-embedding-store.js";
import { warmEntityEmbeddings, type EntityCandidate, type EntityDescriptor } from "./entity-semantic-search.js";
import { calibrateLorebookSimilarity, cosineSimilarity, lorebookSimilarityBaseline } from "./lorebook/embeddings.js";
import { isMemoryRecallVectorizerAvailable } from "./memory-recall-embedding.js";

/** Nearest neighbours consulted per character when suggesting tags. */
const NEIGHBOURS_PER_CHARACTER = 5;
/** Below this calibrated similarity a neighbour is noise, not evidence. */
const MIN_NEIGHBOUR_SIMILARITY = 0.3;

function parseTags(raw: string): string[] {
  try {
    const tags = (JSON.parse(raw) as CharacterData).tags;
    return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export function createCharacterOrganizationService(db: DB) {
  return {
    /**
     * Build every proposal the desk can offer.
     *
     * Degrades rather than failing: with no embedder the duplicate-tag report
     * still runs, because it needs only tag names.
     */
    async listProposals(options: { limit?: number } = {}): Promise<CharacterOrganizationProposals> {
      const rows = await db.select().from(characters);
      const tagIndex = buildCharacterTagIndex(rows.map((row) => parseTags(row.data)));
      const duplicateTags = findDuplicateTagGroups(
        tagIndex.map((entry) => ({ key: entry.key, label: entry.label, count: entry.count })),
      );

      const semanticAvailable = await isMemoryRecallVectorizerAvailable(db, {});
      if (!semanticAvailable) {
        return { semanticAvailable: false, duplicateTags, duplicateCharacters: [], tagSuggestions: [] };
      }

      const store = createEntityEmbeddingStore(db);
      const descriptor: EntityDescriptor = {
        type: "character",
        listAll: () => store.listCandidates("character"),
        updateEmbedding: (id, vector, embedText) => store.updateEmbedding("character", id, vector, embedText),
      };

      let pool: EntityCandidate[] = [];
      try {
        pool = await descriptor.listAll();
        // Warming is bounded per call, so a cold library improves over
        // repeated visits rather than blocking one long request.
        await warmEntityEmbeddings(descriptor, pool, {});
      } catch (err) {
        logger.warn(err, "[character-organization] embedding warmup failed; reporting tag cleanup only");
        return { semanticAvailable: false, duplicateTags, duplicateCharacters: [], tagSuggestions: [] };
      }

      const embedded = pool.filter((candidate) => candidate.embedding && candidate.embedding.length > 0);
      if (embedded.length < 2) {
        return { semanticAvailable: true, duplicateTags, duplicateCharacters: [], tagSuggestions: [] };
      }

      // Subtract the model's common cosine floor so thresholds mean the same
      // thing across embedding models, matching the lorebook and entity paths.
      const baseline = lorebookSimilarityBaseline(embedded.map((candidate) => candidate.embedding as number[]));
      const tagsById = new Map(rows.map((row) => [row.id, parseTags(row.data)]));

      const pairs: Array<{ leftId: string; leftName: string; rightId: string; rightName: string; similarity: number }> =
        [];
      const neighbours = new Map<string, Array<{ id: string; name: string; similarity: number }>>();

      for (let i = 0; i < embedded.length; i += 1) {
        for (let j = i + 1; j < embedded.length; j += 1) {
          const left = embedded[i]!;
          const right = embedded[j]!;
          const similarity = calibrateLorebookSimilarity(
            cosineSimilarity(left.embedding as number[], right.embedding as number[]),
            baseline,
          );
          if (similarity < MIN_NEIGHBOUR_SIMILARITY) continue;
          pairs.push({
            leftId: left.id,
            leftName: left.name,
            rightId: right.id,
            rightName: right.name,
            similarity,
          });
          for (const [owner, other] of [
            [left, right],
            [right, left],
          ] as const) {
            const list = neighbours.get(owner.id) ?? [];
            list.push({ id: other.id, name: other.name, similarity });
            neighbours.set(owner.id, list);
          }
        }
      }

      const tagSuggestions: CharacterOrganizationProposals["tagSuggestions"] = [];
      for (const candidate of embedded) {
        const list = (neighbours.get(candidate.id) ?? [])
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, NEIGHBOURS_PER_CHARACTER)
          .map((neighbour) => ({
            id: neighbour.id,
            name: neighbour.name,
            tags: tagsById.get(neighbour.id) ?? [],
            similarity: neighbour.similarity,
          }));
        const suggestions = suggestTagsFromSimilar(tagsById.get(candidate.id), list);
        if (suggestions.length > 0) {
          tagSuggestions.push({ characterId: candidate.id, characterName: candidate.name, suggestions });
        }
      }

      return {
        semanticAvailable: true,
        duplicateTags,
        duplicateCharacters: findDuplicateCharacterPairs(pairs),
        tagSuggestions: tagSuggestions
          .sort((a, b) => b.suggestions.length - a.suggestions.length)
          .slice(0, options.limit ?? 50),
      };
    },
  };
}
