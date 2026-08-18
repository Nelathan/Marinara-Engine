import assert from "node:assert/strict";
import {
  COMMAND_CENTER_MAX_RESULTS,
  normalizeCommandCenterSessionState,
  normalizeCommandRankingState,
  presentCommandCenterResults,
  rankCommandResults,
  readCommandRankingState,
  recordCommandUse,
  setCommandPinned,
  writeCommandRankingState,
  type CommandDefinition,
  type CommandCenterPresentableResult,
} from "../../packages/client/src/lib/command-center.js";
import { createSystemCommandDefinitions } from "../../packages/client/src/lib/command-center-system-commands.js";
import { getOmnibarActiveChatContextResultIds, searchOmnibar } from "../../packages/client/src/lib/omnibar-search.js";
import { getOmnibarSettingsDestinations } from "../../packages/client/src/lib/omnibar-settings.js";
import {
  getCharacterDisplayIdentity,
  parseCharacterDisplayData,
} from "../../packages/client/src/lib/character-display.js";
import { resolveOmnibarRowState } from "../../packages/client/src/lib/omnibar-row-state.js";
import {
  buildProfessorMariCommandCenterContext,
  inferProfessorMariCommandCenterCapability,
} from "../../packages/client/src/lib/professor-mari-command-center-context.js";

const commands: CommandDefinition[] = [
  { id: "home", title: "Home", kind: "navigation", icon: "home", target: { kind: "home" } },
  { id: "settings", title: "Settings", kind: "settings", icon: "settings" },
];
const malformed = normalizeCommandRankingState({
  pinnedIds: ["home", "home", 42, ""],
  recent: [
    { id: "home", lastUsedAt: 10, useCount: 2 },
    { id: "home", lastUsedAt: 20, useCount: 3 },
    { id: "settings", lastUsedAt: "bad", useCount: 1 },
  ],
});
assert.deepEqual(malformed, { pinnedIds: ["home"], recent: [{ id: "home", lastUsedAt: 20, useCount: 3 }] });

const used = recordCommandUse(malformed, "settings", 30);
const ranked = rankCommandResults(
  commands.map((command) => ({ command, score: command.id === "settings" ? 300 : 1 })),
  setCommandPinned(used, "home", true),
  30,
);
assert.equal(ranked[0]?.result.command.id, "home");
assert.equal(ranked[0]?.pinned, true);

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => void values.set(key, value),
};
assert.equal(writeCommandRankingState(used, storage), true);
assert.deepEqual(readCommandRankingState(storage), used);
assert.deepEqual(readCommandRankingState({ getItem: () => "{", setItem: () => undefined }), {
  pinnedIds: [],
  recent: [],
});

const systemCommands = createSystemCommandDefinitions({});
assert.deepEqual(systemCommands.find((command) => command.id === "spotify-settings")?.availability, {
  status: "requires-capability",
  capability: "spotify",
  setupTarget: true,
});
assert.equal(systemCommands.find((command) => command.id === "spotify-settings")?.action.kind, "navigate");
assert.equal(systemCommands.find((command) => command.id === "tts-settings")?.action.kind, "navigate");

const presentationResults: CommandCenterPresentableResult[] = [
  { id: "chat:pinned", category: "chat", metadata: [{ label: "rank", value: "first" }] },
  { id: "chat:recent", category: "chat" },
  { id: "control:theme", category: "settings", control: {} },
  { id: "characters", category: "navigation" },
  { id: "chat:pinned", category: "chat" },
];
const emptyPresentation = presentCommandCenterResults(presentationResults, {
  query: "",
  rankingState: {
    pinnedIds: ["chat:pinned"],
    recent: [
      { id: "chat:pinned", lastUsedAt: 20, useCount: 2 },
      { id: "chat:recent", lastUsedAt: 10, useCount: 1 },
    ],
  },
});
assert.deepEqual(
  emptyPresentation.groups.map((group) => [group.id, group.results.map((result) => result.id)]),
  [
    ["pinned", ["chat:pinned"]],
    ["recent", ["chat:recent"]],
    ["quick-controls", ["control:theme"]],
    ["create-navigation", ["characters"]],
  ],
);
assert.deepEqual(
  buildProfessorMariCommandCenterContext(
    "compare these presets",
    { id: "preset:one", title: "One", category: "preset" },
    [
      { id: "preset:two", title: "Two", category: "preset" },
      { id: "preset:three", title: "Three", category: "preset" },
    ],
  ),
  {
    source: "command-center",
    capability: "recommend",
    query: "compare these presets",
    resource: { kind: "preset", id: "one", label: "One" },
    relatedResources: [
      { kind: "preset", id: "two", label: "Two" },
      { kind: "preset", id: "three", label: "Three" },
    ],
    action: "Selected Command Center result: One",
  },
);
assert.equal(emptyPresentation.results.length, 4);
assert.equal(emptyPresentation.results[0]?.metadata?.[0]?.value, "first");
assert.equal(emptyPresentation.categoryAvailability.all, 4);
assert.equal(emptyPresentation.categoryAvailability.chats, 2);

