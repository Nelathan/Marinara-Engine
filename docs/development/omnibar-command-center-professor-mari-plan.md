# Omnibar, Command Center, and Professor Mari Plan

## Status

Concept and implementation plan. No application changes are included in this
document.

Before implementation starts, follow the repository coordination rules:

1. Check for an existing issue, issue-linked branch, draft PR, or project item
   covering this work.
2. Establish visible ownership on the issue.
3. Open a draft PR against `staging` when implementation starts.

This plan is intentionally phased. The first release should prove the core
handoff before adding broader automation, comparison, or task history.

## Goal

Make the omnibar the single front door for finding and doing work in Marinara.

The user should be able to open one surface and:

- Find commands, settings, resources, chats, and documentation.
- Run a known, safe action directly.
- See results that are relevant to the current screen and active chat.
- Continue an unclear, creative, or multi-step request with Professor Mari.
- Return to the original result or source after Mari finishes.

The user must not need to understand the internal boundary between the
omnibar, Command Center, and Professor Mari.

## Product Model

The three names describe one connected experience:

- **Omnibar** is the global entry point and search field.
- **Command Center** is the deterministic result, browse, preview, and action
  system inside the omnibar.
- **Professor Mari** is the conversational continuation layer for judgment,
  explanation, recommendations, creation, editing, and repair.

The core rule is:

> Context selects what is relevant. Command Center performs known actions.
> Professor Mari handles work that needs understanding.

The omnibar must not send every query to an LLM. Search, ranking, context
collection, action availability, navigation, and simple settings changes stay
local and deterministic.

## User Experience

### Direct Work

When the request is clear and the operation is safe, Command Center acts
directly.

Examples:

- `open Luna` opens Luna in the character editor.
- `show connections` opens the Connections panel.
- `turn on timestamps` toggles the setting.
- `add Luna to this chat` assigns Luna to the active chat.
- `set Moonlight as default` activates the matching preset when the operation
  is available.

Direct actions must remain faster than opening Mari.

### Assisted Work

When the request needs judgment, explanation, or several steps, the result
offers **Continue with Mari**.

Examples:

- `make Luna's greeting less formal` finds Luna and continues with Mari.
- `which preset should I use for mystery roleplay` offers Mari with preset
  context.
- `why does image generation fail` offers setup results and Mari with the
  current error or capability state.
- `help me build a fantasy lorebook` opens Mari without requiring a selected
  resource.

The user chooses the assisted path. The omnibar does not silently start a
model request.

### Ambiguous Work

When several targets match, Command Center shows the likely targets and lets
the user select one. Mari must not guess between multiple characters,
presets, chats, or settings.

If no target is selected, Mari can still receive the original request with a
bounded current-screen context and ask one focused question.

## Deterministic Context Awareness

The omnibar needs contextual awareness independent of Professor Mari. It
should read the current application state when it opens and use that state to
rank results and calculate valid actions.

### Workspace Focus

Add a small client-side focus model, tentatively named `WorkspaceFocus` or
`OmnibarContext`. It should contain references and state, not full resource
documents.

Suggested fields:

```ts
type WorkspaceFocus = {
  surface: "home" | "chat" | "editor" | "settings" | "library" | "game";
  activeChat?: {
    id: string;
    name: string;
    mode: "conversation" | "roleplay" | "game";
    characterIds: string[];
    personaId?: string;
  };
  openResource?: {
    kind: "character" | "persona" | "lorebook" | "preset" | "connection" | "agent";
    id: string;
    label: string;
  };
  selectedField?: {
    id: string;
    label: string;
  };
  settingsLocation?: {
    tab: string;
    controlId?: string;
  };
  visibleError?: {
    code?: string;
    message: string;
    retryAction?: string;
  };
  editorDirty: boolean;
};
```

The exact type should follow existing store and navigation contracts. Do not
duplicate a second copy of resource identity rules if an existing shared type
can be extended safely.

### Context Sources

The focus model should collect, where available:

- Current surface.
- Active chat and chat mode.
- Open editor and resource.
- Selected editor field.
- Current settings tab and control.
- Characters, persona, preset, lorebooks, and agents attached to the active
  chat.
