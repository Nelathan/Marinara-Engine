# Professor Mari: Whole Experience Plan

## Goal

Make Professor Mari the action-oriented help layer across Marinara Engine.

Users should be able to ask Mari for an explanation, a recommendation, a
creation flow, an edit, or a repair from the place where the problem appears.
Mari should provide the answer in context, show the affected object, and keep
every consequential change reviewable and reversible.

The target experience is one assistant with several entry points, not several
unrelated Mari features:

- Home workspace chat for broad help and app changes.
- Professor Mari character chat for normal conversational use.
- Floating assistant for help while the user works elsewhere.
- Command Center and FAQ for fast discovery and handoff.
- Contextual actions from editors, settings, game setup, and error states.
- Shared memories, skills, history, context attachments, and approvals.

## Current Baseline

The repository already has most of the difficult foundation.

- Home workspace agent with streamed text, thinking, tool traces, status, and
  approval events.
- Structured workspace commands for app data, files, documentation, shell,
  dependencies, and navigation.
- Server-managed Mari database access with history and restore support.
- Review flow for existing data changes and explicit approval for sensitive file
  and dependency changes.
- Separate Professor Mari chats with restart, history, rename, delete, and stop.
- Custom Skills and saved Memories panels with enable, disable, upload, edit,
  and delete behavior.
- Chat history attachment with a context viewer and removal controls.
- Image generation and image assignment actions.
- Fandom wiki lookup support.
- Shared suggestion chips and guided plan contracts.
- Suggestion chips in Home Mari and the normal Professor Mari composer.
- Floating assistant with desktop and mobile behavior.
- Professor Mari navigation, arrival, idle, blink, shrug, map, and drag art.
- FAQ search and Command Center search, including the current uncommitted
  FAQ and resource handoff work in this worktree.

The main gap is integration and product coherence. The features exist, but
Mari is still mostly a destination. Other surfaces do not consistently provide
the right context, launch her with a useful draft, or return the user to the
affected object after a task.

## Experience Principles

1. **Ask from the current context.** A user should not need to explain which
   character, chat, setting, error, or editor field is visible.
2. **Explain before changing.** Mari can recommend and preview before she acts.
3. **Use the smallest useful action.** Prefer a field edit or a single
   navigation action over replacing a whole resource.
4. **Keep the user in control.** Existing review, approval, restore, and
   permission rules remain the trust boundary.
5. **Make progress visible.** Show what Mari is reading, changing, waiting for,
   or unable to do.
6. **Return to the work.** A completed action should offer an exact open or
   inspect action for the affected resource.
7. **Keep the normal chat path intact.** Mari features must be gated to Mari and
   must not change other characters' composers.
8. **Treat localization and mobile layout as part of the feature.** New UI
   copy uses localization keys, and each entry point must work on a narrow
   viewport.

## Delivery Phases

### Phase 0: Product Contract and Inventory

**Purpose:** Define the common Mari interaction contract before adding more
entry points.

**Work:**

- Create a shared catalog of Mari capabilities and supported context types.
- Define a context envelope for source surface, resource IDs, selected field,
  current error, and relevant user action.
- Define handoff behavior: open Home Mari, open the floating assistant, or open
  the normal Mari character chat.
- Define completion behavior: open resource, show editor field, show review,
  or return to the originating surface.
- Map all existing actions and UI entry points to the contract.
- Check for an existing issue, branch, draft PR, or project item before coding.
- Keep this work documentation-only unless a small shared type is needed.

**Primary files:** `docs/home/professor-mari.md`, shared Professor Mari types,
`professor-mari-navigation.ts`, `professor-mari-open.ts`.

**Proof:** Every listed capability has one owner, one entry point, one context
shape, and one completion path.

### Phase 1: Contextual Ask-Mari Handoff

**Purpose:** Let any important surface start a grounded Mari conversation.

**Work:**

- Extend the existing `requestProfessorMariOpen` flow with a typed context
  payload and an optional draft prompt.
- Add an `Ask Mari` action to character, persona, lorebook, preset, connection,
  agent, settings, game setup, and chat error surfaces.
- Support action-specific prompts such as:
  - Explain this resource.
  - Improve this field.
  - Find the cause of this error.
  - Suggest the next setup step.
  - Compare this item with another item.
