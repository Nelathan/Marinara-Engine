# Character Library Organization Plan

Status: draft. This is a planning document, not an implementation task.

## Product Goal

Make a library of 150 characters and hundreds of imported tags easy to browse,
find, group, filter, review, and clean without damaging the original card data.

The Character Library is the main workspace for this feature. The compact
Characters panel remains a fast launcher and recent-character surface.

## Product Rules

- Browse characters first. Do not make a tag wall the default view.
- Separate finding, personal organization, and metadata cleanup.
- Keep imported card metadata safe and export-compatible.
- Store local organization separately from the character card where possible.
- Never merge, delete, or rewrite many cards without a preview and confirmation.
- Every bulk mutation must report affected and failed records.
- AI proposes changes. The user approves changes before they apply.
- System facts are calculated. Users do not edit them as ordinary tags.
- Use exact tag filtering and make any/all and include/exclude behavior visible.
- Keep mobile browsing, filtering, selection, and review usable without hover.

## Target Model

```text
Character
  status: active | needs-review | try-later | archived | hidden
  collections: many
  local labels: many
  source tags: many
  system facts: calculated
```

Tag records need a stable identity and should support:

- display name
- canonical name
- type: source, library, system, or hard-field
- visibility: visible, hidden, or ignored
- alias and canonical relationships
- optional group
- protected state
- usage counts
- origin and order for character links

The original card `data.tags` values must remain available. Local canonical
links, aliases, and hidden values must not silently destroy source values.

## Surface Map

### Character Library

Owns Browse, Collections, Saved Views, Discover, Manage, and the result list.

### Compact Characters Panel

Keeps search, favorites, folders, recent cards, active filters, and the button
that opens the full Character Library. It must not render hundreds of tags.

### Character Editor

Uses a searchable tag and label picker. It supports existing values, creation,
aliases, suggestions, ordering, and safe removal.

### Import Flow

Shows source-tag counts and gives imported cards an inbox or review state.

### AI Organization Desk

Provides proposals, explanations, confidence, affected cards, approval, edit,
reject, ignore, and undo. It does not directly rewrite card content.

## Slice Order

Each slice should be a separate reviewable change. Do not begin a dependent
slice until its prerequisite contract is merged or present in the same branch.

Implementation order is **4 -> 6 -> 5 -> 1 -> 2 -> 3**, not the numeric order.
The tag index and tag manager solve the reported problem and need no storage
change. The local-metadata foundation (Slice 1) is only justified once exact
tag filtering and tag cleanup are in use.

Findings from the code review of this plan, applied below:

- Slice 3 must extend `library_folders`, not add a parallel schema. That table
  already stores `scope`, `sortOrder`, and a JSON `itemIds` array. Single-folder
  membership is enforced only by the strip loop in
  `library-folders.storage.ts` `moveItems`, not by the schema.
- Slice 1 adds tables to the file-backed store, so it must bump
  `STORAGE_VERSION` in `packages/server/src/db/file-backed-store.ts` and root
  `storage-format.json` together.
