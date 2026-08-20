# Omnibar improvement backlog

A ranked list of what to build next in the omnibar, with the evidence for each
item. Every claim below was checked against the code at the time of writing; the
file:line references are the check. This is a design backlog, not a contract —
for the contract, read `omnibar-feature-inventory.md`.

Scope is the same as the inventory: `GlobalOmnibar.tsx`, the panes under
`components/layout/omnibar/`, the `lib/omnibar-*.ts` modules, and
`lib/command-center.ts`.

Related documents: `omnibar-feature-inventory.md`,
`omnibar-workflow-slice-plan.md`, `omnibar-completion-recovery-design.md`,
`omnibar-command-center-professor-mari-plan.md`.

## 1. The framing

The omnibar is a launcher, and Professor Mari is a room inside it. Every action
ends in `onClose()`. Every Mari path ends in `setPane("mari")`. The user goes to
her, talks, and leaves. She puts nothing back into the result list.

That is the ceiling on the feature, and most items below are one way of raising
it.

## 2. Premises that do not hold

These four beliefs are common, plausible, and wrong. They are recorded here
because each one, if believed, changes the ranking.

**The `professor-suggested` group is empty plumbing.** It is not. Two producers
fill it: `omnibar-results.ts:603` promotes the Ask-Mari row into the group when
`promoteMari` is set, and `omnibar-results.ts:862` pushes the
`suggestion:edit-focused-field` row. The group holds a *door*, not an answer.
Replacing the door with answers therefore needs a new asynchronous producer
inside a list that re-renders on every keystroke. That is expensive, not cheap.

**The `recommend` intent is parsed and then ignored.** It reaches Mari.
`promoteMari` at `omnibar-results.ts:588` includes `intent?.kind === "recommend"`
and gives the Mari row a score of 500. What is missing is narrower: `scoreIntent`
in `omnibar-search.ts:334` has no `recommend` branch, so the *other* rows — the
two presets the user wants compared — get no boost.

**Pinning is one keybinding from working, and is the biggest cheap win.** The
first half is true. `setCommandPinned` (`command-center.ts:372`) has no caller
outside its own test, while the ranking boost (`+1000`, `command-center.ts:402`),
the group (`command-center.ts:478`) and the persisted `pinnedIds` all exist. The
second half is not: `GlobalOmnibar.tsx:1245` strips `pinnedIds` for every
non-empty query, so a pin reorders the idle deck only.

**Mari polls every five seconds, so background observation is free.** She polls
only while the dialog is mounted. `useProfessorMariWorkspaceStatus` is called at
`GlobalOmnibar.tsx:433`, inside the dialog, and `GlobalOmnibarHost.tsx:86`
returns `null` when the omnibar is closed.

## 3. The root cause

`GlobalOmnibarHost.tsx:86` unmounts the whole dialog on close. Every piece of
Mari state in the dialog is component-local and dies with it — `mariTaskFinished`
(`GlobalOmnibar.tsx:402`), `mariOpenChatId` (`GlobalOmnibar.tsx:977`).

`mariTaskFinished` is worse than lost: it is a client-side edge detect
(`GlobalOmnibar.tsx:1911`) of a fact the server already owns. The condition
`pane === "mari"` is a symptom. Removing it would not help, because the state
still dies at unmount.

Three separate backlog items — "a finished task is lost", "give Mari a background
lane", "one thread across surfaces" — are this one cause. They are not three
features.

Two mechanisms already exist to fix it. `CommandCenterSessionState` survives
close (`setSessionValue`, `GlobalOmnibar.tsx:376`), and the status payload
already carries `active`, `pendingApprovals` and `history`
(`shared/src/types/professor-mari-workspace.ts:585-597`). Preferred fix: derive
the row from the server payload and delete the local flag.

## 4. Ranked backlog

Ordered by value against cost. Items 1 to 3 share one surface and should land
together or in order.

### 1. Delete `mariTaskFinished`; read completion from the status payload — **done**

Removes state rather than adding it, resolves the root cause in section 3, and
is a prerequisite for item 2. `buildOmnibarContinueResult`
(`omnibar-results.ts:1247`) already reads the same payload.

### 2. Turn the approval count into rows — **done**

`buildOmnibarContinueResult` collapses `pendingApprovals` to one "Review Mari's
pending work" row, and `GlobalOmnibar.tsx:1654` already routes `reviewPending`.
`MariWorkspacePendingApproval` is a typed union, so each approval can be its own
row with approve, reject and explain. No server work.

Built as `buildOmnibarApprovalResults` in `omnibar-results.ts`, one row per
approval, with the decision on the ordinary `choice` control the settings and
chat rows already use. The decision runs through `hooks/use-mari-approvals.ts`,
which the Work pane also uses, so the same request, the same toasts and the same
error handling back both surfaces.