- Attach context without copying large prompt content into the visible draft.
  The server should resolve full context under the existing budget rules.
- Make Home Mari and the floating assistant consume the same handoff event.
- Show a visible context summary that the user can remove before sending.

**Primary files:** `professor-mari-open.ts`, `professor-mari-navigation.ts`,
`use-mari-workspace-context.ts`, `HomeProfessorMariChat.tsx`, resource editors,
`AppShell.tsx`.

**Proof:** Open Mari from each supported surface, verify the correct resource
and field arrive, verify the prompt is editable, and verify an empty or stale
resource context fails clearly.

### Phase 2: Shared Action and Result Handoff

**Purpose:** Make Mari's work end where the user needs it.

**Work:**

- Standardize action result metadata for created, updated, reviewed, restored,
  navigated, and blocked operations.
- Return resource IDs, editor targets, changed fields, review IDs, and a safe
  human-readable summary.
- Add result actions to the Mari transcript:
  - Open character, persona, lorebook, preset, connection, agent, or chat.
  - Inspect changed fields.
  - Review pending change.
  - Restore the previous snapshot.
  - Retry a blocked operation after setup.
- Reuse the existing state navigation and modal routing. Do not add URL routing.
- Invalidate or refresh the matching React Query data after a successful app
  data command.
- Keep new items and edits visibly distinct.

**Primary files:** `professor-mari-command-runtime.ts`,
`workspace-agent.service.ts`, `professor-mari-workspace.routes.ts`,
`HomeProfessorMariChat.tsx`, `agent.store.ts`, `state-navigation.ts`, and
affected resource hooks.

**Proof:** Create one resource, edit one field, reject one change, restore one
change, and open each result from both Home Mari and normal Mari chat.

### Phase 3: Guided Creation and Editing

**Purpose:** Turn Mari into a reliable creation partner for common resources.

**Work:**

- Keep the shared suggestion chip and guided plan contracts as the only guided
  interaction transport.
- Define focused flows for character, lorebook, persona, preset, and chat.
- Ask one focused question at a time for conversational mode.
- Use a bounded plan when the user requests a complete creation flow.
- Include a review summary before a large creation or multi-field edit.
- Offer follow-up actions after creation: open, refine, attach, generate an
  image, or start a chat.
- Preserve typed user text when the user changes a chip draft.
- Keep chips gated to Professor Mari and disabled while a run is active.
- Add negative handling for malformed, excessive, destructive, or stale chips.

**Primary files:** shared Professor Mari types, `MariSuggestionChips.tsx`,
`HomeProfessorMariChat.tsx`, `ChatInput.tsx`, `ConversationInput.tsx`,
`use-generate.ts`, command parsing, seed prompt, and shared styles.

**Proof:** Test empty starters, a multi-step character flow, a lorebook flow,
an interrupted plan, malformed model output, destructive tone rendering, and
non-Mari composer isolation on desktop and mobile.

### Phase 4: Discovery and Universal Assistant Surface

**Purpose:** Make Mari discoverable without making the app feel noisy.

**Work:**

- Keep Command Center as the fast navigation and search surface.
- Add a stable Professor Mari action in Command Center results and detail views.
- Let FAQ results hand off to Mari with the matched question and current
  context attached.
- Add a compact `Ask Mari` action to empty states, setup failures, missing
  connection states, and blocked capability states.
- Let the floating assistant show only when useful, with dismissal state and
  mobile drag behavior preserved.
- Add a global keyboard path that opens Mari with a user-editable draft.
- Avoid automatic model calls from search or FAQ. Handoff must remain explicit.

**Primary files:** `GlobalOmnibar.tsx`, `omnibar-search.ts`, `FaqViewerModal.tsx`,
`HomeFaq.tsx`, empty-state components, `ProfessorMariFloatingAssistantHost.tsx`.

**Proof:** Search for an FAQ answer, open it, hand off to Mari, preserve the
  question, and confirm no request starts before the user sends it.

### Phase 5: Trust, Memory, Skills, and Recovery

**Purpose:** Make advanced Mari features understandable and dependable.

**Work:**

