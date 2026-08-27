import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { jsonishLooksTruncated } from "../../packages/server/src/services/game/jsonish.ts";
import {
  COMBAT_INIT_DROPPED_STREAM_ERROR,
  COMBAT_INIT_OBJECTIVE_NOTES,
  FLEEING_ESCAPE_OBJECTIVE,
  ensureFleeingEscapeObjective,
  historyIndicatesFleeing,
  parseCombatInitBlueprint,
  resolveCombatInitFromLlm,
} from "../../packages/server/src/services/game/combat-init.ts";

const party = [{ name: "Hero", hp: 12, maxHp: 12, attacks: [], items: [], statuses: [], isPlayer: true }];
const enemies = [{ name: "Guard", hp: 8, maxHp: 8, attacks: [], statuses: [], description: "A city guard", sprite: "🛡️" }];

function blueprint(overrides: Record<string, unknown> = {}) {
  return {
    party,
    enemies,
    environment: "A smoke-filled alley",
    ...overrides,
  };
}

const fleeingHistory = [{ role: "assistant", content: "You run. Smoke drops to chest height as boots hammer the cobbles behind you." }];
const fightHistory = [{ role: "assistant", content: "A goblin blocks the road and draws a rusty blade. You raise your sword." }];
const runIntoHistory = [{ role: "assistant", content: "You run into the guards at the gate. They lower their spears." }];

assert.equal(historyIndicatesFleeing(fleeingHistory), true, "Playtester run-away narration must count as fleeing");
assert.equal(historyIndicatesFleeing([{ content: "You flee down the alley." }]), true);
assert.equal(historyIndicatesFleeing([{ content: "The party is retreating toward the exit." }]), true);
assert.equal(historyIndicatesFleeing([{ content: "You are getting away through the smoke." }]), true);
assert.equal(historyIndicatesFleeing(fightHistory), false, "ordinary stand-and-fight must not look like a chase");
assert.equal(historyIndicatesFleeing(runIntoHistory), false, "running into enemies is a collision, not an escape");

const injected = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
  }),
  fleeingHistory,
);
assert.equal((injected.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
assert.equal((injected.objectives as Array<{ id: string }>)[0]?.id, FLEEING_ESCAPE_OBJECTIVE.id);
assert.equal((injected.objectives as Array<{ label: string }>)[0]?.label, "Reach the exit");
assert.equal((injected.objectives as Array<{ kind: string }>)[1]?.kind, "eliminate");

const untouched = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
  }),
  fightHistory,
);
assert.deepEqual(untouched.objectives, [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }]);

const alreadyEscape = ensureFleeingEscapeObjective(
  blueprint({
    objectives: [
      { id: "wipe", kind: "eliminate", label: "Defeat the guard" },
      { id: "exit", kind: "escape", label: "Get out of the alley" },
    ],
  }),
  fleeingHistory,
);
assert.equal((alreadyEscape.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
assert.equal((alreadyEscape.objectives as Array<{ id: string }>)[0]?.id, "exit");

const truncated = `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "objectives": [{"id":"wipe","kind":"eliminate","label":"Defeat the guard"}],
  "itemEffects": [`;
assert.equal(jsonishLooksTruncated(truncated), true);
const salvaged = parseCombatInitBlueprint(truncated);
assert.ok(salvaged, "jsonish must salvage a truncated party+enemies blueprint");
assert.equal((salvaged!.party as unknown[]).length, 1);
assert.equal((salvaged!.enemies as unknown[]).length, 1);

const fleeingSalvage = resolveCombatInitFromLlm({
  content: `{
  "party": [{"name":"Hero","hp":12,"maxHp":12,"attacks":[],"items":[],"statuses":[],"isPlayer":true}],
  "enemies": [{"name":"Guard","hp":8,"maxHp":8,"attacks":[],"statuses":[],"description":"A city guard","sprite":"x"}],
  "environment": "A smoke-filled alley",
  "itemEffects": [`,
  finishReason: "error",
  history: fleeingHistory,
});
assert.equal(fleeingSalvage.ok, true);
if (fleeingSalvage.ok) {
  assert.equal(fleeingSalvage.salvaged, true);
  assert.equal((fleeingSalvage.combatState.objectives as Array<{ kind: string }>)[0]?.kind, "escape");
  assert.equal((fleeingSalvage.combatState.objectives as Array<{ label: string }>)[0]?.label, "Reach the exit");
}

const ordinary = resolveCombatInitFromLlm({
  content: JSON.stringify(
    blueprint({
      objectives: [{ id: "wipe", kind: "eliminate", label: "Defeat the guard" }],
    }),
  ),
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(ordinary.ok, true);
if (ordinary.ok) {
  assert.equal((ordinary.combatState.objectives as Array<{ kind: string }>)[0]?.kind, "eliminate");
}

const dropped = resolveCombatInitFromLlm({
  content: "Thinking about the battle",
  finishReason: "error",
  history: fleeingHistory,
});
assert.equal(dropped.ok, false);
if (!dropped.ok) {
  assert.equal(dropped.status, 502);
  assert.equal(dropped.error, COMBAT_INIT_DROPPED_STREAM_ERROR);
}

const invalid = resolveCombatInitFromLlm({
  content: "Thinking about the battle",
  finishReason: "stop",
  history: fightHistory,
});
assert.equal(invalid.ok, false);
if (!invalid.ok) {
  assert.equal(invalid.error, "AI returned invalid JSON");
}

assert.match(COMBAT_INIT_OBJECTIVE_NOTES, /PRIMARY objective MUST be kind "escape"/);

const routeSource = readFileSync(new URL("../../packages/server/src/routes/encounter.routes.ts", import.meta.url), "utf8");
const environmentIdx = routeSource.indexOf('"environment": "Brief description of the combat environment"');
const objectivesIdx = routeSource.indexOf('inst += `  "objectives": [\\n`;');
const itemEffectsIdx = routeSource.indexOf('inst += `  "itemEffects": [\\n`;');
assert.ok(environmentIdx > 0 && objectivesIdx > environmentIdx, "objectives schema must follow environment");
assert.ok(itemEffectsIdx > objectivesIdx, "objectives schema must precede itemEffects so a truncated salvage still has them");
assert.match(routeSource, /resolveCombatInitFromLlm/);

console.log("Combat init escape regression passed.");
