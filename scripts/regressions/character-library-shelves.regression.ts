import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CHARACTER_LIBRARY_SHELVES,
  CHARACTER_LIBRARY_STATUSES,
} from "../../packages/shared/src/types/character-library.js";

const viewSource = readFileSync(
  new URL("../../packages/client/src/components/characters/CharacterLibraryView.tsx", import.meta.url),
  "utf8",
).replace(/\r\n?/gu, "\n");

const locales = JSON.parse(
  readFileSync(new URL("../../packages/client/src/localization/locales/en.json", import.meta.url), "utf8"),
) as Record<string, string>;

// Every shelf and status needs a label, or the tab renders as a raw key.
for (const shelf of CHARACTER_LIBRARY_SHELVES) {
  const match = new RegExp(`"?${shelf}"?: "(characters\\.shelves\\.[A-Za-z]+)"`, "u").exec(viewSource);
  assert.ok(match, `shelf ${shelf} needs a label key`);
  assert.ok(locales[match[1]], `missing translation for ${match[1]}`);
}
for (const status of CHARACTER_LIBRARY_STATUSES) {
  const match = new RegExp(`"?${status}"?: "(characters\\.status\\.[A-Za-z]+)"`, "u").exec(viewSource);
  assert.ok(match, `status ${status} needs a label key`);
  assert.ok(locales[match[1]], `missing translation for ${match[1]}`);
}

// Shelf counts must come from the whole library state, not the filtered list,
// so a shelf still shows what is waiting on it while another shelf is open.
assert.match(viewSource, /const shelfCounts = useMemo\(\(\) => \{[\s\S]{0,400}libraryStateQuery\.data/u);

// The persona library shares this view and has no library status.
assert.match(viewSource, /if \(isPersonaLibrary\) return matching;/u);

console.info("Character library shelves regression checks passed.");