- Visible error and retry state.
- Installed and missing capabilities.
- Unsaved editor state.
- Pending Professor Mari review state.

Keep the context bounded. The omnibar should not load the full workspace,
full character cards, full lorebooks, or chat transcripts merely to rank
results.

### Context Ranking

Use explicit score adjustments. Exact matching must remain stronger than
contextual relevance.

Suggested rules:

- Exact title or alias match: highest priority.
- Direct result for the current open resource: strong priority.
- Resource used by the active chat: strong priority.
- Action valid on the current surface: positive priority.
- Recent command or pinned command: positive priority.
- Blocked or unavailable action: lower priority, but keep it visible when it
  explains the required setup.
- Unrelated resource: no contextual bonus.

Keep ranking pure and testable. Do not use an LLM to rank local results.

### Local Query Parsing

Add a small parser only for common, high-confidence request patterns.

Examples:

- `open`, `show`, `go to` means navigation.
- `add`, `use`, `activate`, `set` means a direct action when a registered
  action exists.
- `create`, `new`, `import` means a creation or import path.
- `explain`, `why`, `how` suggests documentation or Mari.
- `compare`, `recommend`, `improve` suggests Mari.
- `fix`, `broken`, `failed` suggests retry, setup, or Mari.

The parser suggests an action. It must not perform a destructive or unclear
operation automatically.

## Context Actions

When the omnibar opens without a query, show a short contextual group before
general idle results.

Examples:

- Current character editor.
- Selected greeting field.
- Active chat.
- Chat character or persona.
- Current preset.
- Current settings control.
- Pending Mari review.
- Failed setup action that can be retried.

When a query exists, use the same context to rank matching results and expose
valid actions.

### Action Matrix

Actions must be calculated from the current state. Do not display every
possible action on every result.

| Result | No active chat | Active chat | Assisted action |
| --- | --- | --- | --- |
| Character | Open, start chat | Open, add to chat | Continue with Mari |
| Persona | Open, activate where valid | Open, assign where valid | Continue with Mari |
| Lorebook | Open | Open, add where valid | Continue with Mari |
| Preset | Open, set default where valid | Open, assign where valid | Continue with Mari |
| Connection | Open, set up | Open, switch where valid | Continue with Mari |
| Setting | Open or change | Open or change | Continue with Mari |
| Documentation | Read | Read | Continue with Mari |
| Error or blocked setup | Open setup or retry | Open setup or retry | Continue with Mari |
| Chat | Resume | Resume | Continue with Mari |

Use one visible Mari label: **Continue with Mari**. The internal capability
can be `explain`, `recommend`, `create`, `edit`, `repair`, or `navigate`.

## Professor Mari Handoff

The handoff must preserve intent and identity.

### Handoff Contents

Pass:

- The exact original query as an editable draft.
- Source entry point: `command-center`.
- Suggested capability.
- Selected resource kind, ID, and label.
- Selected field, when known.
- Active chat kind, ID, and label, when relevant.
- Settings location, when relevant.
- Visible error or capability state, when relevant.
- The selected Command Center result ID.

Do not pass full resource data during search. Mari can fetch the required data
after the user sends the request.

### Mari Focus

The Mari pane should show a compact, removable focus row such as:

```text
Working with: Luna | Greeting | Current chat
```

This makes the handoff visible and lets the user correct it before sending.
The existing context viewer remains available for detailed attached context.

Mari should understand references such as `this`, `her`, `that setting`,
`the selected preset`, and `that error` from this focus.

If the focus is ambiguous, Mari asks one focused question instead of guessing.

### Handoff State

The omnibar must preserve:

- Query.
- Active filter.
- Selected result.
- Detail pane state.
- Browse category and position.
- Selected resource context.

Escape or the back action should return to the same result state. Opening an
actual editor or modal may close the omnibar, but reopening it should retain
the current session state according to the existing persistence rules.

## Mari Completion

Use the existing completion contract consistently.

After a meaningful task, Mari should offer no more than three useful actions:

