# Practice Plans — Handoff / Context

This file exists so a new session (e.g. Claude in VS Code on desktop) can pick up
this project with full context, without re-reading the whole chat history.

## What this is

A volleyball coaching app with two parts:

1. **Drill Library** — a searchable, filterable database of drills (category,
   difficulty, star ratings, comments). ~96 drills are seeded across all 10
   categories (sourced from web research; see `src/data/seedDrills.ts`).
2. **Practice Plan Builder** — a real practice *schedule*: set a start/end time,
   add drills as sequential time blocks, branch any block into multiple
   parallel "courts" (e.g. two courts running different drills at once), and
   insert **break** blocks (rest/water breaks with no drill attached) anywhere
   in the sequence.

**No backend yet.** Everything is stored in the browser via `localStorage`.
"Accounts" are local, unauthenticated **profiles** the user names themselves —
not real auth. A real backend (multi-device sync, real accounts) is planned
for later but has not been started.

## Tech stack

- React 18 + TypeScript, bundled with Vite 5
- `react-router-dom` (BrowserRouter in the committed app)
- No UI framework, no icon library — hand-written CSS in `src/index.css`
  (CSS custom properties for theme tokens, flexbox/grid layout) and a small
  hand-authored inline-SVG icon set in `src/components/icons.tsx`. Zero new
  npm dependencies were added this session (check `package.json`/
  `package-lock.json` are untouched if that ever seems surprising).
- No test framework is set up yet — verification so far has been manual
  (`npm run build` for typecheck, plus ad-hoc Playwright smoke scripts run
  from a scratch directory outside the repo, not committed).

## Running it

```
npm install
npm run dev      # dev server
npm run build    # tsc typecheck + production build to dist/
npm run preview  # serve the production build
```

## Git state

- Repo: `micawley31/Practice-Plans` on GitHub
- Working branch: `claude/volleyball-drills-app-vpq7e7` (pushed to `origin`;
  **no PR opened yet** — nothing merged to `main`)
- Commit history (oldest → newest):
  1. `Add volleyball drill library and practice plan builder` — initial app
  2. `Add star ratings, difficulty tags, comments, and plan favorites`
  3. `Add named local profiles for ratings and comments`
  4. `Add practice start/end time and multi-court branching to plans`
  5. `Make the app responsive for mobile`
  6. `Add handoff doc for switching to a desktop VS Code session`
- **⚠️ As of this handoff, there is a large amount of UNCOMMITTED work in the
  working tree** — an extensive session (drill seeding, a full UX pass, a
  break-block feature, an icon-system overhaul, several PlanBuilder layout
  iterations) touched ~18 existing files and added 4 new component files.
  Run `git status` / `git diff --stat` before doing anything destructive.
  Nothing has been committed or pushed from this session yet — that's a
  decision for the user, not something to do proactively.

## Data model (`src/types.ts`)

```ts
Drill {
  id, name, category, difficulty, description, tags[],
  duration,               // minutes, drill's own suggested length
  participants?, equipment?,
  ratings: Record<raterProfileId, 1-5>,
  comments: DrillComment[],
  createdAt, updatedAt
}

DrillCategory = Warm-up | Serving | Passing & Receiving | Setting | Attacking
              | Blocking | Defense & Digging | Ball Control | Conditioning
              | Team & Scrimmage

DrillDifficulty = Beginner | Intermediate | Advanced

DrillComment { id, text, author?, createdAt }

Profile { id, name, createdAt }
// Local-only "who's using this browser" identity. No password/auth.
// Ratings key off profile.id; comments snapshot profile.name as `author`.

PracticePlan {
  id, name, date?,
  startTime?, endTime?,   // "HH:MM" 24h, from <input type="time">
  notes?,
  segments: PlanSegment[],
  favorite: boolean,
  createdAt, updatedAt
}

// PlanSegment is now a discriminated union — added this session for break
// support. `kind` is the discriminant.
PlanSegment = DrillSegment | BreakSegment

DrillSegment {
  segmentId, kind: "drill",
  tracks: PlanTrack[]       // 1 track = normal block; 2+ = parallel courts
}

BreakSegment {
  segmentId, kind: "break",
  label,                    // editable text, defaults to "Break"
  duration                  // minutes, defaults to 5
}

PlanTrack {                 // one drill on one court/station within a block
  trackId, label,           // "Court 1", "Court 2"... editable
  drillId, duration, notes?
}
```

