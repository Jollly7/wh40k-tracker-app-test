# CLAUDE.md — Warhammer 40k Battle Round Tracker

## Project Overview

A **Progressive Web App (PWA)** built for personal use on a Samsung tablet.
Tracks a 1v1 Warhammer 40k 10th Edition game in real time: Command Points,
Victory Points, Objectives, turn phases, and faction reminders.

No server, no login, no app store. Runs entirely in the browser, works offline.

Deployed via Cloudflare Pages: https://40k-battle-companion.pages.dev
Repo: `40k-battle-companion` under username `Jollly7` — CI/CD via Cloudflare Pages (connected to GitHub repo, replaces GitHub Actions).

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Persistence | localStorage (`zustand/middleware` persist, key `wh40k-game-state` v1) |
| PWA | vite-plugin-pwa |
| Icons/UI | Lucide React |
| Charting | Recharts (end-of-game summary line chart) |
| Backend | Cloudflare Pages Functions (`functions/api/rosters.js`) |
| Storage | Cloudflare KV (namespace: `40K_ROSTERS`, bound as `ROSTERS`) |

> Do not introduce additional libraries without explaining why and getting confirmation.

---

## How to Operate

- **Explain reasoning before writing code** — especially for architectural or structural decisions.
- **Ask before making structural changes** — state shape, new libraries, splitting/merging components.
- **Build the smallest working version first**, then layer complexity.
- **Name both options briefly** when uncertain, and recommend one with a reason.
- **Flag any conflict with this file** before proceeding.

---

## App Structure

```
src/
  components/
    layout/        # App shell, header, tab navigation
    cp/            # Command Point tracker
    vp/            # Victory Point tracker + scoring breakdown
    objectives/    # Objective map
    phases/        # Turn phase checklist
    timer/         # Round timer (lives in header)
    factions/      # Faction/detachment reminder panels
    army/          # Army list tab (ArmyTab.jsx, ArmyPanel.jsx, UnitAccordion.jsx)
  store/
    gameStore.js   # Zustand store — single source of truth
  data/
    factions.js    # Faction + detachment lists
    phases.js      # 10th Edition phase definitions (5 phases)
    missions.js    # Mission card names (primary, secondary, twists, challenger)
    missionImages.js  # name → URL maps for all 4 mission decks
    reminders.js   # Phase reminder text, keyed by faction||detachment
  utils/
    parseRosterJson.js  # Transforms NewRecruit .json export into internal roster shape
  App.jsx
  main.jsx
```

---

## Game Rules Context (10th Edition)

Keep these rules in mind — build them into logic, don't make the user configure them.

### Command Points
- Each player starts with 0 CP
- Each player gains +1 CP at the start of **both** Command Phases each turn
- CP minimum is 0 — cannot go negative
- CP is spent on Stratagems (tracked, not enforced)

### Victory Points
- Primary VP: scored at the end of each player's Command Phase
- Secondary VP: scored per mission rules, entered manually
- Max 5 Battle Rounds

### Battle Round Structure
Each round has two Player Turns (Player 1 then Player 2), each with 5 phases:
1. **Command Phase** — Gain CP, score Primary, Battle-shock tests
2. **Movement Phase**
3. **Shooting Phase**
4. **Charge Phase**
5. **Fight Phase**

### Objectives
- 5 objectives on a symmetrical grid
- Each cycles: Unclaimed → Player 1 → Player 2 → Unclaimed

### Challenger Cards
- Triggers when a player is 6+ VP behind at battle round start
- Player draws one card, chooses either the Stratagem (free) or Mission — not both
- Card discarded at end of turn; max 12VP from Challenger cards total

---

## UI & UX Requirements

