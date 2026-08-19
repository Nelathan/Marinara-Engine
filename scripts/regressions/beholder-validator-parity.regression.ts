// Beholder validator parity gate.
//
// The fixture is generated from the datagen validator that produced Beholder's training
// labels, and is vendored here unchanged. That validator is the source of truth; this
// asserts the port reproduces the same findings (rule id, path, severity) and the same
// stripped delta on every case. Any drift in the ported rules fails here rather than
// silently letting an impossible emission into tracked state.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PORTED_RULES,
  applyBeholderValidator,
  type BeholderFinding,
} from "../../packages/server/src/services/agents/beholder-validator.js";

interface FixtureCase {
  name: string;
  input: { merged: unknown; prev?: Record<string, unknown>; persona?: string | null; prose?: string | null };
  findings: Array<{ rule_id: string; path: string; severity: string }>;
  stripped: unknown;
}

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "beholder-validator-cases.json");
const { cases } = JSON.parse(readFileSync(fixturePath, "utf8")) as { cases: FixtureCase[] };
assert.ok(cases.length > 0, "the fixture must carry cases");

// ITEM-WRONG-SLOT is emitted per category (ITEM-WRONG-SLOT-BAG); compare by family.
const family = (ruleId: string): string => (ruleId.startsWith("ITEM-WRONG-SLOT-") ? "ITEM-WRONG-SLOT" : ruleId);

const signature = (findings: Array<{ rule_id: string; path: string; severity: string }>): string[] =>
  findings
    .map((entry) => `${entry.rule_id}|${entry.path}|${entry.severity}`)
    .sort((left, right) => (left < right ? -1 : 1));

let checked = 0;
const failures: string[] = [];

for (const testCase of cases) {
  const { merged, prev = {}, persona = null, prose = null } = testCase.input;
  const { findings, stripped } = applyBeholderValidator(merged, { persona, prevState: prev, prose });

  // The oracle also carries rules this port has not taken on; parity is asserted over
  // the ported scope, so an unported rule shows up as a missing finding rather than a
  // false mismatch.
  const expectedInScope = testCase.findings.filter((entry) => PORTED_RULES.has(family(entry.rule_id)));
  const actual = findings as BeholderFinding[];

  const expectedSig = signature(expectedInScope);
  const actualSig = signature(actual.filter((entry) => PORTED_RULES.has(family(entry.rule_id))));

  if (JSON.stringify(expectedSig) !== JSON.stringify(actualSig)) {
    failures.push(
      `${testCase.name}: findings differ\n    expected ${JSON.stringify(expectedSig)}\n    actual   ${JSON.stringify(actualSig)}`,
    );
    continue;
  }

  // The stripped delta is compared in full: it is what actually reaches tracked state.
  const expectedStripped = JSON.stringify(testCase.stripped);
  const actualStripped = JSON.stringify(stripped);
  if (expectedStripped !== actualStripped) {
    failures.push(
      `${testCase.name}: stripped delta differs\n    expected ${expectedStripped}\n    actual   ${actualStripped}`,
    );
    continue;
  }
  checked += 1;
}

if (failures.length) {
  assert.fail(`${failures.length}/${cases.length} validator parity cases failed:\n  - ${failures.join("\n  - ")}`);
}

assert.equal(checked, cases.length, "every fixture case must be checked");
console.log(`beholder validator parity: ${checked}/${cases.length} cases match the datagen oracle`);
