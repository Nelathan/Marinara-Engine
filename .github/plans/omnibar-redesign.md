# Omnibar Redesign — "Spotlight, but ours"

Make the Global Omnibar feel like a premium, floating command surface: quiet,
warm, tactile, and alive — not a blocky dialog with a permanent sidebar. Borrow
Spotlight's *posture* (centered, compact, inviting empty state, one focused
column) without its glass or its whiteness. Stay on our theme tokens; work in
light and dark; respect reduced motion.

This plan supersedes the presentation notes at the end of
`professor-mari-in-omnibar.md`. Mari behavior is done; this is the shell.

## Problems we are fixing

1. **The permanent sidebar.** The detail aside is docked whenever `pane` is
   `results` (`sm:w-[23rem] sm:border-l`). Every search shows a hard rule and a
   half-empty preview. Spotlight has no permanent second column.
2. **The 60rem wall.** `sm:max-w-[60rem]` + `rounded-lg` + flat 1px border reads
   as a modal, not a floating launcher.
3. **A dead empty state.** Four muted rows under a 12px gray hint
   ("Pinned, recent, and useful actions"). No hierarchy, no warmth, no entry
   point — and it hides the Mari surface we just embedded.
4. **No color, no depth.** Flat `--card` fill, single border, no elevation, no
   light. Reads "boring."
5. **Dense, samey rows.** Selection is a thin highlight; rows are cramped.

## Design principles

- **One focused column at rest.** Preview is a consequence of intent, not a
  permanent fixture. It arrives when you lean in (hover/select/right-arrow) and
  leaves when you don't.
- **Floating, not modal.** Compact width, generous radius, layered shadow, a
  hairline ring instead of a hard border. It hovers over the app.
- **Warm light from the top.** A low-opacity primary-tinted gradient wash behind
  the header, unifying every pane (search, browse, Mari). No glass, no white.
- **The empty state is the front door.** A greeting, the Mari avatar as a living
  invitation, and thumbnailed recents — the best screen, not the worst.
- **Tactile selection.** Rounded accent pill, real padding, media-forward rows.
- **Motion that explains.** Preview slides from the selected row; panes cross
  on the existing track; nothing teleports. All gated on `motion-safe`.

## Target anatomy

```
┌───────────────────────────────────────────────┐  <- rounded-2xl, ring, shadow-2xl
│  ◎  search input …………………………………  [Mari]  [x]  │  <- header over gradient wash
├───────────────────────────────────────────────┤
│  filter chips (only while searching/browsing)  │
├───────────────────────────────────────────────┤
│                                                 │
│   RESULTS  (full width at rest)                 │
│                                                 │
│   ┌── preview ──┐  <- slides in on selection,   │
│   └─────────────┘     overlays right third,     │
│                       not a docked column       │
└───────────────────────────────────────────────┘
```

### Panel

- Width `sm:max-w-[44rem]` (down from 60rem).
- Radius `sm:rounded-2xl`.
- Elevation: drop the 1px border for `ring-1 ring-[var(--border)]/60` +
  `shadow-2xl`; add a subtle inner top highlight (`shadow-[inset_0_1px_0_...]`).
- Backdrop stays `bg-black/55`; add a slight `backdrop-blur-sm` on the scrim
  only (not the panel — no glass on content).

### Header gradient wash

- A pseudo layer behind the header + first rows: two radial stops in
  `--primary` / accent hues at ~8–12% alpha, fading to `--card`.
- Reuse the Mari-pane gradient recipe so all panes share one light source.
- Dark and light variants via existing token opacities.

### Preview: docked -> summoned

- At rest (`results`, desktop): results are full width; **no aside**.
- On row selection (keyboard or hover-intent), the preview **slides in from the
  right** over ~the right third, with the results list easing to make room
  (width transition, not a hard column). Leaving selection or pressing Left
  dismisses it.