- **Target device**: Samsung Galaxy Tab S8 — 1280×800px landscape
- **Touch first**: all interactive elements minimum 48×48px tap targets
- **No horizontal scrolling** — everything fits within the viewport
- **High contrast**: readable at arm's length
- **Theme**: "Tactical Readout" — off-white/paper base, cold blue accent, Barlow Condensed + DM Sans; tokens in `tailwind.config.js`
- **Accent colours are role-based**: Attacker = red, Defender = green
- No decorative Warhammer imagery — keep it functional
- Tab-based layout: Tracker · Phases · Factions, one tap from anywhere
- **Touch event handling**: All interactions are discrete taps. Two patterns are used depending on scroll-interference risk:
  - **Standard buttons** (no scroll risk — e.g. CP, VP, phase, close buttons): `onPointerDown={(e) => { e.preventDefault(); handler(); }}`. Suppresses the synthetic click, preventing double-fires on tablet.
  - **Tappable elements that compete with scroll** (e.g. card thumbnails, keyword/ability chips): use the split pattern — `onPointerDown` captures element rect for animation, `onClick` opens the popup. `onClick` only fires when the finger lifts near where it pressed, providing drag-tolerance. Backdrop dismissal uses `onClick` to match.
  - **Buttons that open modals/overlays**: use `onClick` only — NOT `onPointerDown`. The modal mounts while the finger is still down; the subsequent `click` event then lands inside the newly-opened overlay, triggering an unintended selection (tap-through). `onClick` fires on lift, before the modal exists. Double-fire is not a risk because the trigger button is immediately obscured by the modal. Examples: faction picker trigger, detachment picker trigger, mission/twist picker triggers.
  - **Buttons that cause immediate layout shifts** (e.g. re-sorting a list, filtering, moving an item): use `onClick` only — same tap-through mechanism as modals. If the action fires on `pointerDown`, the layout shifts before the finger lifts and the `click` lands on whatever element is now at those coordinates. `onClick` fires on lift first; React batches the state update and applies the layout change after the handler returns. Example: "Mark as Destroyed / Mark as Active" toggle in UnitAccordion.
  - **Buttons inside a clickable container**: add `e.stopPropagation()` to prevent bubbling to the parent.
  - **Exceptions — leave as `onClick`, do not modify**: file input triggers and `<a>` tags. These rely on browser-native behaviour tied to the click event.
---

## What NOT to Do

- No authentication — app is personal/local-first. Cloudflare KV is the only backend, used exclusively for roster sync across devices.
- Do not enforce game rules strictly — track and remind, never block
- Do not auto-install npm packages without explaining the tradeoff
- Do not create deeply nested component trees
- Do not use `px` for font sizes — use `rem`

---

## Key Implementation Notes

These capture decisions and deviations from original spec — read before touching any of these areas.

#### Misc
- **Space Marine chapters** (Black Templars, Blood Angels, etc.) are hidden from faction picker via `HIDDEN_FACTIONS` in `SetupScreen.jsx`; data retained in `factions.js`

#### Game Flow
- **Begin Battle** requires Attacker/Defender and First Turn roll-offs to be set
- **Secondary deck** is shuffled on `startGame()` in the store
- **Player layout**: left panel = player who goes first (set by roll-off); right = second; applies across all three tabs
- **`firstPlayer`** stored in Zustand (type: `1 | 2`); captured from `activePlayer` inside `beginBattle()`; `advancePhase` uses `activePlayer === firstPlayer` to detect end of first player's turn
- **Accent colours** are role-based (not player-number): applied via `ROLE_ACCENT` in `TrackerTab`, `PhasesTab`, `FactionsTab`; VP name labels in `ObjectivesSidebar` also use role colours
- **`PlayerTrackerPanel`** accepts `isAttacker` boolean prop for accent colour
- **`GameScreen`** derives `attackerNum`, `defenderNum`, `firstPlayerNum`, `secondPlayerNum` and passes as props to all tabs

