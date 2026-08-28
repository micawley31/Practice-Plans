# Practice Plans — Handoff / Context

This file exists so a new session (e.g. Claude in VS Code on desktop) can pick up
this project with full context, without re-reading the whole chat history.

## What this is

A volleyball coaching app with two parts:

1. **Drill Library** — a searchable, filterable database of drills (category,
   difficulty, star ratings, comments).
2. **Practice Plan Builder** — a real practice *schedule*: set a start/end time,
   add drills as sequential time blocks, and branch any block into multiple
   parallel "courts" (e.g. two courts running different drills at once).

**No backend yet.** Everything is stored in the browser via `localStorage`.
"Accounts" are local, unauthenticated **profiles** the user names themselves —
not real auth. A real backend (multi-device sync, real accounts) is planned
for later but has not been started.

## Tech stack

- React 18 + TypeScript, bundled with Vite 5
- `react-router-dom` (BrowserRouter in the committed app)
- No UI framework — hand-written CSS in `src/index.css` (CSS custom properties
  for theme tokens, flexbox/grid layout, no Tailwind/MUI/etc.)
- No test framework is set up yet — verification so far has been manual
  (`npm run build` for typecheck + a headless-Chromium smoke-test script
  written ad hoc each session, not committed to the repo)

## Running it

```
npm install
npm run dev      # dev server
npm run build    # tsc typecheck + production build to dist/
npm run preview  # serve the production build
```

## Git state

- Repo: `micawley31/Practice-Plans` on GitHub
- Working branch: `claude/volleyball-drills-app-vpq7e7` (all work so far is on
  this branch, pushed to `origin`; **no PR opened yet** — nothing has been
  merged to `main`)
- Commit history (oldest → newest):
  1. `Add volleyball drill library and practice plan builder` — initial app
  2. `Add star ratings, difficulty tags, comments, and plan favorites`
  3. `Add named local profiles for ratings and comments`
  4. `Add practice start/end time and multi-court branching to plans`
  5. `Make the app responsive for mobile`

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

PlanSegment {              // one "time block" in the schedule
  segmentId,
  tracks: PlanTrack[]       // 1 track = normal block; 2+ = parallel courts
}

PlanTrack {                 // one drill on one court/station within a block
  trackId, label,           // "Court 1", "Court 2"... editable
  drillId, duration, notes?
}
```

**Important semantics:** a segment's displayed/scheduled duration is the
**max** of its tracks' durations (`utils/schedule.ts` → `segmentDuration`),
because parallel courts sync back up — the team moves to the next block once
every court is done, even if one court's drill was shorter.

**Migration:** plans saved before the segments/tracks model (which had a flat
`drills: PlanDrill[]`) are auto-migrated on read in `storage/db.ts`
(`normalizePlan`) into single-track segments. Same pattern for `Drill` fields
added later (`difficulty`, `ratings`, `comments` default in if missing).

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

`deleteDrill` also scrubs the drill out of any plan's segments/tracks, and
drops any segment left with zero tracks.

Seed data: `src/data/seedDrills.ts` — 25 real volleyball drills across all
categories/difficulties, loaded once into `localStorage` on first run
(`ensureSeeded` in db.ts).

## Pages / components map

- `App.tsx` — routes: `/library`, `/plans`, `/plans/new`, `/plans/:id`
- `pages/Library.tsx` — search + category/difficulty/rating filters, drill
  grid, add/edit/delete, rating + comments live in the detail modal
- `pages/Plans.tsx` — saved plans list, favorite toggle, shows time window +
  total scheduled minutes + block/drill counts per plan
- `pages/PlanBuilder.tsx` — the schedule editor: plan meta (name/date/
  start-end time/notes/favorite), the block/track schedule itself, and the
  "add drills from library" picker panel. Uses `utils/schedule.ts` to compute
  each block's clock time range and the overall window/scheduled/remaining
  minutes summary.
- `components/`
  - `DrillCard`, `DrillFormModal`, `DrillDetailModal` — drill CRUD + display
  - `StarRating` — dual-purpose: read-only display or interactive rating input
  - `DrillComments` — comment list + post form (auto-attributed to active profile)
  - `ChipFilter` (generic) + `DrillFilterBar` (search + category + difficulty +
    rating, reused by both Library and PlanBuilder) + `RatingFilter`
  - `NavBar` + `ProfileSwitcher` — profile rename/switch/create UI
  - `AddTrackPicker` — modal to add a parallel court/track to a specific block
  - `Modal` — shared modal shell

## Design/CSS notes

- Tokens in `:root` in `src/index.css` (colors, radius). **Light theme only**
  — no dark-mode media query has been added.
- Mobile breakpoint: `@media (max-width: 640px)` at the bottom of
  `index.css`. Below 640px: navbar stacks into rows, `.field-row` pairs
  stack to one column, grids go single-column, modals become full-screen
  sheets. A second breakpoint at `900px` (`.plan-builder-layout`) drops the
  two-column plan builder to one column.
- Known CSS gotcha already fixed once: form inputs (especially
  `type="date"`/`type="time"`) have a non-trivial browser-default intrinsic
  min-width, which broke flex-row layouts on narrow screens until `.field`
  and its inputs got explicit `min-width: 0` + `width: 100%`. Keep this in
  mind if adding new side-by-side field rows.

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

A build of this branch is published as a Claude Artifact for quick viewing
without running anything locally:
https://claude.ai/code/artifact/751fc85c-6b06-4b3d-b03b-d7944cb340df

That build swaps `BrowserRouter` for `HashRouter` (see the last steps of any
"redeploy artifact" work in the chat history) purely because it's a static
single HTML file with no server-side routing — **the committed source on the
branch still uses `BrowserRouter`**, don't carry that swap into real commits.
Data in that artifact lives in its own browser-local storage, separate from
anything run locally.
