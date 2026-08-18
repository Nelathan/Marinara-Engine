# Omnibar Workflow Slice Plan

## Status

Concept and slice plan. No application changes are included in this document.

This plan is the workflow-driven companion to
`omnibar-command-center-professor-mari-plan.md`. That document owns the
architecture, context model (`WorkspaceFocus`), handoff contract, and
verification rules. This document does not repeat them. It defines the user
workflows and the delivery slices that build on that foundation.

Before implementation starts, follow the repository coordination rules: check
for an existing issue, issue-linked branch, draft PR, or project item; make
ownership visible; open a draft PR against `staging` when work starts.

## Core Shift

The omnibar must change from a launcher into a control surface.

> Old model: search for a thing.
> New model: tell Marinara what you want to happen.

Every query should produce one of four useful outcomes. It must never produce
a dead end that only says "no results".

1. A direct action.
2. A clear result to open.
3. A focused clarification.
4. A Mari continuation with visible context.

## Result Model

Every result knows four things:

```text
Target · Operation · Context · Risk
```

The rules that follow from this model:

```text
Known target + clear operation + valid context = direct action
Known target + creative operation             = Mari continuation
Unknown target + creation language            = creation flow
Missing context + safe action                 = ask for the missing choice
Destructive operation                         = confirmation
Visible error + repair language               = recovery flow
```

The first result is always the most useful next step for the current state.
The user never chooses between a "search mode" and a "command mode".

## Selection Stability

Automatic selection is part of trust.

- The top result is selected when the omnibar opens.
- The selected result stays selected while the user types, as long as its
  identity and action stay valid.
- The list may reorder; the selection must not jump because of small score
  changes.

Selection may change only when: the current result no longer matches, the user
changes intent, the current result becomes unavailable, the user moves the
selection, or a stronger exact action replaces a generic one.

Give each result a stable identity, for example
`action:add-character:shrek:chat:midnight-train`. The label may update as the
query clarifies; the action identity must stay stable. `Enter` always runs the
selected result, never an unshown interpretation.

## Context Levels

The same interaction model serves three levels of work:

1. **Object level** — find or change one resource.
2. **Scene level** — change the current chat, game, or story.
3. **Project level** — create or continue a larger piece of work.

The current surface changes the meaning of a request, not the user's words.

> Context changes the meaning of actions. It does not change the user's words.

### Per-Surface Priorities

| Surface | User expects | Top-result bias |
| --- | --- | --- |
| Home | start or resume | create, resume, start chat, import |
| Chat | change the scene | add/remove participant, attach lorebook/persona/preset, revise last reply, change mode |
| Chat with Mari | workspace help + creation | direct action first; Mari continuation carries the current conversation |
| Character editor | shape one character | edit selected field, improve character, generate avatar |
| Lorebook editor | build world knowledge | create/improve entry, generate related entries, connect to chat |
| Preset/connection editor | configure behavior | edit vs. assign vs. diagnose (never confuse these) |
| Settings | find and change a setting | safe toggle direct, show choices for multi-value |
| Game mode | act in the live state | party, quests, scene, map; do not hide game controls |

The active chat is treated as the current workspace. `add Shrek` in a chat
becomes `Add Shrek to "Midnight Train"` with the target chat shown as a
subtitle, so the user never types `add Shrek to the active chat`.

## Workflow Families

These are the requests the omnibar must understand. Each maps to a slice.

1. **Add to the current scene** — `add Shrek`, `bring in a rival`, `attach Wonderland`.
2. **Change the current scene** — `make this more tense`, `rewrite that reply`, `switch to game mode`.
3. **Create from a seed** — `create character Shrek`, `make a shy vampire`, with a defaults path and a Mari path.
4. **Transform existing content** — `make this greeting less formal`, `shorten this`, using the selected field.
5. **Connect items** — `use Moonlight for this chat`, `assign Rowan's persona`.
6. **Start a story or game** — `start a mystery with Luna`, shown as a compact proposal.
7. **Repair and recovery** — `fix this`, `retry`, using the visible error as context.
8. **Find and resume work** — `continue my vampire story`, `open Mari's latest review`.
9. **Compare and recommend** — `which preset is best for horror`, resolving candidates first.
10. **Generate supporting media** — `make a portrait of Luna`, opening generation with context filled in.

## Making "Continue with Mari" Elegant

### The current problem

Today the Mari handoff lives only in the detail/preview panel. The user must
select a result row, wait for the preview panel to render, then click a
separate **Continue with Mari** button (`GlobalOmnibar.tsx`, `previewActions`).
It reads as a second screen and a fat button, not a continuation.

### The target feel

Continue with Mari must feel like pressing forward on the current request, not
opening a separate destination. The visible label stays **Continue with Mari**
in every place, so it always means "continue", never "go somewhere else".

### Changes

- **Make it a result, not only a panel button.** When the query needs judgment,
  creation, or several steps, surface Continue with Mari as a ranked result row
  in the list, so it is reachable and runnable with `Enter` without opening the
  detail panel. The `continueResult` memo already produces a `continue`-group
  result for pending/active work; extend the same pattern to query-driven
  assisted requests.