#### Command Points & Victory Points
- **`vp.byRound`** is an array of `{ primary, sec1, sec2 }` objects; `vp.total/primary/secondary` always recomputed from scratch in `adjustVP`
- **`adjustVP(player, round, column, delta)`** is the single VP mutation; **`adjustCP(player, delta)`** for CP — both log and snapshot automatically
- **Auto +1 CP** fires inside `advancePhase` (store) when landing on phase 0; grants +1 to both players at each Command Phase transition
- **VP table column headers** are conditional: active/expanded shows full names; inactive shows abbreviated

#### Touch Events
- **CP and VP buttons** use `onPointerDown` + `e.preventDefault()` to prevent browser double-fire

#### Timers
- **Per-player timers** are timestamp-based: `timers.p1/p2` hold banked elapsed seconds; `timerStartedAt` is a `Date.now()` anchor set on resume, cleared on pause; displayed time = `banked + (Date.now() - timerStartedAt) / 1000`; `setInterval` in Header only triggers re-renders, never mutates store
- **Timer initial state**: `timerPaused: true` — timers don't start until user resumes; `toggleTimerPause()` banks elapsed and clears/sets anchor
- **`advancePhase`**: same-player phases re-anchor; player-switch transitions bank outgoing player's timer then set new anchor
- **localStorage persistence**: `history`, `timerPaused`, and `timerStartedAt` excluded from persistence; `timerPaused` forced to `true` and `timerStartedAt` to `null` on rehydration via `onRehydrateStorage`
- **Game over**: `gameOver: true` set in store when advancing past Round 5 second-player Fight Phase; blocks `advancePhase`; Next Phase button labelled "Game Over" and disabled; inline banner beneath header
- **Log timestamps** use combined elapsed (`timers.p1 + timers.p2 + live`) as total game time

#### Header & Layout
- **Header layout**: left (`shrink-0`): Round X/5 · Phase Name · Next Phase · Pause; center (`flex-1 justify-center`): P1 timer · P1 name · P1 stat block · vs · P2 stat block · P2 name · P2 timer; right (`shrink-0`): Undo · Log · Setup
- **Header stat block** (`Header.jsx`, center section): `flex-col` with CP on top and VP below, separated by `<hr className="border-border-subtle">`; values are `text-base font-semibold tabular-nums`; suffix labels ("cp", "vp") are `text-[10px] font-normal text-text-secondary` inline after the number
- **Pause button**: single button freezes/resumes both timers; green when paused (▶), gray when running (⏸)