- Coarse pointer / mobile keep today's full-screen `detail` pane (unchanged).
- Right-arrow still opens the full `detail` pane for rich results.

## Empty state (idle, no query)

Replace the muted hint + 4 rows with a composed front door:

1. **Greeting band.** Mari peek avatar (small, warm) + a time-aware line
   ("Good evening — what do you want to do?") and a one-line hint. Clicking the
   avatar or pressing a key opens the Mari pane.
2. **Suggestions.** 3–4 high-signal actions (create chat/character, resume last
   chat, open settings) as **larger media rows** using the thumbnails the data
   already carries.
3. **Recent.** Recent chats/resources as rows with avatars, quiet
   `Recent` section header (Spotlight style).
4. **Browse affordance.** Keep the Browse button, restyled as a soft trailing
   chip.

All sections reuse `presentCommandCenterResults` grouping; only presentation
changes.

## Rows & selection

- Row height +2, horizontal padding +2, `rounded-xl` hover.
- Selected: full `rounded-xl` accent pill (`bg-[var(--accent)]` in light,
  primary-tint in dark), left media, title/subtitle stack, trailing hint/control.
- Media-forward: show avatar/artwork thumbnail at 32–36px when present.
- Enter-hint and control chips right-aligned, quiet until row is active.

## Motion language

- Panel open: scale-from-98% + fade, 160ms, `motion-safe` only.
- Pane cross (results/browse/mari): reuse existing track; add 12px slide.
- Preview summon: width + translate-x spring, 200ms.
- Empty-state sections: staggered `animate-fade-in-up` (already in globals.css).
- Everything guarded; `prefers-reduced-motion` collapses to opacity only.

## Tokens / CSS

- Add omnibar-scoped classes to `globals.css` (panel, wash, row, preview slide)
  rather than long inline strings; keep values on CSS vars for theme swap.
- No new dependencies. No color literals outside the gradient wash (which mirrors
  the Mari pane already in the tree).

## Accessibility

- Preserve focus trap, `aria-live` result count, roving selection.
- Summoned preview must not steal focus; it mirrors the active row.
- Greeting avatar is a real button with a label, not decoration.
- Contrast checked in both themes for the accent pill and wash.

## Responsive / mobile

- Mobile keeps full-height sheet + full-screen `detail` pane (unchanged).
- The summoned-preview behavior is desktop-only (`sm:` + fine pointer).
- Narrower max-width only applies at `sm+`; mobile stays full width.

## Phases

1. **Panel shell.** Width, radius, ring, shadow, scrim blur, top gradient wash.
   Pure CSS; no behavior change. *(safe, high feel-per-line)*
2. **Undock the preview.** Remove the docked aside on `results`; add the
   summon-on-selection slide. Desktop + coarse-pointer paths verified.
3. **Empty-state front door.** Greeting band, suggestions, thumbnailed recents.
4. **Row & selection polish.** Padding, pill, media-forward rows.
5. **Motion pass.** Open, pane cross, summon, stagger — all `motion-safe`.
6. **Persisted-pane reset.** Reopen defaults to `results`; Mari conversation
   still resumes on explicit re-entry. (Carried from the review.)
7. **Docs + regression + i18n keys.** New localized strings (greeting, hints);
   update any omnibar screenshots/docs; add deterministic coverage for the
   idle/empty presentation and the summon toggle.

## Validation

- `pnpm check` after every phase.
- `pnpm localization:check` for new keys.
- Focused regression for empty-state grouping and preview summon state.
- Manual desktop + mobile browser pass (light/dark, reduced-motion) — the
  Playwright lane is currently blocked (`libnspr4.so`); note it as required
  manual proof, do not auto-check the box.

## Non-goals

- No glass/blur on content, no forced white — dark stays first-class.
- No change to search ranking, command execution, or Mari agent logic.
- No new dependency.
- Keep the old Home/floating Mari mounts untouched.