const searchPresentation = presentCommandCenterResults(
  [
    { id: "docs:guide", category: "docs" },
    { id: "persona:one", category: "persona" },
    { id: "chat:one", category: "chat" },
    { id: "ask-professor-mari", category: "professor" },
    { id: "character:one", category: "character" },
  ],
  { query: "one" },
);
assert.deepEqual(
  searchPresentation.groups.map((group) => group.id),
  ["chats", "characters", "personas", "docs", "professor-fallback"],
);

const filteredPresentation = presentCommandCenterResults(searchPresentation.results, {
  query: "one",
  filter: "characters",
});
assert.equal(filteredPresentation.filter, "characters");
assert.deepEqual(
  filteredPresentation.results.map((result) => result.id),
  ["character:one"],
);
assert.equal(filteredPresentation.categoryAvailability.chats, 1);
assert.equal(filteredPresentation.categoryAvailability.characters, 1);

const cappedPresentation = presentCommandCenterResults(
  Array.from({ length: COMMAND_CENTER_MAX_RESULTS + 10 }, (_, index) => ({
    id: `chat:${index}`,
    category: "chat" as const,
  })),
  { query: "chat" },
);
assert.equal(cappedPresentation.results.length, COMMAND_CENTER_MAX_RESULTS);
assert.equal(cappedPresentation.categoryAvailability.chats, COMMAND_CENTER_MAX_RESULTS + 10);

const localizedConnectionPreview = {
  kind: "connection" as const,
  facts: [{ label: "Localized model", value: "example-model" }],
};
const connectionResults = searchOmnibar("primary", {
  commands: [],
  chats: [],
  resources: [],
  connections: [{ id: "primary", name: "Primary", preview: localizedConnectionPreview }],
  askProfessorTitle: "Ask",
});
assert.equal(
  connectionResults.find((result) => result.id === "connection:primary")?.preview,
  localizedConnectionPreview,
);
assert.deepEqual(
  presentCommandCenterResults(connectionResults, { query: "primary" }).groups.map((group) => group.id),
  ["connections", "professor-fallback"],
);

const categorizedCommands = searchOmnibar("command", {
  commands: [
    { id: "custom-settings-command", title: "Command settings", kind: "settings", icon: "settings" },
    { id: "settings-looking-navigation", title: "Command navigation", kind: "navigation", icon: "home" },
  ],
  chats: [],
  resources: [],
  connections: [],
});
assert.equal(categorizedCommands.find((result) => result.id === "custom-settings-command")?.category, "settings");
assert.equal(categorizedCommands.find((result) => result.id === "settings-looking-navigation")?.category, "navigation");

const naturalRequestResults = searchOmnibar("make Luna warmer", {
  commands: [],
  chats: [],
  resources: [
    { kind: "character", id: "luna", name: "Luna" },
    { kind: "character", id: "mara", name: "Mara" },
  ],
  connections: [],
  contextResultIds: new Set(["character:luna"]),
});
assert.equal(naturalRequestResults[0]?.id, "character:luna");
assert.equal(naturalRequestResults[0]?.score, 194);