#### Misc
- **Secondary cards**: `hand: { p1: [null, null], p2: [null, null] }` top-level store state; `drawCard` / `discardCard` both snapshot for undo; UI lives in `TrackerTab.jsx` as `SecondaryCardSlot` and `DrawModal`
- **Card lightbox** (mission sidebar + secondary cards): `getBoundingClientRect()` on click, compute dx/dy to viewport centre, inject into `@keyframes` via `<style>` tag, spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`; tap backdrop to close
- **DrawModal** does NOT close on backdrop tap — user must tap cancel or select a card
- **`onClick` / animation origin**: `getBoundingClientRect()` must be captured in `onPointerDown` and stored in a `useRef` (not state) to avoid stale values
- **Tracker tab expand/collapse** is local `useState` in `TrackerTab`; resets on turn advance via `useEffect`; nothing written to store

#### Phase & Reminders
- **Reminders lookup**: keys are `faction||detachment` exact strings from `factions.js`; no string normalisation
- **`reminders.js`** structure: `general_reminders` (all armies), `faction_reminders` (per faction), `detachment_reminders` (per detachment); `PhaseReminders` component colocated in `TrackerTab.jsx`; returns null when no reminders match

#### Misc
- **Inactive sliver −1 CP button** (`TrackerTab.jsx`, inside `isCollapsedInactive || isShrunk` branch): uses `onPointerDown` + `e.stopPropagation()` to spend CP without triggering panel expand; `w-12 h-12` (48px) tap target; `disabled` at CP 0 for visual feedback; inserted between stats badge and `MiniVPTable`

#### Roster Import
- **Roster import**: Players import army lists as .json files exported directly from NewRecruit. Parsed client-side by `src/utils/parseRosterJson.js`. Synced to Cloudflare KV (source of truth) via `POST /api/rosters`; localStorage (`wh40k-imported-rosters`) retained as offline fallback. Army tab fetches from `GET /api/rosters` on mount and merges with localStorage. Player selections persisted under `wh40k-army-selection` as `{ p1: label | null, p2: label | null }`. Re-importing a file with the same label replaces the existing entry. No committed roster files exist in the codebase.

#### Dead Units
- Dead unit state stored in localStorage under `wh40k-dead-units`
- Shape: `{ [rosterLabel]: number[] }` on disk; loaded as `Set<number>` on mount
- Managed in `ArmyPanel.jsx` as local `useState`; not in Zustand store
- Dead units render with `opacity-50` on collapsed row; toggle button in expanded section
- Unit list sorted in `ArmyPanel.jsx`: alive units first (original order), dead units last
- `aliveTotal` pts excludes dead units; shown in panel header as `{aliveTotal}/{grandTotal} pts`
- Dead toggle button uses `onClick` (not `onPointerDown`) — the list re-sorts on state update, which would cause tap-through if the action fired on press; `onClick` fires on lift before React applies the re-render; also calls `setOpen(false)` to auto-collapse the accordion

---

## Build History

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Game Setup Screen | ✅ Done |
| 1.5 | Pre-Battle Setup Screen | ✅ Done |
| 2 | Core Layout Shell | ✅ Done |
| 2.5 | Main Content Area Layout | ✅ Done |
| 3 | CP & VP Tracker | ✅ Done |
| 4 | Battle Round Counter + Active Player | ✅ Done |
| 5 | Phase Checklist | ✅ Done |
| 6 | Secondary Mission Tracker | ✅ Done |
| 7 | Round Timer | ✅ Done |
| 8 | Faction Reminder Panel | ✅ Done |
| 9 | Polish Pass | ✅ Done |
| v1.3 | Phase Reminders (faction/detachment, per phase) | ✅ Done |
| v1.4 | Timer persistence fix (timestamp-based) | ✅ Done |
| v1.5 | End-of-game modal, CP/VP legibility, reminders reorder, inactive −1 CP | ✅ Done |
| v1.6 | Army list reference tab (UnitAccordion, weapon tables, abilities) | ✅ Done |
| v1.7 | .json roster import (NewRecruit, client-side parse, localStorage) | ✅ Done |
| v1.7.2 | Leader Attachment — character detection, bodyguard linking, attachment UI | ✅ Done |
| v1.7.3 | Leader Attachment bug fixes — bodyguard fuzzy matching | ✅ Done |
| v1.8.1 | Cloudflare migration + KV roster sync | ✅ Done |
| v1.8.2 | Mobile layout (responsive Army tab, portrait, player toggle) | ✅ Done |
| v1.8.3 | Mobile layout — Tracker, Factions, Setup screen fixes | ✅ Done |
| v1.8.3.3 | Unit rules in Abilities / Rules section (UnitAccordion + parser) | ✅ Done |
| v1.8.3.4 | Log button tap-through fix + model count in UnitAccordion header | ✅ Done |
| v1.8.4 | UnitAccordion: stacked header layout, pts per unit + army total, dead unit marker | ✅ Done |

**Cross-cutting features shipped:** undo (20-snapshot stack), action log, mission card images + lightbox, localStorage persistence, secondary card draw/discard/lightbox.

**Deferred to v2:** custom ability editing, match history export, Asymmetric War mode, Challenger card tracker.

---

## Current Progress

**Last updated:** 24/04/2026

**Status:** v1.8.4 shipped. UnitAccordion header reworked to stacked layout (name/s then pts) for both standalone and merged leader+bodyguard units — count moved to bodyguard line, leader on top. Parser updated to sum pts recursively (includes enhancements). Dead unit toggle added (localStorage `wh40k-dead-units`): dims unit row, pushes to bottom of list; alive/total pts summary shown in ArmyPanel header.

**Touch event audit completed 23/03/2026** — full codebase sweep; all `onClick` violations on buttons and tappable elements converted to `onPointerDown` + `e.preventDefault()`. Subsequently updated (scroll-swipe fix): card thumbnails and ability/keyword chips now use the split pattern (`onPointerDown` captures rect, `onClick` opens popup); their backdrop dismissals use `onClick` to match. This applies to: `AbilityPopup` backdrop (`UnitAccordion.jsx`), primary mission lightbox backdrop (`ObjectivesSidebar.jsx`), twist lightbox backdrop (`ObjectivesSidebar.jsx`).

---

### v1.6 — Army List Reference Tab

New 4th "Army" tab (`ArmyTab.jsx`, `ArmyPanel.jsx`, `UnitAccordion.jsx`) displaying both players' parsed army lists side-by-side. Attacker left / defender right; role accent colours via `ROLE_ACCENT` (same pattern as other tabs). Receives `attackerNum`/`defenderNum` props from `GameScreen`.

#### UnitAccordion

**Collapsed** — single row, min 48px tap target:
```
▶  Cadre Fireblade          6"  T3  4+  W3  7+  OC1
```

- Unit name left-aligned, stat pills right-aligned
- Invuln shown in brackets next to SV when present, e.g. `4+ (5++)`
- T value gets a subtle role-coloured highlight (key value when opponent is shooting at this unit)

**Expanded** — two sub-tables beneath the stat line:

| Ranged Weapons | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|

| Melee Weapons | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|

- S value highlighted (key value when this unit is shooting)
- Table omitted entirely if unit has no weapons of that type
- Keywords truncate with ellipsis on overflow

"No army list loaded" placeholder shown when data absent. Unit lists scroll independently.

#### Deferred to v2/v3

- Wound roll matrix (S vs T pre-computed)
- Filtering by phase (e.g. show only melee weapons in Fight Phase)

---

### v1.7 — NewRecruit .json Roster Import

Replaced committed roster files with client-side JSON import. Players export a `.json` from NewRecruit and load it in the Army tab. Rosters persist to localStorage; no roster files are committed to the codebase.

#### Parser — `src/utils/parseRosterJson.js`

Pure transform function: `parseRosterJson(json)` → internal roster shape. No React, no I/O.

**Input shape handled:** NewRecruit JSON (array-style `forces`/`selections`/`profiles` arrays, `$text` on characteristics). Also handles the older xml2js wrapped style (`{ force: [...] }`, `{ selection: [...] }`) for robustness.

**Extraction logic:**
- `roster.name` → `label`
- `force.catalogueName` → `faction` (strips `"Xenos - "`, `"Imperium - "` etc. prefixes)
- Top-level selection `name === "Detachment"` → first child name → `detachment`
- Top-level selections `type === "model" || type === "unit"` → `units`
- Unit stats from `profiles` entry with `typeName === "Unit"`, characteristics by name, `$text` values; T/W/OC coerced to int
- Invuln: `Abilities` profile whose `name` matches `/^\d+\+\+$/`
- Ranged/melee weapons: recursive walk of `selections`, collect profiles by `typeName`, de-dupe by name, sum `count` across duplicates
- Abilities: all `Abilities` profiles (recursive), deduped, excluding invuln saves; `Description` characteristic stored → `unit.abilities[]`
- Unit rules: `selection.rules[]` (e.g. "Deadly Demise D3", "For The Greater Good"), deduped by name → `unit.unitRules[]`; distinct from the global `rules` keyword dict
- Keywords: unit's own `categories`, names sorted alphabetically
- Unit composition (see below)
- Points: recursive sum of `costs` (name === "pts") across the unit selection and all descendant child selections → `unit.pts` (integer, default 0); includes enhancement upgrades

**Multi-model unit fix:** units like Breacher Team have no Unit profile at the top level — it lives inside `type="model"` child selections. Parser falls back to `collectProfiles(sel, 'Unit')[0]` when not found at top level.

**`composition` field:** array of `{ name, count, equipment: string[] }` per model type.
- Multi-model units (`type="unit"`): iterate `type="model"` children
- Single-model units (`type="model"` at top level): unit selection itself is the single model entry
- Equipment per model: direct child upgrade selections; per-model count = `Math.round(upgrade.number / model.number)`; sub-weapons one level deep shown in parens: `"Gun Drone (Twin pulse carbine)"`; count > 1 prefixed: `"3x Plasma rifle"`
- Returns `null` only if no equipment found (omits section in UI)

---

#### Army tab changes

**`ArmyTab.jsx`:**
- `wh40k-imported-rosters` localStorage key — array of full roster objects `{ label, faction, detachment, units }`
- `wh40k-army-selection` localStorage key — `{ p1: label | null, p2: label | null }`
- `RosterControls` component per player: hidden `<input type="file" accept=".json">` triggered via `useRef`; reads file with `FileReader`, parses JSON, calls `parseRosterJson`; on success auto-selects the imported roster; inline error on failure
- Dropdown alongside Import button: lists all imported rosters by label; hidden when no rosters imported yet; both panels share the same pool, independent selections
- Re-importing a file with the same `label` replaces the existing entry

**`ArmyPanel.jsx`:**
- `faction` and `detachment` read from roster object directly (not Zustand store)
- Falls back to store detachment if roster field absent

**`UnitAccordion.jsx`:**
- `CompositionAccordion` sub-component: nested accordion (collapsed by default) rendered after Keywords
- Shows each model type as `Nx ModelName: equip1, 2x equip2, Parent (sub-weapon), ...`
- Only rendered when `unit.composition` is non-null and non-empty
- "Abilities / Rules" section merges `unit.abilities` and `unit.unitRules` into `combinedAbilities`; rule entries flagged `_isRule: true` render with teal chip styling; leader-merged unit rules flagged `_isRule: true, _isLeader: true` use dimmed amber; same `AbilityPopup` handles all

---

#### Deleted
- `scripts/parseRoster.mjs`
- `src/data/armyLists.js` (replaced by localStorage import)
- `src/data/rosters/` (all `.js` roster files + `index.js`)

---

### v1.7.2 — Leader Attachment

Allows players to mark a Character unit as attached to a bodyguard unit in the Army tab. Attachment state is display-only — it does not enforce rules, only reflects the player's chosen pairing.

#### Character detection

- A unit is a **leader** if it has the `[Character]` keyword AND at least one ability with `typeName === "Abilities"` whose `name === "Leader"`
- The `Leader` ability description encodes valid bodyguard unit names between `^^` markers, e.g. `^^Strike Team^^` or `^^Strike Team^^Breacher Team^^`
- `parseRosterJson.js` extracts these into `unit.leaderOf: string[]` — an array of valid bodyguard unit names (may be empty if no `^^` markers found)
- Units with no `[Character]` keyword are never leaders regardless of abilities

#### Bodyguard matching

- Matching is fuzzy: a leader's `leaderOf` entry matches a unit if the roster unit name **contains** the bodyguard string (case-insensitive)
- This handles names like `"Veteran Intercessors"` matching `"Intercessors"` in the leader description
- v1.7.3 introduced this fuzzy matching to fix cases where exact string match failed

#### Attachment state

- Stored in localStorage under `wh40k-leader-attachments`
- Shape: `{ [rosterLabel]: { [leaderUnitIndex]: bodyguardUnitIndex | null } }` — array indices are used as stable unit identifiers within a roster
- Managed in `ArmyTab.jsx`
- Attachment is per-roster (keyed by roster label) and per-player (each player has their own roster)

#### UI

- Attachment controls live inside `UnitAccordion.jsx` for leader units only
- Leaders show a dropdown listing valid bodyguard units (derived from `leaderOf` fuzzy matches against the roster)
- When a leader is attached: the leader accordion and bodyguard accordion are visually merged — rendered as a combined unit entry
- Duplicate unit names in a roster display as "Unit 1" / "Unit 2" to disambiguate
- Accent colour for all leader-related UI elements: amber (`amber-400` / `amber-500`)
- Unattached leaders and the attachment control use `amber-400`; merged/attached state uses `amber-500`

---

### v1.8.1 — Cloudflare Migration + KV Roster Sync

#### Goals
- Move hosting from GitHub Pages to Cloudflare Pages
- Add a colocated Pages Function for roster read/write
- Roster import auto-pushes to KV; Army tab reads from KV on load
- Remove old GitHub Pages base path from vite.config.js

#### Architecture
- `functions/api/rosters.js` — Cloudflare Pages Function, handles GET and POST ✅ Done
- KV namespace: `40K_ROSTERS`, bound as `ROSTERS` in the Cloudflare Pages dashboard
- KV key: `"all_rosters"` — single JSON array of all roster objects
- Roster upsert logic: replace existing entry with matching `label`, otherwise append

#### API contract
- `GET /api/rosters` — returns `{ rosters: [...] }` (array of `{ label, faction, detachment, units }`)
- `POST /api/rosters` — body: `{ roster: { label, faction, detachment, units } }` — upserts by label, returns `{ ok: true }`

#### Client-side changes (ArmyTab.jsx) ✅ Done
- On mount: fetch `GET /api/rosters`, merge with localStorage (KV is source of truth; localStorage retained as offline fallback)
- After successful local import: POST the new roster to `/api/rosters`
- If KV fetch fails: fall back silently to localStorage and show a subtle "offline" indicator
- `syncing` state disables import button and shows "Syncing…" while mount fetch is in progress
- `offline` badge (`● offline`) shown in controls area when KV fetch fails
- `syncError` message shown inline when POST fails; clears on next successful POST

#### vite.config.js ✅ Done
- Remove the `base` config option entirely — Cloudflare Pages serves from root `/`

#### Key constraints
- No authentication — KV is effectively public to anyone with the URL; acceptable for a personal app
- Do not remove localStorage persistence — it remains the offline fallback
- Pages Function must set CORS headers: `Access-Control-Allow-Origin: *`

---

### v1.8.2 — Mobile Layout + Device Mode Modal

#### Device Mode Modal
- `wh40k-device-mode` localStorage key stores `'army'` or `'game'`; absent on first load
- `DeviceModeModal` component lives in `App.jsx`; shown as `fixed inset-0 z-50` overlay when key is absent or when mode switcher is tapped
- Two choices: **Army List** ("View army rosters and phase reminders") and **Game Setup** ("Run a full game with CP/VP tracking")
- No close/skip — a choice must be made; selecting saves to localStorage and dismisses
- Re-tapping the mode switcher re-shows the modal without clearing game state

#### Mode behaviour
- `'army'` mode: `App.jsx` renders `<GameScreen initialTab="army">` regardless of `gameStarted`/`battleBegun`, bypassing SetupScreen and PreBattleScreen
- `'game'` mode: normal app flow unchanged

#### Mode switcher in tab bar
- `SlidersHorizontal` (Lucide) icon button added to far right of `TabBar.jsx` (`w-14 shrink-0`)
- `TabBar` accepts `onShowModeModal` prop (threaded via `GameScreen` from `App.jsx`)
- `GameScreen` accepts `initialTab` and `onShowModeModal` props; passes latter to TabBar
- Visible on all screen sizes

#### Army tab mobile layout (≤768px, Tailwind `md:` breakpoint)
- `ArmyTab.jsx` returns a single `div.h-full` wrapper containing two layout branches:
  - `hidden md:flex` — existing two-column desktop layout, unchanged
  - `flex flex-col md:hidden` — new single-column mobile layout
- Mobile layout: player toggle bar (`shrink-0 h-12`) at top, one `ArmyPanel` below filling remaining height
- Player toggle: two `flex-1 h-12` buttons: `P1 · [army name]` and `P2 · [army name]`; active uses role accent (`text-danger` / `text-success`) with `border-b-2`; inactive is `text-chrome`
- Army name resolution: roster label if loaded → faction from store → player name
- `mobileActivePlayer` state (`'attacker'` | `'defender'`) controls which panel renders; defaults to `'attacker'`
- `ArmyPanel` rendered with `isLeft={false}` on mobile (no right border on full-width panel)
- `attackerFaction` and `defenderFaction` read from Zustand store for army name fallback
- Roster import controls (via `importButton` prop) remain inside `ArmyPanel` header — available on mobile per-panel
- `RosterControls` and KV sync behaviour unchanged from v1.8.1

---

### v1.8.3 — Mobile Layout: Tracker, Factions, Setup Screen

#### TrackerTab mobile layout (≤768px)
- Desktop two-panel layout wrapped in `hidden md:flex` — unchanged
- `flex flex-col md:hidden` mobile branch added below
- Player toggle bar (`shrink-0 h-12`) at top; two `flex-1 h-12` buttons labelled `P{num} · {name}`
- Active button uses role accent (`text-danger` / `text-success`) with `border-b-2 border-current`; inactive is `text-chrome`
- `mobileActivePlayer` state (`'first'` | `'second'`) initialised from store's `activePlayer`; synced via `useEffect` on `activePlayer` change (follows turn advances automatically); also manually toggleable
- Both `PlayerTrackerPanel` components always mounted; CSS (`h-full` / `hidden`) controls visibility — no state loss on toggle
- Mobile panels receive `isActive={true}`, `isExpanded={false}`, `isShrunk={false}` — always render full view; sliver/collapsed behaviour is desktop-only

#### FactionsTab mobile layout (≤768px)
- Same pattern as TrackerTab
- Desktop layout wrapped in `hidden md:flex`
- Mobile branch: toggle bar + single `FactionColumn` panel
- Toggle labels: `P{num} · {faction ?? playerName}`
- `mobileActivePlayer` state (`'first'` | `'second'`) defaults to `'first'`; manually toggleable (no auto-follow — factions don't change during play)
- Both `FactionColumn` components always mounted; `isLeft={false}` on mobile (no right border)
- Added `useState` import to `FactionsTab.jsx`

#### DeviceModeModal (App.jsx)
- Added `min-h-[48px]` to both choice buttons — ensures 48px tap target on portrait mobile
- Existing `mx-4 max-w-sm` already handles correct sizing on ~390px screens
- Mode labels updated: `'army'` → **"Army Tracker"** / `'game'` → **"Battle Tracker"**
- Descriptions updated; switched from `text-xs text-text-secondary` to `text-sm text-chrome`
- Button padding changed to `py-3 px-4` (height grows to fit content)

#### SetupScreen (SetupScreen.jsx)
- Player columns changed from `flex` to `flex flex-col md:flex-row` — stacks vertically on mobile portrait, side-by-side on ≥768px
- Existing `p-4` outer padding and `flex-wrap` on mission fields already adequate for mobile
- Accepts `onShowModeModal` prop; renders `SlidersHorizontal` icon button (`absolute top-4 right-4`, `w-10 h-10 rounded-full`) when prop is provided
- Outer wrapper has `relative` for absolute positioning
- `App.jsx` passes `openModeModal` to `<SetupScreen>` (same callback already used by GameScreen/TabBar)