- Open resource.
- Review changes.
- Retry original action.
- Open setup.
- Start a chat.
- Return to results.

Only show actions that are valid for the result and current state. The
omnibar should open the existing editor, review control, setup surface, or
retry path. It should not create a second review system.

For edits and repairs, Mari should state the result concretely:

> I shortened Luna's greeting and kept the existing meaning.

Avoid generic completion text such as “Task completed successfully.”

## Natural Mari Behavior

The omnibar supports natural Mari interaction by supplying reliable context.
Mari should:

- Avoid asking for resource names already known from the focus.
- Ask one question when one decision blocks progress.
- Start immediately when the request is complete.
- Show an intent confirmation before consequential edits.
- Show progress from real tool events, not invented reasoning.
- Allow the user to stop or correct the task.
- Preserve the focus across Home, omnibar, floating, and editor surfaces.
- Return to the source with a concrete completion action.

Use the existing suggestion chips for bounded choices. Do not turn every Mari
request into a form or questionnaire.

## Continue Group

Add a small contextual **Continue** group only when useful. It should be
derived from existing runtime and review state before a new task database is
considered.

Possible entries:

- Mari is still working.
- Review Mari's changes.
- Continue the last Mari conversation.
- Retry the last failed setup action.
- Open the last created resource.

Do not show an empty or permanent task-management section.

## Setup and Repair

Blocked results should remain useful.

Example: missing text-to-speech capability.

Actions:

- Open setup.
- Read the relevant guide.
- Continue with Mari.

The Mari handoff should include the missing capability and setup target. Mari
can explain the issue without asking the user to repeat it.

## Multi-Resource Work

Treat comparison as a later phase.

Browse mode may eventually support selecting a small number of resources and
using **Compare with Mari** for presets, connections, agents, characters, or
lorebooks.

The handoff must pass only typed resource references. Apply item-count,
content-size, and token limits before Mari reads the resources.

Do not build batch editing or comparison before the single-resource handoff
proves useful.

## Keyboard and Mobile

Desktop requirements:

- Arrow keys select results.
- `Enter` runs the primary direct action.
- `Right Arrow` opens rich result detail.
- Visible result actions are keyboard reachable.
- `Escape` returns from Mari to the prior result state.
- The interface exposes any new shortcut for Continue with Mari.

Mobile requirements:

- Search stays at the top.
- Rich results open a detail view.
- Primary actions stay touch accessible without hover.
- Continue with Mari opens in the existing full-screen shell.
- The focus row remains visible above the Mari composer.
- Back returns to the selected result.

## Delivery Phases

### Phase 1: Context and Handoff Foundation

- Define the bounded workspace focus model.
- Collect current surface, active chat, open resource, selected field, settings
  location, error, capability, and dirty-editor state.
- Reuse or extend existing typed navigation and Mari context contracts.
- Preserve the exact query and selected result identity in the Mari handoff.
- Add the visible Mari focus row.
- Keep the context removable.
- Add pure regression coverage for context normalization and handoff payloads.

Core claim: the user can move from a selected Command Center result to Mari
without losing intent or target identity.

### Phase 2: Context-Aware Command Center

- Add contextual empty-state results.
- Add deterministic context score adjustments.
- Add a small local query parser for high-confidence action phrases.
- Calculate valid result actions from current state.
- Keep direct actions above assisted actions when the request is clear.
- Add setup and error results with retry and setup actions.

Core claim: the omnibar feels aware of the current work without an LLM.

### Phase 3: Continue With Mari

- Add one consistent Continue with Mari action to suitable rich results.
- Show the original query as an editable Mari draft.
- Show the selected resource and field focus.
- Set the suggested Mari capability from deterministic result context.
- Preserve result and browse state while Mari is open.
- Add Return to results.

Core claim: Mari is a natural continuation of search, not a separate feature.

### Phase 4: Completion and Continuity

- Standardize Open, Review, Retry, Open setup, Start chat, and Return actions.
- Reuse existing editor and review surfaces.
- Surface pending reviews and active Mari work in the small Continue group.
- Preserve focus across Home, omnibar, floating, and editor surfaces.
- Add regression coverage for created, edited, repaired, and failed flows.