**Important semantics:** a segment's displayed/scheduled duration is the
**max** of its tracks' durations for a `DrillSegment` (`utils/schedule.ts` →
`segmentDuration`), or simply `duration` for a `BreakSegment`. Parallel courts
sync back up — the team moves to the next block once every court is done,
even if one court's drill was shorter. The inline duration editor in the
block header (pencil icon) sets **all tracks in a segment to the same
value** when you edit it there — there's no per-track duration UI anymore
(removed this session in favor of the single header control).

**Migration:** legacy plans with a flat `drills: PlanDrill[]` (pre-segments)
are migrated in `storage/db.ts` (`normalizePlan`) into single-track segments.
Segments saved before break support (no `kind` field) are normalized to
`kind: "drill"` by `normalizeSegment`. `Drill` fields added later
(`difficulty`, `ratings`, `comments`) default in if missing, same as before.

## Storage layer (`src/storage/db.ts`)

All reads/writes go through this module — nothing touches `localStorage`
directly elsewhere. Key functions:

- `getDrills / getDrill / addDrill / updateDrill / deleteDrill`
- `rateDrill(id, score)` — keys off `getActiveProfile().id`
- `addComment(drillId, text) / deleteComment` — author = active profile name
- `getProfiles / getActiveProfile / setActiveProfile / createProfile / renameProfile`
- `getPlans / getPlan / addPlan / updatePlan / deletePlan / toggleFavoritePlan`
- `makeId()` — exported, used by UI code when constructing new
  segments/tracks client-side before save

`deleteDrill` scrubs the drill out of any plan's `DrillSegment` tracks
(leaving `BreakSegment`s untouched) and drops any drill segment left with
zero tracks.

Seed data: `src/data/seedDrills.ts` — ~96 real volleyball drills across all
10 categories (grew from an initial 25 via a web-research pass this
session), loaded once into `localStorage` on first run (`ensureSeeded`).
**If you already have a browser profile with the old seed data, new entries
won't appear** — the app only seeds on an empty `localStorage`; clear site
data to re-seed.

## Pages / components map

- `App.tsx` — routes: `/library`, `/plans`, `/plans/new`, `/plans/:id`; now
  wrapped in `<ToastProvider>`.
- `pages/Library.tsx` — search + collapsible category/difficulty/rating
  filter panel (persisted to `sessionStorage` across navigation), drill grid,
  add/edit/delete (via `ConfirmDialog`, not `window.confirm`), rating +
  comments live in the detail modal, toasts on every mutation.
- `pages/Plans.tsx` — saved plans list, favorite toggle, **Duplicate** button
  (deep-clones segments/tracks incl. breaks with fresh IDs), delete via
  `ConfirmDialog`, time window + total scheduled minutes + block/drill counts
  per plan, all with flat SVG icons instead of emoji.