const contextRankedResults = searchOmnibar("Luna", {
  commands: [],
  chats: [],
  resources: [
    { kind: "character", id: "other-luna", name: "Luna" },
    { kind: "character", id: "current-luna", name: "Luna" },
  ],
  connections: [],
  contextResultIds: new Set(["character:current-luna"]),
});
assert.equal(contextRankedResults[0]?.id, "character:current-luna");
assert.deepEqual(
  [
    ...getOmnibarActiveChatContextResultIds("chat-one", {
      id: "chat-one",
      characterIds: ["luna"],
      personaId: "hero",
      promptPresetId: "moonlight",
      connectionId: "primary",
      enableAgents: true,
      activeAgentIds: ["world-state"],
    }),
  ].sort(),
  ["agent:world-state", "character:luna", "chat:chat-one", "connection:primary", "persona:hero", "preset:moonlight"],
);
assert.deepEqual([...getOmnibarActiveChatContextResultIds("chat-two", { id: "chat-one", characterIds: ["luna"] })], []);
assert.equal(
  getOmnibarActiveChatContextResultIds("chat-one", {
    id: "chat-one",
    enableAgents: false,
    activeAgentIds: ["world-state"],
  }).has("agent:world-state"),
  false,
);

assert.equal(
  getCharacterDisplayIdentity({ data: JSON.stringify({ name: "Card Name" }), comment: "Database label" }),
  "Card Name",
);
assert.equal(parseCharacterDisplayData({ data: "not-json" }).name, "Unknown");
assert.deepEqual(
  resolveOmnibarRowState({ resource: "character", id: "luna", activeChat: { characterIds: ["luna"] } }),
  { inActiveChat: true, globallyActive: false, canAddToChat: false, globalAction: null },
);
assert.deepEqual(
  resolveOmnibarRowState({ resource: "persona", id: "hero", activeChat: { personaId: "other" }, globallyActive: true }),
  { inActiveChat: false, globallyActive: true, canAddToChat: true, globalAction: null },
);
assert.deepEqual(resolveOmnibarRowState({ resource: "persona", id: "hero", activeChat: { personaId: "hero" } }), {
  inActiveChat: true,
  globallyActive: false,
  canAddToChat: false,
  globalAction: "activate-persona",
});
assert.deepEqual(
  resolveOmnibarRowState({ resource: "preset", id: "moonlight", activeChat: { promptPresetId: "moonlight" } }),
  { inActiveChat: true, globallyActive: false, canAddToChat: false, globalAction: "set-default-preset" },
);
assert.deepEqual(
  resolveOmnibarRowState({ resource: "connection", id: "primary", activeChat: { connectionId: "other" } }),
  { inActiveChat: false, globallyActive: false, canAddToChat: true, globalAction: null },
);

const settingsDestinations = getOmnibarSettingsDestinations();
const streamingSetting = settingsDestinations.find((setting) => setting.controlId === "streaming-speed");
assert.deepEqual(streamingSetting && { tab: streamingSetting.tab, controlId: streamingSetting.controlId }, {
  tab: "general",
  controlId: "streaming-speed",
});
assert.equal(settingsDestinations.find((setting) => setting.controlId === "font-family")?.sectionLabel, "Text & Scale");
assert.equal(
  settingsDestinations.find((setting) => setting.id === "settings-section:appearance")?.controlId,
  "theme-mode",
);

assert.equal(inferProfessorMariCommandCenterCapability("make Luna's greeting shorter"), "edit");
assert.equal(inferProfessorMariCommandCenterCapability("make a new character"), "create");
assert.equal(inferProfessorMariCommandCenterCapability("which preset is best"), "recommend");
assert.equal(inferProfessorMariCommandCenterCapability("why did image generation fail"), "repair");
assert.deepEqual(
  buildProfessorMariCommandCenterContext("make Luna warmer", {
    id: "character:luna-id",
    title: "Luna",
    category: "character",
  }),
  {
    source: "command-center",
    capability: "edit",
    query: "make Luna warmer",
    resource: { kind: "character", id: "luna-id", label: "Luna" },
    action: "Selected Command Center result: Luna",
  },
);
assert.deepEqual(
  buildProfessorMariCommandCenterContext("explain this", {
    id: "settings-control:theme-mode",
    title: "Color scheme",
    category: "settings",
  }).resource,
  { kind: "setting", id: "theme-mode", label: "Color scheme" },
);

// The omnibar reopens on search, never a stale Professor Mari pane: the session
// normalizer must reset an unsupported persisted pane back to "results".
assert.equal(normalizeCommandCenterSessionState({ pane: "mari" }).pane, "results");
assert.equal(normalizeCommandCenterSessionState({ pane: "browse" }).pane, "browse");
assert.equal(normalizeCommandCenterSessionState({ pane: "detail" }).pane, "detail");

console.info("Command Center regression checks passed.");
