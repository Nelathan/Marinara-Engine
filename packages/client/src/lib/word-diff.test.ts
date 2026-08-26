import { diffLines, diffWords } from "./word-diff";

// Minimal assert-based self-check. Run with: pnpm tsx packages/client/src/lib/word-diff.test.ts
function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const words = diffWords("the quick brown fox", "the quick red fox");
assert(words.filter((s) => s.type === "removed").map((s) => s.value).join("") === "brown", "only the changed word is removed");
assert(words.filter((s) => s.type === "added").map((s) => s.value).join("") === "red", "only the changed word is added");

// A one-line edit inside a long text must not repaint the whole text.
const before = ["a", "b", "c", "d", "e", "f", "g", "h", "old line", "i", "j", "k", "l", "m"].join("\n");
const after = before.replace("old line", "new line");
const hunks = diffLines(before, after);
const lines = hunks.flatMap((h) => h.lines);
assert(lines.filter((l) => l.type === "removed").length === 1, "exactly one removed line");
assert(lines.filter((l) => l.type === "added").length === 1, "exactly one added line");
assert(hunks[0].skipped === 5, "unchanged lines beyond the context window collapse");
assert(lines.every((l) => l.type === "equal" || l.segments), "changed lines carry intra-line segments");
const removed = lines.find((l) => l.type === "removed")!;
assert(removed.segments!.every((s) => s.type !== "added"), "a removed line never shows added words");

// Unrelated lines are not force-paired into a word diff.
const rewritten = diffLines("alpha", "totally different");
assert(
  rewritten[0].lines.every((l) => !l.segments),
  "dissimilar lines stay whole-line adds/removes",
);

assert(diffLines("same", "same")[0].lines.every((l) => l.type === "equal"), "identical text is all context");

console.log("word-diff: ok");
