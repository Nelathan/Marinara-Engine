import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const editorSource = readFileSync(
  new URL("../../packages/client/src/components/characters/CharacterEditor.tsx", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

// Adding and removing tags must compare canonical keys. Exact-string matching
// let "Fantasy" and "fantasy" coexist on one card and filter identically.
assert.match(editorSource, /const seen = new Set\(existingTags\.map\(\(tag\) => characterTagKey\(tag\)\)\)/u);
assert.match(editorSource, /formData\.tags\.filter\(\(t\) => characterTagKey\(t\) !== characterTagKey\(tag\)\)/u);

// New tags reuse the spelling the library already uses.
assert.match(editorSource, /knownSpellings\?\.get\(key\) \?\? tag/u);

// Suggestions come from the server tag index, not from the loaded pages.
assert.match(editorSource, /useCharacterTagIndex\(\)/u);
assert.match(editorSource, /<datalist id=\{tagSuggestionsId\}>/u);

console.info("Character editor tag regression checks passed.");