Found while building, and worth knowing before extending this: **the three
approval kinds are not equally reversible.** A database approval is *already
applied* — approve calls `keepAppliedReviewAndWait` (keep it) and reject calls
`restoreAppliedReview` (revert it), so inline is safe in both directions. A
`dependency_install` or `sensitive_file` approval has *not* run: approving it
installs a package or writes the file. The rows say install/not now and
apply/discard rather than keep/restore for exactly that reason, but an inline
approve of a package install is still a supply-chain action taken from a search
box. Revisit if that turns out to be too fast a path.

### 3. Surface `history`, with restore

`MariDbHistoryEntry` records `command`, `reason`, `affectedTables`,
`affectedRows`, and a status that includes `restored`. The restore path exists on
the server and no client surface uses it. A user who can see and revert every
write Mari made will let her do more work.

### 4. Add the pin keybinding — **done**

Cmd/Ctrl+P toggles the pin on the focused row; the footer teaches the shortcut
when a row is focused. The hint string `commandCenter.keyboard.pin` already
existed and was never rendered, which says this was the intended binding all
along. Pins stay stripped for a non-empty query (`GlobalOmnibar.tsx:1245`): a pin
curates the deck the bar opens on and does not override relevance.

### 5. Subsequence matching in `scoreText` — **done**

`scoreSubsequence` is the new bottom rung, below every literal tier, floored at
three characters so a short query does not match every title. The shorter of two
matching titles scores higher.

### 6. The small fixes, batched — **done**

- `scoreIntent` gains a `recommend` branch (`omnibar-search.ts:334`).
- `commandCenter.compareSelectionCount` (`locales/en.json:309`, used at
  `OmnibarBrowsePane.tsx:76`) hardcodes `/5` in the string. It should take
  `BROWSE_COMPARE_LIMIT` (`GlobalOmnibar.tsx:211`), which the guard beside it
  already uses.
- The scope prefixes (`char:`, `msg:`, `lore:`, `faq:`) appear only in the
  placeholder. Teach them in the empty-query deck.
- `usePreviewDetail` gives lazy detail to chats and lorebooks but not to
  characters, the most-used kind. Characters now preview their greeting, tags and
  greeting count.

### 7. Rule: Mari proposes diffs, never silent writes

Cheap to adopt now, expensive to retrofit once more producers exist. The review
path is partly built: `scripts/regressions/mari/edit-diff.regression.ts` exists
and the `show-review` completion kind is already defined for `edit` and `repair`.

### 8. Close the world-building loop

`parseCreationSeed` builds a world from a sentence; `parseChatExtraction` pulls
one back out of a played chat. Nothing joins the two ends. After a session, the
idle omnibar should lead with "This chat named 4 things that are in no lorebook.
Capture them?" and let the user accept or reject each proposed entry.

### 9. Repair that repairs

The intent parser classifies `repair` and the result is a chat box. "My replies
are slow" should read the connection, the preset token budget and the active
lorebook size, then return patched values as accept or reject rows — the same
proposal surface as item 8, with a second producer.

### 10. Mari as a result source

The largest change in the product: search stops handing off to Mari, and Mari
answers inside search. Ranked last because section 2 shows it needs a new
asynchronous producer, and items 1 to 3 build the spine it depends on.

## 5. Considered and declined

- **Localise the verb tables.** `INTENT_PATTERNS`, `OBJECT_KIND_WORDS`,
  `DETACHING_VERBS` and the scope prefixes are English regular expressions.
  Large to fix. The honest short fix is one paragraph in the user documentation
  stating that verbs, intents and scopes are English-only.
- **Edit settings sliders and selects in place.** 25 named controls navigate to a
  tab and only the 9 toggles act in place. This is a lot of work to save one
  click.
- **Demote a command on a fast return.** "The user came straight back" is a
  heuristic that will punish correct picks. Revisit only when ranking is
  measurably wrong.
- **Let Mari observe quietly.** Section 2 shows there is no polling to lean on
  while the omnibar is closed.

## 6. Not yet ranked

- **Durable memory of the user's world.** Context is rebuilt from scratch on
  every ask by `buildProfessorMariCommandCenterContext`, and every accepted
  proposal, rejected suggestion and repair is discarded at `onClose()`. This is
  the deepest idea on the list and it needs a design conversation about what Mari
  is allowed to remember before it becomes a task.
- **A first-run state.** A new user with an empty library gets an idle deck built
  from nothing. Real, but it should wait until items 1 to 3 have settled the
  shape of that deck.