- `pages/PlanBuilder.tsx` — the schedule editor. Current layout:
  - **Main column (left):** "Practice schedule" header with "+ Add Break"
    (appends at the end) and "+ Add Drills" (opens the drawer) buttons. Below
    it, the ordered block list — a small "+ Add Break" pill sits **before
    the first block, between every pair, and after the last one**, each
    inserting a break at that exact position (`addBreakAt(index)`). Each
    block card has a light-gray background + shadow; a header row with
    reorder chevrons, a clickable title (opens `DrillInfoModal` for drill
    blocks; a plain editable text input for break blocks) with an inline
    duration editor (pencil icon → number input); actions (+Add Parallel
    Court / delete for drill blocks, just delete for breaks); then, for
    drill blocks only, a **pills row** (bigger category/difficulty badges,
    left-aligned with the reorder-arrows column, extra top margin) sitting
    above the per-track grid (court label + drill name/pills *only shown
    per-track when there are 2+ parallel tracks* + Notes field).
  - **Sidebar (right):** three stacked pieces — a card with just Plan name +
    Start/End time (no heading, no Date/Notes fields — removed on request),
    a "Plan Stats" card (time planned / time left / time-by-skill bars via
    `categoryBreakdown`), and a full-width "Save Practice Plan" button.
  - **Drill picker:** a slide-over drawer (`.drawer-overlay` / `.drill-drawer`,
    opened by "+ Add Drills", NOT a persistent sidebar panel — that was tried
    and reverted, see below) containing a collapsible filter panel (collapsed
    by default, chip badge shows active-filter count, "Clear filters" link),
    a "**+ Create New Drill**" button that opens `DrillFormModal` and on save
    both adds the drill to the library *and* as a new block in the current
    plan (`handleCreateDrill`), then the filtered `DrillCard` grid (shows
    "✓ In plan" / "Add Again" for drills already used in this plan).
- `components/`
  - `DrillCard`, `DrillFormModal`, `DrillDetailModal` — drill CRUD + display
    (full interactive detail: edit/delete/rate/comment)
  - `DrillInfoModal` — **new**: read-only drill detail view (badges, rating,
    description, meta, tags — no edit/delete/rate/comment), used from
    PlanBuilder so viewing a block's drill doesn't pull in editing affordances
  - `StarRating` — dual-purpose rating display/input; all stars render the
    same solid `StarIcon` shape now, with state conveyed by color only
    (`.star-filled`) rather than filled-vs-outline glyphs
  - `DrillComments` — comment list + post form (auto-attributed to active profile)
  - `ChipFilter` (generic) + `DrillFilterBar` (search + **collapsible**
    category/difficulty/rating panel, reused by Library and the PlanBuilder
    drawer) + `RatingFilter`
  - `NavBar` + `ProfileSwitcher` — profile rename/switch/create UI;
    switching/creating/renaming a profile no longer does a full
    `window.location.reload()`, it's local React state now
  - `AddTrackPicker` — modal to add a parallel court/track to a specific block
  - `Modal` — shared modal shell. Gained: Escape-to-close, a focus trap, and
    a stacking-aware "topmost modal only" system (module-level `openModalIds`)
    so a `ConfirmDialog` opened on top of another modal doesn't also close
    the modal underneath it.
  - `ConfirmDialog` — **new**: styled confirm/cancel dialog. Replaces every
    `window.confirm()` call app-wide (delete drill/plan/comment, discard
    unsaved changes in `DrillFormModal`).
  - `ToastProvider` / `useToast()` — **new**: bottom-center toast
    notifications; wraps `<App>`. Used for save/delete/duplicate/create
    feedback across Library, Plans, and PlanBuilder.
  - `icons.tsx` — **new**: hand-authored flat SVG icon set (`TrashIcon`,
    `PencilIcon`, `ClockIcon`, `UsersIcon`, `UserIcon`, `XIcon`,
    `ChevronUpIcon`, `ChevronDownIcon`, `InfoIcon`, `ClipboardListIcon`,
    `StarIcon`, `CheckIcon`). Every icon defaults to `size="1em"` so it
    scales with whatever font-size context it's dropped into — this let
    existing font-size-based CSS (`.info-icon`, `.star`, etc.) keep working
    unchanged instead of needing pixel-size rewrites everywhere. This
    replaced **every** emoji/unicode icon glyph in the app **except** the
    🏐 in the NavBar brand mark, which was deliberately left as branding
    personality rather than a functional UI icon (a judgment call — revisit
    if that reads as inconsistent).

## Design/CSS notes

- Still **light theme only** — no dark-mode media query.
- Mobile breakpoint: `@media (max-width: 640px)`. The PlanBuilder two-column
  grid is `.plan-builder-grid` (renamed from the old `.plan-builder-layout`)
  and collapses to one column at `900px`.