- **One inline affordance on the selected row.** For a selected resource whose
  best next step is Mari, show a single quiet inline affordance on the row
  (icon + short hint), not a large button in a second pane. Keep exactly one
  Mari affordance visible per result; do not add a row button and a panel
  button for the same action.
- **A stable keyboard path.** Add one shortcut that continues the selected
  result with Mari from anywhere in the list (for example `Tab` or a modifier +
  `Enter`), documented in the keyboard section. `Enter` still runs the primary
  direct action; the Mari shortcut is the explicit "continue instead" path.
- **Carry the focus, do not re-ask.** The handoff already carries query, target,
  field, active chat, and error (see the companion plan). The elegance work is
  presentation only: the transition into Work must keep the same shell, keep the
  original request editable, and show the removable focus row. No second Mari
  header, no nested card, no separate chat window.
- **Never route everything to Mari.** Continue with Mari stays absent as the
  primary result for open, show, add-one-known, attach-one-known, safe toggles,
  resume-known, and retry-known. It is the continuation for creative,
  comparative, multi-step, or under-specified requests only.

Success condition: a user moves from a typed request into Mari in one keystroke
or one click on the selected row, with the request and focus already present,
and no visible "second screen" jump.

## Slice Plan

Each slice ships a complete user workflow. Slices are ordered so the core loop
proves out before broader automation.

### Slice 1 — Stable direct actions

`open Luna`, `add Shrek`, `show lorebooks`, `turn on timestamps`, `resume
Midnight Train`. Auto-select the top result, keep selection stable while
typing, show operation and target, execute the primary action, reject
ambiguous targets, respect dirty-editor protection.

> A user can perform common actions without opening Mari.

### Slice 2 — Contextual chat actions

`add Shrek`, `attach Wonderland`, `use Moonlight`, `remove Luna`, `switch to
game mode`. The result shows the active chat name; the action is computed from
current chat state.

> The user can manage a scene from the omnibar without leaving chat.

### Slice 3 — Creation seeds

`create character Shrek`, `create lorebook Wonderland`, `create persona
detective`, `create preset for horror`. Provide a defaults path and a Mari
path, pre-filled names, and a clear completion target.

> The user can turn a short idea into a usable resource.

### Slice 4 — Editor field context

`make this warmer`, `shorten this`, `rewrite this in first person`, `add a
weakness`. Use the open resource and selected field for characters, lorebook
entries, preset sections, personas, and selected text. Mari receives typed
resource and field references.

> The user can edit the thing in front of them without naming it again.

### Slice 5 — Elegant Mari handoff

Implement the "Making Continue with Mari Elegant" section above. Make Continue
with Mari a ranked result and a single inline row affordance with a keyboard
path. Preserve exact query, surface, target, field, active chat, visible error,
and return location across the transition.

> The user moves from a result into Mari in one keystroke, with context intact
> and no second-screen jump.

### Slice 6 — Review and return

`make Luna's greeting less formal`, `fill this lorebook with entries`, `repair
this connection`, `prepare this character for chat`. Completion offers only
valid actions: Review changes, Open resource, Open field, Retry, Return to
results. Reuse existing editor and review surfaces; do not build a second
review system.

> The user can finish a Mari task and return to the original work.

### Slice 7 — Home creation sessions

`start a mystery with Luna`, `create a campaign about a haunted train`, `build a
fantasy world`, `make a complete character`. Show a temporary proposal with the
intended outcome, resources to create or use, missing decisions, current
progress, and next action. Mari asks one high-value question at a time. This is
a visible creation session, not a task manager.

> The user can move from an idea to a playable starting state.

### Slice 8 — Chat to world

`turn this chat into a lorebook`, `make a campaign from this story`, `extract
the important characters`, `create locations from this scene`. Pass bounded
references and selected content only. Use review before persistent changes.

> A chat can become reusable world material.

### Slice 9 — Game context

`show quests`, `add a healer`, `generate a map`, `continue the encounter`,
`create a rival`. Use campaign, scene, party, encounter, inventory, and active
objectives for ranking. Do not replace game controls.

> The omnibar helps users act inside a game without hiding the game interface.

### Slice 10 — Recovery and continuity

`fix this`, `retry`, `continue my last story`, `review Mari's changes`, `open
the last created resource`. Surface a small Continue group only when the state
exists. Do not show an empty or permanent task list.

> The omnibar remains useful after failure, interruption, or unfinished work.

### Slice 11 — Multi-resource work

`compare these presets`, `build a party from these characters`, `attach these
lorebooks`, `which connection should I use`. The user selects multiple
resources explicitly; Mari receives typed references with count, size, and
token limits.

> Users can coordinate several resources without losing target identity.

## First Release

The first useful release proves this loop:

```text
Open omnibar
→ type a natural request
→ see the current-state action selected
→ execute directly, or continue with Mari in one step
→ review the result
→ return to the original work
```

Slices 1–6 deliver that loop, including the elegant Mari handoff. Slices 7–11
grow it from one object to one scene to one project.