- Add clear status for selected connection, local model, context budget, and
  sandbox availability.
- Add approval history and pending approval visibility to the Mari header.
- Add compact memory and skill indicators with direct access to their panels.
- Add retry and recovery actions for provider errors, tool errors, timeout,
  missing capability, and unavailable remote access.
- Add a context preview before sending attached chats or large files.
- Keep sensitive file, dependency, shell, and app-data rules server-enforced.
- Ensure logs use Pino on the server and remain useful in debug mode without
  exposing secrets.

**Primary files:** `HomeProfessorMariChat.tsx`, workspace routes and services,
storage services, prompt context builders, diagnostics components, and docs.

**Proof:** Verify each error class, approval expiry, restore path, disabled
memory, disabled skill, missing connection, unavailable sandbox, and remote
access restriction.

### Phase 6: Visual and Conversational Polish

**Purpose:** Make the full experience feel like one coherent assistant.

**Work:**

- Use Mari's existing sprites and arrival, idle, blink, map, shrug, and drag
  states in the correct product moments.
- Keep action controls compact and use familiar icons with tooltips.
- Align Home, floating, and normal-chat Mari chrome.
- Tune transcript scrolling, streaming status, tool traces, chips, and review
  cards for light, dark, reduced-motion, and narrow layouts.
- Review all new user-facing text for localization keys and fallback behavior.
- Keep FAQ and documentation as written sources. Let Mari explain live state
  only when the user asks for live state.

**Primary files:** Mari components, `globals.css`, image assets, localization
catalog, and UI regression tests.

**Proof:** Capture desktop and mobile screenshots for Home, floating, normal
  chat, empty state, streaming, approval, review, and error states.

### Phase 7: Documentation and Release Readiness

**Purpose:** Make the behavior supportable and safe to ship.

**Work:**

- Update `docs/home/professor-mari.md` for every shipped entry point.
- Update troubleshooting and FAQ content when behavior or setup changes.
- Add a concise `[Unreleased]` changelog entry for each shipped behavior group.
- Add focused deterministic regressions for context scoping, plan state, action
  parsing, approval boundaries, and result navigation.
- Run the full validation set before each staging PR.
- Keep PR validation checkboxes unchecked for human verification.

**Required checks:**

- `pnpm install`
- `pnpm check`
- `pnpm localization:check`
- `pnpm regression:prompt` for prompt, command, and plan changes
- `pnpm regression:ui` for UI changes
- `pnpm db:push` only when the Mari seed or schema requires it

## Suggested PR Slices

1. Product contract and contextual handoff types.
2. Contextual Ask Mari actions across resource editors and errors.
3. Action result metadata and open/review/restore handoffs.
4. Guided creation and editing flows.
5. Command Center and FAQ Mari handoffs.
6. Trust, recovery, memory, and skill polish.
7. Visual, localization, documentation, and regression coverage.

Each PR should target `staging`, link an issue, state the user problem, and
include manual verification steps and UI evidence where applicable.

## Main Risks

- **Context leakage:** A previous chat or resource can be sent with the wrong
  Mari conversation. Scope every context object by chat ID and clear it on
  restart, switch, and completion.
- **Unsafe action expansion:** New entry points must call existing server-side
  commands. Do not add client-only mutations or bypass approvals.
- **Prompt growth:** Attach summaries and IDs first. Resolve full content only
  when the task needs it and enforce the existing context budget.
- **Stale UI:** Refresh the affected query after a command and provide a direct
  open action when refresh cannot prove the result.
- **Model drift:** Sanitize all structured output at the shared boundary.
  Ignore unknown actions, entities, tones, and oversized payloads.
- **Assistant fatigue:** Keep automatic visibility limited to useful states.
  Keep every model request user-initiated.
- **Worktree conflict:** Preserve the current FAQ, omnibar, modal, localization,
  and e2e changes. Review the combined diff before any shared-file edit.

## Definition Of Done

The experience is complete when a user can start from any supported surface,
ask Mari a grounded question, receive a useful answer, perform a bounded action,
review or restore a change, and return to the affected work without losing
context. The same behavior must work in Home Mari, the floating assistant, and
the normal Professor Mari chat where the surface supports it.