- `overflow-x: hidden` added on `body` as a backstop against horizontal
  scroll (a user report we couldn't reproduce beyond a 1px rounding artifact
  at 320px). Also hardened along the way: `.drill-card-header` got
  `flex-wrap: wrap` + `.drill-card-name { min-width: 0 }` (a long name +
  badges could previously refuse to wrap), and `.drill-grid`'s column floor
  is now `minmax(min(280px, 100%), 1fr)` so it can never force a column
  wider than its container.
- Icon system utility classes: `.icon` (`display:inline-block;
  vertical-align:-0.15em;`) is applied by every icon component automatically;
  `.icon-label` (`display:inline-flex; align-items:center; gap:5px;`) is the
  utility for pairing an icon with adjacent text — use it whenever adding a
  new icon+text combo so spacing stays consistent with the rest of the app.
- `.btn-icon-danger` has no border/background at rest anymore (flat icon
  look, just a light red hover tint) and is used standalone, not combined
  with `.btn-icon`.
- `.plan-segment` blocks have a light-gray background (`#f8fafc`) + a
  subtle two-layer box-shadow so they read as distinct cards against the
  white schedule panel. `.plan-track` intentionally has **no** background of
  its own anymore (was `#f8fafc`, same as the segment — removed so the Notes
  field sits directly on the block's bg instead of a redundant nested box).
- `.plan-segment-pills` (the category/difficulty badges on a drill block) use
  bigger padding/font than the base `.badge` (`6px 16px` / `~0.9rem` vs.
  `2px 10px` / `0.75rem`) and sit on their own row below the header,
  left-aligned with the reorder-arrow column, with `margin-top: 6px`. This
  sizing is scoped to `.plan-segment-pills .badge`, not a global `.badge`
  change — per-track pills (shown only for multi-court blocks) stay at the
  original smaller size.
- Known CSS gotcha (still valid): form inputs, especially `type="date"` /
  `type="time"`, have a non-trivial browser-default intrinsic min-width,
  which breaks flex-row layouts on narrow screens unless `.field` and its
  inputs get explicit `min-width: 0` + `width: 100%`.

## Notable reverted experiments (don't redo without reason)

- **Persistent sidebar "Drill Library" card** (checkout-page-style layout
  with the drawer replaced by an always-visible, height-capped, scrollable
  card in the sidebar) was built, then explicitly reverted back to the
  slide-over drawer — the user found the sidebar "too much content." If a
  future request nudges back toward a persistent picker, know that's already
  been tried and rejected once.
- **Editable custom block/segment names** (a text input defaulting to
  "Block N", freely renamable) was built, then replaced by the current
  behavior: the title is always derived from the drill name(s) and is a
  click-to-view-info button instead, not a free-text field.
- **Pills + Notes indented to align with the title text** (offset past the
  reorder-arrow column via a `--block-content-indent` CSS var) was tried and
  reverted back to flush-left — the offset "didn't look great" per the user;
  a top-margin on the pills row was added instead for breathing room.

## Things intentionally deferred / not built yet

- **No backend** — explicitly requested to defer. When this happens, the
  natural seams are `storage/db.ts` (swap localStorage calls for API calls)
  and `Profile` (would become real auth).
- **No dark mode.**
- **No automated tests.**
- **No drag-and-drop reordering** — blocks/tracks reorder via up/down
  buttons only.
- Ratings/comments are per-browser via the active local profile, not real
  per-person accounts — anyone sharing a device/profile shares that identity.

## Live preview

⚠️ **Likely stale.** A build of an earlier version of this branch was
published as a Claude Artifact:
https://claude.ai/code/artifact/751fc85c-6b06-4b3d-b03b-d7944cb340df

That link predates this session's entire UX pass, break-block feature, and
icon overhaul — it will not reflect current source. Nobody redeployed it
this session; treat it as historical unless/until it's refreshed. If you do
redeploy, remember the prior note: that build swaps `BrowserRouter` for
`HashRouter` purely because it's a static single HTML file with no
server-side routing — **the committed source should keep `BrowserRouter`**,
don't carry that swap into real commits. Data in that artifact lives in its
own browser-local storage, separate from anything run locally.