- Slices 12 and 13 must reuse the existing `characters.embedding` column
  (#4768) for similarity work instead of specifying a new similarity service.
- Slice 6 drops the speculative "split a label" operation.

### Slice 0: Contracts, Issue, and Baseline

**Purpose:** Confirm scope and record the behavior before storage work.

**Files to inspect or update:**

- `.github/ISSUE_TEMPLATE/feature_request.md`
- `CHANGELOG.md`, when user-visible behavior starts shipping
- `CONTRIBUTING.md`, only if the contributor workflow needs clarification
- this plan

**Acceptance:** Either a maintainer-approved feature issue exists, or the work
proceeds as roadmapped work through a draft pull request that links this plan.
Pick one route before implementation starts; do not block on both.

### Slice 1: Library Organization Data Foundation

**Purpose:** Add local character organization without changing card exports.

**Likely files:**

- `packages/server/src/db/schema/characters.ts` or the current character schema
- `packages/server/src/db/schema/index.ts`
- `packages/server/src/db/connection.ts` and migration/bootstrap code, if needed
- `packages/server/src/services/storage/characters.storage.ts`
- `packages/server/src/routes/characters.routes.ts`
- `packages/shared/src/types/character.ts`
- `packages/shared/src/schemas/character.schema.ts`
- new `packages/shared/src/types/character-library.ts`
- new `packages/shared/src/schemas/character-library.schema.ts`
- new `packages/client/src/hooks/use-character-library.ts`

**Data:** Add status, review state, import metadata, last-used metadata, and
local organization records. Use the repository's current file-native storage
patterns. Do not create a second copy of card fields.

**Storage format:** Adding tables changes the on-disk storage layout. Bump
`STORAGE_VERSION` in `packages/server/src/db/file-backed-store.ts` and root
`storage-format.json` in the same commit. A missed bump silently disables the
launcher/updater downgrade guard, which reads the file via `git show`. Run
`pnpm regression:launcher-update`, which pins the pairing.

**Acceptance:** Existing cards load unchanged. Local organization survives
reload, export excludes system facts by default, and old installations receive
safe defaults without a destructive migration. `STORAGE_VERSION` and
`storage-format.json` match and the launcher-format-guard regression passes.

### Slice 2: Browse Shelves and Library Navigation

**Purpose:** Make daily finding easier before tag cleanup exists.

**Likely files:**

- `packages/client/src/components/characters/CharacterLibraryView.tsx`
- new `packages/client/src/components/characters/CharacterLibraryNav.tsx`
- new `packages/client/src/components/characters/CharacterLibraryShelf.tsx`
- new `packages/client/src/components/characters/CharacterLibraryFilters.tsx`
- `packages/client/src/components/panels/CharactersPanel.tsx`
- `packages/client/src/stores/ui.store.ts`
- `packages/client/src/localization/locales/en.json`

**Views:** All active, favorites, recently used, new imports, never used,
needs review, unsorted, and archived.

**Acceptance:** A user can open a shelf, start a chat, change status, and return
to the prior shelf. Empty, loading, error, dark, light, and narrow views work.

### Slice 3: Collections

**Purpose:** Add personal grouping that is more flexible than one folder.

**Reuse, do not rebuild.** `packages/server/src/db/schema/library-folders.ts`
already models a named, ordered, scoped group holding a JSON `itemIds` array.
Exclusive membership comes from one loop in `moveItems`
(`library-folders.storage.ts`), which strips the moved IDs from every other
folder. Collections are that table plus a non-stripping `addItems`. Do not add
a second grouping schema and do not plan a permanent two-system transition.

**Likely files:**

- `packages/server/src/db/schema/library-folders.ts`
- `packages/server/src/services/storage/library-folders.storage.ts`
- `packages/server/src/routes/library-folders.routes.ts`
- `packages/shared/src/types/character-library.ts`
- `packages/shared/src/schemas/character-library.schema.ts`
- `packages/client/src/hooks/use-character-library.ts`
- new `packages/client/src/components/characters/CharacterCollectionsView.tsx`
- new `packages/client/src/components/characters/CollectionEditor.tsx`
- `packages/client/src/components/characters/CharacterLibraryView.tsx`
- `packages/client/src/localization/locales/en.json`

**Behavior:** A character can belong to many collections. Collections support
manual order, rename, cover or accent metadata if the existing design supports
it, and bulk add/remove. Folders keep their current exclusive behavior; a
collection is the same record with multi-membership allowed.

**Acceptance:** One character can appear in multiple collections. Removing a
character from a collection does not delete the character. Bulk actions report
partial failures.

### Slice 4: Exact Tag Index and Tag Explorer

**Purpose:** Replace the 550-chip wall with a complete searchable tag view.

**Likely files:**

- `packages/server/src/services/storage/characters.storage.ts`
- `packages/server/src/routes/characters.routes.ts`
- new `packages/server/src/services/storage/character-library-tags.storage.ts`
- new `packages/server/src/routes/character-library-tags.routes.ts`, if route
  separation matches current conventions
- `packages/shared/src/types/character-library.ts`
- `packages/shared/src/schemas/character-library.schema.ts`
- new `packages/client/src/hooks/use-character-library-tags.ts`
- new `packages/client/src/components/characters/CharacterTagExplorer.tsx`
- `packages/client/src/components/panels/CharactersPanel.tsx`
- `packages/client/src/lib/card-library-search.ts`
- `packages/client/src/localization/locales/en.json`

**Behavior:** Return complete-library tag counts. Support search, exact match,
usage sorting, current-result counts, include, exclude, match-any, and
match-all. The compact panel shows active filters and a small frequent-tag list.

**Acceptance:** Tags from every character are discoverable without loading all
character pages into the browser. Counts match stored data. The UI states the
active rule and supports keyboard and mobile use.

### Slice 5: Bulk Organization Actions

**Purpose:** Let users organize many cards in one controlled operation.

**Likely files:**

- `packages/server/src/routes/characters.routes.ts`
- `packages/server/src/services/storage/characters.storage.ts`
- new shared bulk request and result schemas
- `packages/client/src/hooks/use-character-library.ts`
- `packages/client/src/components/ui/SelectionActionBar.tsx`
- `packages/client/src/components/characters/CharacterLibraryView.tsx`
- `packages/client/src/components/characters/CharacterLibraryBulkActions.tsx`
- `packages/client/src/localization/locales/en.json`

**Actions:** Add or remove label, add or remove collection, set status, mark
reviewed, archive, hide source tags, and export selected cards.

**Acceptance:** The preview shows no-op, affected, and skipped cards. The
operation is safe to retry. Partial errors remain visible. Destructive actions
require confirmation.

### Slice 6: Tag Manager

**Purpose:** Make reorder, rename, merge, split, hide, ignore, delete, and
group operations understandable and safe.

**Likely files:**

- new `packages/server/src/services/storage/character-library-tags.storage.ts`
- new `packages/server/src/services/character-library/tag-operations.service.ts`
- new `packages/server/src/routes/character-library-tags.routes.ts`
- shared tag operation request, preview, result, and history schemas
- `packages/client/src/hooks/use-character-library-tags.ts`
- new `packages/client/src/components/characters/CharacterTagManager.tsx`
- new `packages/client/src/components/characters/CharacterTagOperationPreview.tsx`
- new `packages/client/src/components/characters/CharacterTagGroupEditor.tsx`
- `packages/client/src/localization/locales/en.json`

**Operations:**

- reorder tags on one card
- pin or reorder tag groups in the library
- rename a local canonical label
- merge aliases into a canonical label
- hide from normal filters
- ignore future suggestions
- remove from card metadata
- convert source metadata to a local label
- protect important labels

**Acceptance:** Every operation shows affected cards and related collections or
saved views. Source values remain recoverable. Merge removes duplicate links.
History can restore the previous local state.

### Slice 7: Tag Health and Discovery

**Purpose:** Help users understand what is in the library and what is worth
cleaning.

**Likely files:**

- new server tag analytics or query service
- new tag discovery route or extensions to tag routes
- `packages/client/src/hooks/use-character-library-tags.ts`
- new `packages/client/src/components/characters/CharacterLibraryDiscover.tsx`
- new `packages/client/src/components/characters/CharacterLibraryHealth.tsx`
- `packages/client/src/components/characters/CharacterTagManager.tsx`
- `packages/client/src/localization/locales/en.json`

**Reports:** duplicate spellings, aliases, one-use tags, fast-growing tags,
tags common to favorites, tags that often appear together, source-only tags,
cards without organization, cards without summaries, and cards never used.

**Acceptance:** Every report opens a filtered result list. Similarity is a
review suggestion. The system never merges based on similarity alone.

### Slice 8: Saved Views and Smart Collections

**Purpose:** Let users save useful searches and automatic groups.

**Likely files:**

- shared saved-view and smart-collection schemas
- server storage and routes for saved views and rules
- `packages/client/src/hooks/use-character-library.ts`
- new `packages/client/src/components/characters/CharacterSavedViews.tsx`
- new `packages/client/src/components/characters/SmartCollectionEditor.tsx`
- `packages/client/src/components/characters/CharacterLibraryFilters.tsx`
- `packages/client/src/localization/locales/en.json`

**Behavior:** Store visible query rules, collection rules, status rules, tag
rules, sort, and display mode. Use a constrained rule schema instead of
storing executable code.

**Acceptance:** A saved view can be reopened, edited, duplicated, and deleted.
Rules remain understandable. A smart collection updates after card changes.

### Slice 9: Import Inbox and Tag Intake

**Purpose:** Stop future imports from polluting the working library.

**Likely files:**

- `packages/server/src/services/import/st-character.importer.ts`
- `packages/server/src/services/import/st-bulk.importer.ts`
- `packages/server/src/routes/import.routes.ts`
- `packages/client/src/components/modals/ImportCharacterModal.tsx`
- `packages/client/src/components/modals/STBulkImportModal.tsx`
- new `packages/client/src/components/characters/CharacterImportInbox.tsx`
- import and organization hooks
- `packages/client/src/localization/locales/en.json`

**Behavior:** Show card count, existing tags, new tags, possible duplicates,
and a destination collection. New cards can start as needs-review and new
source tags can be visible, hidden, or sent to review.

**Acceptance:** Existing import modes remain available. A user can organize a
batch without editing each card. Import failures do not leave an unknown state.

### Slice 10: Character Editor Tag Picker

**Purpose:** Make per-card tag editing consistent with the library system.

**Likely files:**

- `packages/client/src/components/characters/CharacterEditor.tsx`
- new `packages/client/src/components/characters/CharacterTagPicker.tsx`
- `packages/client/src/components/personas/PersonaEditor.tsx`, if the same
  contract applies to personas
- `packages/client/src/hooks/use-character-library-tags.ts`
- `packages/client/src/localization/locales/en.json`

**Behavior:** Search existing labels, show counts and aliases, create labels,
apply suggestions, reorder values, paste multiple values, and remove safely.
Normalize whitespace and exact duplicates without silently merging meanings.

**Acceptance:** Existing card tags survive editor load and save. The picker
works on mobile and preserves unsaved form changes.

### Slice 11: Tag History and Undo

**Purpose:** Make bulk metadata work reversible.

**Likely files:**

- shared tag-operation history schemas
- server tag operation storage and restore service
- tag routes
- `packages/client/src/hooks/use-character-library-tags.ts`
- new `packages/client/src/components/characters/CharacterTagHistory.tsx`
- toast or notification integration

**Acceptance:** Local rename, merge, hide, delete, and bulk label operations
can be undone. History identifies operation, time, affected cards, old values,
new values, and source-data impact.

### Slice 12: AI Organization Desk

**Purpose:** Reduce organization work while keeping user control.

**Likely files:**

- new shared AI organization proposal schemas
- new server organization proposal service
- existing agent or provider routing files after current architecture review
- new AI organization route or agent capability route
- new `packages/client/src/hooks/use-character-library-ai.ts`
- new `packages/client/src/components/characters/CharacterAiOrganizationDesk.tsx`
- new `packages/client/src/components/characters/CharacterAiProposalReview.tsx`
- `packages/client/src/localization/locales/en.json`
- relevant prompt logging code and debug-mode plumbing

**Reuse first.** `characters.embedding` already stores a per-card semantic
embedding (#4768). Similarity, duplicate-card detection, and "find related
cards" should read that column before any new service is specified. Confirm
what #4768 already exposes before building.

**First capabilities:** Suggest labels, find possible duplicate tags, suggest
collections, and convert natural-language requests into visible filters.

**Rules:** Default to suggest-only. Show evidence, confidence, affected cards,
data sent, and estimated provider use. Do not send the entire library by
default. Do not change card prose, delete cards, merge tags, or apply proposals
without approval.

**Acceptance:** A user can approve, edit, reject, or ignore a proposal. The
result uses normal validated bulk operations. Failed application leaves the
proposal reviewable.

### Slice 13: AI Import and Discovery Assistance

**Purpose:** Use AI for larger organization tasks after the safe proposal flow
exists.

**Likely files:**

- existing AI organization service and schemas
- import inbox components and hooks
- Discover and Health components
- provider privacy and debug settings surface
- `packages/client/src/localization/locales/en.json`

**Capabilities:** Suggest import collections, detect possible duplicate cards
via the existing `characters.embedding` column, find shared concepts, identify missing organization, compare likely card
versions, and suggest small taxonomies.

**Acceptance:** All proposals use the same review, approval, operation history,
and undo path as Slice 12. AI interpretations are labeled as interpretations.

## Cross-Slice Concerns

### Localization

Every new user-facing label, tooltip, placeholder, error, confirmation,
accessibility name, and toast uses a semantic key in the English catalog.
Community locales may fall back to English.

### Accessibility

Use semantic buttons and list or table structures. Support keyboard navigation,
visible focus, screen-reader names, touch targets, and reduced motion. Do not
make color the only signal for source, status, confidence, or destructive work.

### Performance

Tag counts and tag operations must run on the server, because the client
paginates at `LIBRARY_PAGE_SIZE` and can only see loaded cards. This is a
correctness requirement, not a scale one: the file-backed store already holds
every row in memory, so `db.select().from(characters)` is cheap at this size.
Do not require the browser to fetch all card bodies to build the tag explorer.
Virtualize long tag and card lists when the existing library pattern requires
it. Keep card text out of AI requests unless the selected operation needs it.

### Export And Backup

Preserve original card tags. Never export system facts by default. Make local
labels and collections an explicit export choice. Include organization data in
the supported backup format and define restore behavior before shipping it.

### Versioning

Local organization edits should not create noisy character card revisions. If a
tag operation changes card metadata, define whether that is a card revision or
a separate library operation before implementation.

### Changelog

Add a concise user-focused entry under `CHANGELOG.md` for every shipped slice
that changes product behavior. Pure planning changes do not need an entry.

## Verification Plan

For each UI slice, manually verify:

- desktop and narrow mobile viewport
- dark and light theme
- empty, loading, and error states
- keyboard navigation and visible focus
- a library with more than 100 cards
- a library with hundreds of tags
- no-op and partial-failure bulk operations
- export and reload behavior where relevant

Run the repository's required checks for the touched surface:

```bash
pnpm check
pnpm localization:check
pnpm smoke:ui
```

For import, storage, export, or bulk mutation slices, record positive rows,
negative controls, legacy data behavior, and manual blockers. Do not mark PR
test-plan checkboxes as complete on behalf of the user.

## Deferred Ideas

These ideas can follow the core slices:

- visual similarity search
- automatic content-rating detection
- provider-specific local analysis modes
- Surprise Me selection with explainable rules
- collection covers and richer visual shelves
- multi-user or shared library organization
- automatic taxonomy changes without approval

They must not expand the first implementation slices until the core browse,
collection, exact-filter, bulk-operation, and tag-manager workflows are stable.