Core claim: users can complete Mari work and return to useful app state.

### Phase 5: Expansion

- Add selected editor fields as first-class focus.
- Add natural references such as `this`, `her`, and `that error`.
- Add multi-resource comparison in Browse.
- Add capability-specific setup guidance.
- Add workflow preferences controlled by Mari memories.
- Consider optional query prefixes only after natural search is stable.

Do not use a hidden LLM call for omnibar routing in this phase.

## Architecture Boundaries

### Omnibar and Command Center Own

- Local search.
- Result ranking.
- Context collection.
- Action availability.
- Direct navigation.
- Safe inline settings controls.
- Browse and result detail.
- Handoff construction.

### Professor Mari Owns

- Explanation.
- Recommendations.
- Creative creation.
- Resource editing through existing guarded workspace flows.
- Repair guidance and repair actions.
- Clarifying questions.
- Multi-step conversational work.

### Server Owns

- Resource reads after a Mari request.
- Workspace permissions.
- Validation and trust boundaries.
- Reviews and approvals.
- Persistent workspace changes.
- Prompt context budgets.

Do not move server validation into the client. Do not make the omnibar a
second agent runtime.

## Non-Goals

The first implementation must not:

- Send every omnibar query to a model.
- Replace normal editors with chat.
- Add a separate task database.
- Add a separate review system.
- Use hidden LLM intent classification.
- Attach full resource or chat content during search.
- Guess between ambiguous resources.
- Add many similar Mari buttons.
- Perform destructive actions without the existing confirmation rules.
- Build batch editing before single-resource workflows are proven.
- Require command prefixes for normal users.

## Verification Plan

### Unit and Regression Proof

Add focused deterministic coverage for:

- Workspace focus normalization.
- Current-surface ranking.
- Active-chat resource ranking.
- Exact match priority over contextual fallback.
- Query verb parsing.
- Action availability by resource and state.
- Missing capability results.
- Dirty-editor protection.
- Structured Mari handoff contents.
- Removal of handoff focus.
- Preservation of query and selected result state.
- Completion action selection.
- Ambiguous target behavior.

Do not keep temporary `.test.ts` files in the repository.

### Browser Proof

Add or extend Playwright coverage for desktop and mobile:

- Open the omnibar from an editor and see contextual results.
- Find a resource and run a direct action.
- Continue with Mari and verify the exact draft and focus.
- Return from Mari to the same result.
- Complete an edit and open its review.
- Complete a creation and open the resource.
- Use a setup-required result and open setup or Mari.
- Verify keyboard navigation.
- Verify mobile detail and bottom actions.
- Verify dirty-editor confirmation.

Run `pnpm check`, the relevant regression lane, and the UI lane when the
implementation starts. Run `pnpm localization:check` for every user-facing
label or message.

### Manual Proof

Manually verify:

- Dark and light themes.
- Desktop and narrow mobile layouts.
- Reduced motion.
- Empty data states.
- Partial query failures.
- No active chat.
- No connection configured.
- Missing capability.
- Ambiguous resource names.
- Unsaved editor changes.
- Pending Mari review.
- Mari cancellation and return.

## Success Criteria

The work is successful when:

1. Users can search and act without Mari for clear operations.
2. Users can continue unclear work with Mari without repeating known context.
3. The omnibar ranks current work above unrelated results without an LLM.
4. Mari receives typed references and the exact user request.
5. Full resource content is fetched only when Mari needs it.
6. Users can see, remove, and correct the active Mari focus.
7. Consequential changes use existing review and approval rules.
8. Users can return to the original result or source after Mari finishes.
9. Desktop and mobile support the same primary workflows.
10. The feature remains understandable as one front door with two modes:
    direct action and conversational continuation.

## Summary

The omnibar finds the target and understands the current app state. Command
Center performs clear, registered actions. Professor Mari continues work that
needs judgment or several steps. The handoff preserves the original request,
the selected focus, and the return path.

The product should feel like this:

> Search first. Act directly when possible. Continue with Mari when needed.
