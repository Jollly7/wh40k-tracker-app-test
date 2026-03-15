# CLAUDE.md — Warhammer 40k Battle Round Tracker

## Project Overview
A **Progressive Web App (PWA)** built for personal use on a Samsung tablet.
It tracks a 1v1 Warhammer 40k 10th Edition game in real time: Command Points,
Victory Points, Objectives, turn phases, and faction reminders.

No server, no login, no app store. Runs entirely in the browser, works offline.

---

## Stack Decisions

| Concern | Choice | Reason |
|---|---|---|
| Framework | **React + Vite** | Fast dev loop, great PWA support, wide ecosystem |
| Styling | **Tailwind CSS** | Utility-first, easy to tune for dense tablet layouts |
| State | **Zustand** | Lightweight, minimal boilerplate for game state |
| Persistence | **localStorage** (v2) | Not required for v1 — keep state in memory first |
| PWA | **vite-plugin-pwa** | Handles service worker + manifest automatically |
| Icons/UI | **Lucide React** | Clean, minimal icon set — no bloat |

> Do not introduce additional libraries without explaining why they're needed
> and getting confirmation. Keep the dependency tree lean.

---

## How to Operate (Important)

- **Always explain your reasoning** before writing code. Describe *what* you're
  about to do and *why*, especially for architectural or structural decisions.
- **Ask before making big structural changes** (e.g. changing state shape,
  adding a new library, splitting/merging components).
- **Think in iterations**: build the smallest working version first, then layer
  in complexity. Don't scaffold everything at once.
- When you're uncertain between two approaches, **name both options briefly**
  and recommend one with a reason.

---

## App Structure

```
src/
  components/
    layout/        # App shell, header, tab navigation
    cp/            # Command Point tracker (both players)
    vp/            # Victory Point tracker + scoring breakdown
    objectives/    # Objective map/grid
    phases/        # Turn phase checklist + reminders
    timer/         # Round timer
    factions/      # Faction/army-specific reminder panels
  store/
    gameStore.js   # Zustand store — single source of truth for game state
  data/
    factions.js    # Faction list + their specific reminders
    phases.js      # 10th Edition turn phase definitions
  App.jsx
  main.jsx
```

---

## Game Rules Context (10th Edition)

Build these rules directly into the app logic — do not make the user configure them:

### Command Points (CP)
- Each player **starts with 0 CP** at game start
- Each player **gains +1 CP at the start of both Command Phases** each turn
- CP are spent on Stratagems (tracked as spend events, not enforced)
- CP minimum is 0 — cannot go negative

### Victory Points (VP)
- Players score VP primarily through **Primary Objectives** and **Secondary Objectives**
- Primary Objectives: scored at the **end of each player's Command Phase**
- Secondary Objectives: scored per mission rules (player inputs score manually)
- Track VP per player with a running total and a per-round breakdown table
- Maximum game length: **5 Battle Rounds**

### Battle Round Structure
Each Battle Round has two Player Turns (Player 1 then Player 2).
Each Player Turn has these phases in order:
1. **Command Phase** — Gain CP, score Primary Objectives, use Command phase abilities, Battle-shock tests.
2. **Movement Phase** — Move units
3. **Shooting Phase** — Shoot ranged weapons
4. **Charge Phase** — Declare and resolve charges
5. **Fight Phase** — Fight in melee

The app should display the current phase and allow the player to advance through
them with a single tap. Show a reminder for what happens in each phase.

### Objectives
- Standard layout: **5 objectives** on a roughly symmetrical grid (can be
  represented as a simple 2-row layout: 2 on one side, 1 centre, 2 on the other)
- Each objective can be: **Unclaimed / Player 1 / Player 2**
- Tapping an objective cycles through ownership states

---

## UI & UX Requirements

- **Target device**: Samsung Galaxy Tab — assume ~1280×800px landscape viewport
- **Touch first**: all interactive elements must be at minimum **48×48px** tap targets
- **Dense but readable**: pack information efficiently — avoid wasted whitespace,
  but never sacrifice legibility for density
- **No horizontal scrolling** — everything fits within the viewport
- **High contrast**: text must be clearly readable at arm's length on a tablet screen
- **Theme**: Clean and minimal — dark background preferred (easier on eyes mid-game),
  neutral grays and whites, with **one accent color per player** (e.g. blue/red)
  to distinguish Player 1 vs Player 2 at a glance
- Do **not** add decorative Warhammer imagery or grimdark theming — keep it functional

### Layout Approach
Use a **tab-based or panel-based layout** so the user can quickly switch between:
- Main tracker (CP + VP side by side)
- Objectives map
- Phase checklist
- Faction reminders

All tabs should be reachable with **one tap** from anywhere in the app.

---

## Faction Reminders

- At **game setup**, each player selects their faction and detachment from the lists below
- The app surfaces **key reminders** for that faction during relevant phases
- Store faction reminders in `data/factions.js` using the structure below

---

## Full Faction & Detachment Data

Source for all of the below can be rechecked if needed:
http://wahapedia.ru/wh40k10ed/factions/adepta-sororitas/
http://wahapedia.ru/wh40k10ed/factions/adeptus-custodes/
http://wahapedia.ru/wh40k10ed/factions/adeptus-mechanicus/
http://wahapedia.ru/wh40k10ed/factions/adeptus-titanicus/
http://wahapedia.ru/wh40k10ed/factions/astra-militarum/
http://wahapedia.ru/wh40k10ed/factions/grey-knights/
http://wahapedia.ru/wh40k10ed/factions/imperial-agents/
http://wahapedia.ru/wh40k10ed/factions/imperial-knights/
http://wahapedia.ru/wh40k10ed/factions/space-marines/
http://wahapedia.ru/wh40k10ed/factions/aeldari/
http://wahapedia.ru/wh40k10ed/factions/drukhari/
http://wahapedia.ru/wh40k10ed/factions/genestealer-cults/
http://wahapedia.ru/wh40k10ed/factions/leagues-of-votann/
http://wahapedia.ru/wh40k10ed/factions/necrons/
http://wahapedia.ru/wh40k10ed/factions/orks/
http://wahapedia.ru/wh40k10ed/factions/t-au-empire/
http://wahapedia.ru/wh40k10ed/factions/tyranids/
http://wahapedia.ru/wh40k10ed/factions/chaos-daemons/
http://wahapedia.ru/wh40k10ed/factions/chaos-knights/
http://wahapedia.ru/wh40k10ed/factions/chaos-space-marines/
http://wahapedia.ru/wh40k10ed/factions/death-guard/
http://wahapedia.ru/wh40k10ed/factions/emperor-s-children/
http://wahapedia.ru/wh40k10ed/factions/thousand-sons/
http://wahapedia.ru/wh40k10ed/factions/world-eaters/

Use this as the source of truth for `data/factions.js`:

```js
export const FACTIONS = {
  "Adepta Sororitas":    ["Hallowed Martyrs", "Penitent Host", "Bringers of Flame", "Army of Faith", "Champions of Faith"],
  "Adeptus Custodes":    ["Talons of the Emperor", "Shield Host", "Null Maiden Vigil", "Auric Champions", "Solar Spearhead", "Lions of the Emperor"],
  "Adeptus Mechanicus":  ["Rad-Zone Corps", "Skitarii Hunter Cohort", "Data-Psalm Conclave", "Explorator Maniple", "Cohort Cybernetica", "Haloscreed Battle Clade"],
  "Aeldari":             ["Warhost", "Windrider Host", "Spirit Conclave", "Guardian Battlehost", "Ghosts of the Webway", "Devoted of Ynnead", "Seer Council", "Aspect Host", "Armoured Warhost", "Serpent's Brood", "Eldritch Raiders", "Corsair Coterie"],
  "Astra Militarum":     ["Combined Arms", "Siege Regiment", "Mechanised Assault", "Hammer of the Emperor", "Recon Element", "Bridgehead Strike", "Grizzled Company"],
  "Black Templars":      ["Companions of Vehemence", "Vindication Task Force", "Godhammer Assault Force", "Wrathful Procession"],
  "Blood Angels":        ["Liberator Assault Group", "The Lost Brethren", "The Angelic Host", "Angelic Inheritors", "Rage-Cursed Onslaught"],
  "Chaos Daemons":       ["Daemonic Incursion", "Shadow Legion", "Legion of Excess", "Scintillating Legion", "Blood Legion", "Plague Legion"],
  "Chaos Knights":       ["Traitoris Lance", "Infernal Lance", "Lords of Dread", "Houndpack Lance", "Iconoclast Fiefdom"],
  "Chaos Space Marines": ["Veterans of the Long War", "Deceptors", "Renegade Raiders", "Dread Talons", "Fellhammer Siege-Host", "Pactbound Zealots", "Chaos Cult", "Soulforged Warpack", "Cabal of Chaos", "Creations of Bile", "Nightmare Hunt", "Huron's Marauders", "Renegade Warband"],
  "Dark Angels":         ["Unforgiven Task Force", "Inner Circle", "Company of Hunters", "Wrath of the Rock", "Lion's Blade Task Force"],
  "Death Guard":         ["Virulent Vectorium", "Mortarion's Hammer", "Champions of Contagion", "Tallyband Summoners", "Shamblerot Vectorium", "Death Lord's Chosen", "Flyblown Host"],
  "Deathwatch":          ["Black Spear Task Force"],
  "Drukhari":            ["Realspace Raiders", "Skysplinter Assault", "Spectacle of Spite", "Covenite Coterie", "Kabalite Cartel", "Reaper's Wager"],
  "Emperor's Children":  ["Mercurial Host", "Peerless Bladesmen", "Rapid Evisceration", "Carnival of Excess", "Coterie of the Conceited", "Slaanesh's Chosen", "Court of the Phoenician"],
  "Genestealer Cults":   ["Host of Ascension", "Xenocreed Congregation", "Biosanctic Broodsurge", "Outlander Claw", "Brood Brother Auxilia", "Final Day"],
  "Grey Knights":        ["Brotherhood Strike", "Hallowed Conclave", "Banishers", "Sanctic Spearhead", "Augurium Task Force", "Warpbane Task Force"],
  "Imperial Agents":     ["Ordo Xenos Alien Hunters", "Ordo Hereticus Purgation Force", "Ordo Malleus Daemon Hunters", "Imperialis Fleet", "Veiled Blade Elimination Force"],
  "Imperial Fists":      ["Emperor's Shield"],
  "Imperial Knights":    ["Valour Strike Lance", "Gate Warden Lance", "Questoris Companions", "Spearhead-at-Arms", "Questor Forgepact"],
  "Iron Hands":          ["Hammer of Avernii"],
  "Leagues of Votann":   ["Needgaârd Oathband", "Persecution Prospect", "Dêlve Assault Shift", "Brandfast Oathband", "Hearthfyre Arsenal", "Hearthband", "Mercenary Oathband"],
  "Necrons":             ["Awakened Dynasty", "Annihilation Legion", "Canoptek Court", "Obeisance Phalanx", "Hypercrypt Legion", "Starshatter Arsenal", "Cryptek Conclave", "Cursed Legion", "Pantheon of Woe"],
  "Orks":                ["War Horde", "Da Big Hunt", "Kult of Speed", "Dread Mob", "Green Tide", "Bully Boyz", "Taktikal Brigade", "More Dakka!", "Freebooter Krew"],
  "Raven Guard":         ["Shadowmark Talon"],
  "Salamanders":         ["Forgefather's Seekers"],
  "Space Marines":       ["Gladius Strike Force", "Anvil Siege Force", "Ironstorm Spearhead", "Firestorm Assault Force", "Stormlance Task Force", "Vanguard Spearhead", "1st Company Task Force", "Librarius Conclave"],
  "Space Wolves":        ["Saga of the Hunt", "Saga of the Bold", "Saga of the Beastslayer", "Champions of Fenris", "Saga of the Great Wolf"],
  "T'au Empire":         ["Kauyon", "Mont'ka", "Retaliation Cadre", "Kroot Hunting Pack", "Auxiliary Cadre", "Experimental Prototype Cadre"],
  "Thousand Sons":       ["Grand Coven", "Changehost of Deceit", "Warpmeld Pact", "Rubricae Phalanx", "Warpforged Cabal", "Hexwarp Thrallband"],
  "Tyranids":            ["Invasion Fleet", "Crusher Stampede", "Unending Swarm", "Assimilation Swarm", "Vanguard Onslaught", "Synaptic Nexus", "Warrior Bioform Onslaught", "Subterranean Assault"],
  "Ultramarines":        ["Blade of Ultramar"],
  "White Scars":         ["Spearpoint Task Force"],
  "World Eaters":        ["Berzerker Warband", "Cult of Blood", "Khorne Daemonkin", "Possessed Slaughterband", "Goretrack Onslaught", "Vessels of Wrath"],
};
```

### Space Marine Factions and Chapters
- 

---

## Mission Data (Chapter Approved 2025-26)

All mission data is from the **Chapter Approved 2025-26 Mission Deck** only.
Store in `data/missions.js`.

### Standard Primary Missions (10 cards)
Used in Incursion and Strike Force games.

```js
export const PRIMARY_MISSIONS = [
  "Burden of Trust",
  "Hidden Supplies",
  "Linchpin",
  "Purge the Foe",
  "Scorched Earth",
  "Supply Drop",
  "Take and Hold",
  "Terraform",
  "The Ritual",
  "Unexploded Ordnance",
];
```

### Asymmetric War Primary Missions (5 cards)
Used only in Asymmetric War games (separate deck — Attacker and Defender have
different objectives). Include as a separate list for the optional Asymmetric War
mode; do not mix with the standard primary deck.

```js
export const ASYMMETRIC_PRIMARY_MISSIONS = [
  "Denied Resources",
  "Establish Control",
  "Hold Out",
  "Syphoned Power",
  "Uneven Ground",
];
```

### Twist Cards (10 cards)
Optional — drawn at game setup to add thematic conditions. Not used in
tournament play. 9 names are fully confirmed; 1 is unconfirmed — mark it as
`"Unknown Twist"` as a placeholder until verified from the physical deck.

```js
export const TWISTS = [
  "Adapt or Die",
  "Bloodlust",
  "High Octane",
  "Lords of War",
  "Martial Pride",
  "Night Fighting",
  "Point Blank",
  "Rapid Escalation",
  "Ruinscape",
  "Unknown Twist", // placeholder — verify from physical deck
];
```

### Challenger Cards (9 cards — shared deck)
The Challenger mechanic triggers when a player is **6+ VP behind** at the start
of a battle round. They draw one card from this shared deck and may choose either
the Stratagem (free, 0CP) or the Mission — not both. The card is discarded at
end of turn whether used or not. Max 12VP from Challenger cards total.

The 9 cards are named by their paired Stratagem + Mission. Stratagem names
confirmed from reviews: Force a Breach, Strategic Retreat, Harboured Power,
Great Haste, Burst of Speed, Pivotal Moment. Mission names confirmed: Over the
Line, Self Preservation, Sow Chaos, Secure Extraction Zone. Remaining card names
are unconfirmed — **verify from the physical deck** before wiring these into the
app.

```js
// Partial — fill in remaining names from physical deck
export const CHALLENGER_CARDS = [
  "Force a Breach",
  "Strategic Retreat",
  "Harboured Power",
  "Great Haste",
  "Burst of Speed",
  "Pivotal Moment",
  // 3 more — verify names from physical deck
];
```

### Secondary Missions (19 cards)
9 of the 19 can also be used as Fixed Missions (marked on the physical cards).

```js
export const SECONDARY_MISSIONS = [
  "A Tempting Target",
  "Area Denial",
  "Assassination",
  "Behind Enemy Lines",
  "Bring It Down",
  "Cleanse",
  "Cull the Horde",
  "Defend Stronghold",
  "Display of Might",
  "Engage on All Fronts",
  "Establish Locus",
  "Extend Battle Lines",
  "Marked for Death",
  "No Prisoners",
  "Overwhelming Force",
  "Recover Assets",
  "Sabotage",
  "Secure No Man's Land",
  "Storm Hostile Objective",
];
```

### Game Setup Flow (Mission Selection)

At game setup, after naming and selecting factions, players should:

1. Choose game type: **Strike Force** (standard) or **Asymmetric War**
2. Select (or randomly draw) a **Primary Mission** from the appropriate deck
3. Optionally select a **Twist** card (casual/narrative play only — not used in tournaments)
4. Choose Secondary Mission mode: **Tactical** (draw 2, replenish) or **Fixed** (pick 2, keep all game)
5. If Fixed: each player picks 2 from the 9 eligible Fixed missions in the secondary deck

The app should support both **manual selection** and a **random draw** button for each deck.

---

## State Shape (Zustand)

```js
{
  round: 1,                  // Current battle round (1–5)
  activePlayer: 1,           // 1 or 2 — whose turn it is
  currentPhase: 0,           // Index into the phases array
  timer: { running: false, elapsed: 0 },

  players: {
    1: {
      name: "Player 1",
      faction: null,
      cp: 0,
      vp: { total: 0, primary: 0, secondary: 0, byRound: [{ primary:0, sec1:0, sec2:0 }, ...×5] },
      customReminders: [],
    },
    2: { /* same shape */ }
  },

  objectives: [
    { id: 1, owner: null },  // null | 1 | 2
    { id: 2, owner: null },
    { id: 3, owner: null },
    { id: 4, owner: null },
    { id: 5, owner: null },
  ]
}
```

---

## What NOT to Do

- Do **not** add a backend, database, or authentication — this is local-only
- Do **not** enforce game rules strictly (e.g. block invalid CP spends) — just
  track and remind, never block
- Do **not** auto-install or suggest new npm packages without explaining the
  tradeoff first
- Do **not** use `any` in TypeScript (if TypeScript is adopted later)
- Do **not** create deeply nested component trees — keep component hierarchy flat
  and easy to follow
- Do **not** use `px` units for font sizes — use `rem` for accessibility

---

## v1 Scope (Build This First)

1. Game setup screen (player names, faction selection)
2. Main tracker: CP controls + VP entry for both players, side by side
3. Objectives grid (5 objectives, tap to cycle ownership)
4. Phase checklist with advance button
5. Battle round counter (1–5) and active player indicator
6. Basic round timer (start/stop/reset)
7. Faction reminder panel per player

**Defer to v2:**
- localStorage persistence (save/resume mid-game)
- Custom army-specific ability editing
- Match history / scoring summary export
- Additional mission types beyond standard layout

---

## Running the App

```bash
npm create vite@latest wh40k-tracker -- --template react
cd wh40k-tracker
npm install
npm install -D tailwindcss postcss autoprefixer
npm install zustand
npm install -D vite-plugin-pwa
npm install lucide-react
npm run dev
```

Open on tablet by navigating to your machine's local IP on port 5173.
Add to home screen via Chrome → "Add to Home Screen" for PWA install.

## Project Plan

### Build Order

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
| 9 | Polish Pass | 🔄 In Progress |

> Update the status emoji as you go: ⬜ Not Started → 🔄 In Progress → ✅ Done
---

### Phase Detail

#### Phase 1 — Game Setup Screen
- [x] Player name inputs (default: "Player 1" / "Player 2")
- [x] Faction selector per player (from `data/factions.js`)
- [x] Detachment selector per player (dependent on faction)
- [x] Primary Mission selector (from `PRIMARY_MISSIONS`)
- [x] Twist card selector (optional, "No Twist" default)
- [x] Secondary mode confirmed as Tactical
- [x] Secondary deck initialised and shuffled into Zustand store on Start Game
- [x] Start Game button — disabled until names, factions, detachments and primary mission are set
- [x] Navigates to Phase 1.5 on confirm

#### Phase 1.5 — Pre-Battle Setup Screen
- [x] Step 1: Attacker/Defender roll-off — tap to assign winner, pick roles, stored in Zustand
- [x] Step 2: Declare Battle Formations — three reminder checkboxes (Leaders, Transports, Reserves)
- [x] Step 3: Deploy Armies — reminder + acknowledgement checkbox
- [x] Step 4: Redeploy — reminder + acknowledgement checkbox
- [x] Step 5: Determine First Turn — roll-off, winner sets `activePlayer` in Zustand store
- [x] Step 6: Pre-battle rules — acknowledgement checkbox (Scouts, Infiltrators, etc.)
- [x] Begin Battle button — enabled only after Attacker/Defender and First Turn roll-offs are set; navigates to main game view

#### Phase 2 — Core Layout Shell
- [x] Persistent header: Round · Phase Name · Timer display
  - *(Player name removed from header — active player clear from left panel accent colour)*
- [x] Main content area: active player left (60%), opponent right (40%), accent colour highlight on active side
  - *(60/40 split instead of 50/50 — updates reactively on player change)*
- [x] Persistent sidebar (right, w-52): Mission card image → Objectives → VP totals, top to bottom
  - *(Mission card: full sidebar width, aspect-[2/3], click to fullscreen lightbox with pop-out animation)*
  - *(Objectives: 56px circular buttons in standard 40k layout — justify-between / center / justify-between)*
- [x] Objectives tap to cycle: Unclaimed (grey) → Player 1 (blue) → Player 2 (red) → Unclaimed
- [x] Bottom tab bar: Tracker · Phases · Factions (Lucide icons, 48px min height)
- [x] All panels show labelled placeholders — no feature content yet
- [x] Store extended: `detachment`, `mission`, `secondaryDecks`, `role`, `preBattleNotes`

#### Cross-cutting Features (implemented alongside Phase 2)
- [x] **Undo** — history stack (max 20 snapshots) in Zustand; `Undo2` button in header; snapshots all in-game state mutations (CP, VP, objectives, phases, round, reminders); timer and setup excluded
- [x] **Action log** — `log[]` in store, `logAction(message)` action; `ScrollText` dropdown in header (outside-click dismissal via backdrop); auto-logs game start and every phase advance
- [x] **Mission card image infrastructure** — `src/data/missionImages.js` (explicit name→URL maps for all 4 decks); `public/missions/{primary,secondary,twists,challenger}/` folders; sidebar card shows image with graceful `onError` fallback to text placeholder; lightbox with spring pop-out animation (`translate(35vw) scale(0.18)` → center, `cubic-bezier(0.34,1.56,0.64,1)`) and `rounded-2xl` card shape

#### Phase 2.5 — Main Content Area Layout *(static, no live wiring)*
- [x] Header reordered: Round · [Next Phase →] · Phase Name · Timer · Undo · Log; all buttons ≥ 48×48px; Next Phase wired to existing `advancePhase` store action
- [x] Tracker tab: left = Attacker, right = Defender (from `role` in store); 60/40 split follows `activePlayer`; tapping inactive panel expands it to 60% (local `useState`); ✕ collapses; `useEffect` resets on turn change
- [x] Tracker tab: CP section with +/− stubs (48×48px) on active + expanded panels; VP total; 5R × 4-col table (Primary / Sec 1 / Sec 2 / Challenge); Challenge column dimmed with lock icon; Secondary Card 1/2 + Challenge Card stubs on active panel only
- [x] Phases tab: current phase name + reminder text (large); 5-step dot progress indicator with connectors; round progress table (5 rounds × Attacker/Defender) with done/active/pending icons computed from store state
- [x] Factions tab: two columns; faction + detachment from store; 5 phase-labelled reminder sections (Battle-shock folded into Command Phase per updated rules); pre-battle notes from store; + Add note stub
- [x] Battle round structure corrected to 5 phases (Battle-shock is a step within Command Phase, not a separate phase) — updated `data/phases.js`, `advancePhase` boundary in store, `PhasesTab`, and `FactionsTab`


#### Phase 3 — CP & VP Tracker *(functional, no polish)*
- [x] CP controls per player: + / − buttons, minimum 0, cannot go negative
- [x] Auto +1 CP on Command Phase (triggered by phase advance, not manual)
- [x] VP total per player with manual entry
- [x] Per-round VP breakdown table (5 rounds)
- [x] Primary VP and Secondary VP tracked separately

#### Phase 4 — Battle Round Counter + Active Player
- [x] Round counter display (1–5) in header
- [x] End Turn advances active player (1 → 2 → next round → 1)
- [x] End of Round 5 triggers end-of-game state
- [ ] Phase index resets to 0 on each new player turn

#### Phase 5 — Phase Checklist *(fully polished)*
- [x] Current phase name displayed prominently
- [x] Phase description / reminder text for each of the 5 phases
- [x] Large "Next Phase" tap target (min 48px)
- [x] Progress indicator showing position in the 5-phase sequence
- [x] Command Phase auto-triggers +1 CP for active player
- [x] High contrast, readable at arm's length

#### Phase 6 — Secondary Mission Tracker *(Tactical mode)*
- [x] Each player shows 2 active cards drawn from their shuffled deck
- [x] Card name displayed with a VP input field
- [x] Scoring a card discards it and auto-draws the next card
- [x] Manual discard awards 1 CP (per rules)
- [x] Remaining deck count shown
- [x] Tracks VP per card, feeds into secondary VP total in store

#### Phase 7 — Round Timer
- [x] Start / Stop / Reset controls
- [x] Displays elapsed time as MM:SS
- [x] Lives in the header (display already stubbed in Phase 2)

#### Phase 8 — Faction Reminder Panel *(fully polished)*
- [x] Per-player panel showing faction + detachment name
- [x] Reminder notes organised by phase
- [x] Pre-battle notes from Phase 1.5 surfaced here
- [x] Editable — user can add/remove notes per faction
- [x] Scannable at a glance: phase headers, clear text, good tap targets

#### Phase 9 — Polish Pass
- [x] Full tablet layout review at 1280×800px landscape
- [x] Touch target audit — all interactive elements minimum 48×48px
- [x] Contrast check — readable at arm's length
- [x] PWA manifest configured (name, icons, theme colour)
- [x] "Add to Home Screen" tested on Samsung Galaxy Tab

---

### Deferred to v2
- Custom army-specific ability editing
- Match history / scoring summary export
- Asymmetric War mission mode
- Challenger card tracker

---

## Current Progress

> Update this section at the end of each session.

**Last updated:** 15/03/2026

**Completed phases:** Phase 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 9 (+ cross-cutting features: undo, action log, mission card images, localStorage persistence)

**v1.4 completed:** Phase 1 (faction/detachment reminders), Phase 2 (timestamp-based timer persistence fix)

**Next up:** v2 prep

**Notes:**
- Space Marine chapters (Black Templars, Blood Angels, Dark Angels, Deathwatch, Imperial Fists, Iron Hands, Raven Guard, Salamanders, Ultramarines, White Scars) are hidden from the faction picker in v1 — only "Space Marines" is shown; chapter data retained in `data/factions.js`, excluded via `HIDDEN_FACTIONS` in `SetupScreen.jsx`
- Begin Battle button requires Attacker/Defender and First Turn roll-offs to be set (not always-tappable as originally specced)
- Secondary deck shuffle happens on `startGame()` in the store
- Player name removed from header (deviation from original Phase 2 spec) — active player shown via left panel accent colour + 90/10 split
- Undo history excludes timer and setup state; snapshots all in-game mutations
- Mission card images: drop files into `public/missions/<deck>/` and update `src/data/missionImages.js` to point to the filename
- Battle round structure is 5 phases — Battle-shock is a step within Command Phase, not a separate phase; all references updated accordingly
- Tracker tab expand/collapse state is local `useState` in `TrackerTab` — nothing written to store; resets automatically on turn advance
- Left panel = player who goes **first** (set by first-turn roll-off), right panel = player who goes **second** — across all three tabs (Tracker, Phases, Factions); independent of attacker/defender role
- `firstPlayer` is stored in the Zustand store (type: 1 | 2); captured from `activePlayer` inside `beginBattle()`; used by `advancePhase` and `GameScreen` to derive `firstPlayerNum`/`secondPlayerNum`
- `advancePhase` uses `activePlayer === firstPlayer` (not hardcoded `=== 1`) to detect end of first player's turn — fixes bug where defender going first skipped player 1's turn in round 1
- Accent colours are **role-based** (not player-number-based): Attacker = red (`text-red-400` / `border-red-500`), Defender = green (`text-green-400` / `border-green-500`); applied via `ROLE_ACCENT` in `TrackerTab`, and equivalently in `PhasesTab` and `FactionsTab`; VP name labels in `ObjectivesSidebar` also use role colours
- `PlayerTrackerPanel` accepts `isAttacker` boolean prop to determine its accent colour
- `GameScreen` derives `attackerNum`, `defenderNum`, `firstPlayerNum`, `secondPlayerNum` and passes them as props to all tabs
- `vp.byRound` is an array of `{ primary, sec1, sec2 }` objects (not plain numbers); `vp.total/primary/secondary` are always recomputed from scratch in `adjustVP`
- `adjustVP(player, round, column, delta)` is the single VP mutation; `adjustCP(player, delta)` for CP — both log and snapshot automatically
- Auto +1 CP happens inside `advancePhase` (store) when landing on phase 0, not in any component; grants +1 to **both** players at each Command Phase transition
- VP table column headers are conditional: active/expanded panel shows full names (Primary / Secondary 1 / Secondary 2 / Challenger); inactive panel shows abbreviated (Primary / Sec 1 / Sec 2 / Chall)
- CP and VP buttons use `onPointerDown` + `e.preventDefault()` to prevent browser double-fire (extra synthetic click events on fast presses)
- Per-player timers (`timers.p1` / `timers.p2` in store) are **timestamp-based**: `timers.p1/p2` hold banked elapsed seconds; `timerStartedAt` holds a `Date.now()` anchor set on resume and cleared on pause; displayed time = `banked + (Date.now() - timerStartedAt) / 1000` computed at render; `setInterval` in Header only triggers re-renders, never mutates the store; immune to backgrounding
- `timerPaused: true` is the initial state — timers do not start until the user manually resumes them; `toggleTimerPause()` banks elapsed and clears/sets the anchor
- localStorage persistence uses Zustand `persist` middleware (`zustand/middleware`) with key `wh40k-game-state` version 1; `history`, `timerPaused`, and `timerStartedAt` are excluded from persistence; both are forced to their safe initial values (`true` / `null`) on rehydration via `onRehydrateStorage`; `resetGame()` naturally clears persisted state by writing `initialState` back to localStorage
- Game over sets `gameOver: true` in the store when advancing past Round 5 second-player Fight Phase; blocks `advancePhase`; Next Phase button labelled "Game Over" and disabled; inline banner beneath header; no modal
- Log timestamps use combined elapsed (`timers.p1 + timers.p2 + live`) as total game time, where `live` accounts for un-banked time since the last resume anchor
- Header is three sections: left (Round X/5 · Phase Name · Next Phase button), center (P1 timer · P1 CP/VP/name · vs · P2 name/CP/VP · P2 timer · Pause), right (Undo · Log · Setup); left/right are `shrink-0`, center is `flex-1 justify-center`
- Single Pause/Play button (Lucide icons) in center-right freezes/resumes both timers simultaneously; green when paused (▶), gray when running (⏸)
- Round counter displays as "Round X/5" (not "R1/5")
- Secondary cards: `hand: { p1: [null, null], p2: [null, null] }` is top-level store state; `drawCard(player, slot, cardName)` removes from deck and fills slot; `discardCard(player, slot)` clears slot and appends card to bottom of deck; both snapshot for undo
- Secondary card UI lives in `TrackerTab.jsx` as `SecondaryCardSlot` and `DrawModal` components; shown in both active and inactive panels; tapping the card image opens a lightbox pop-out animating from the card's actual position; secondary cards are positioned top-right alongside CP and VP total rows (right column of a two-column layout), with the VP table running full-width beneath; collapsed/inactive sliver shows only `MiniVPTable` (no cards); card slots stretch to match the left column height (`self-stretch h-full` on right column, `flex-1` on slot row, `h-full` on each slot wrapper); filled slot image uses `flex-1 object-cover object-top` to fill height and crop from top; card name label removed from filled slots; `DrawModalCard` in the pick modal is unaffected (still shows aspect ratio + name)
- Mission card lightbox (primary mission sidebar) and secondary card lightbox both use the same pattern: `getBoundingClientRect()` on click, compute `dx`/`dy` from card centre to viewport centre, inject into `@keyframes` via `<style>` tag, spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`, tap backdrop to close
- DrawModal does NOT close on backdrop tap (no backdrop onClick handler) — user must tap cancel (X) or select a card
- Secondary card buttons use `e.stopPropagation()` to prevent triggering the inactive panel's expand-on-click behaviour
- Design and polish notes:
  - Secondary cards can just be simple buttons to expand the card.
  - VP/CP tracker page, we can have a 90/10 split on active player

## Testing on tablet and publishing notes:
- Had some issues testing on tablet as a PWA, in the end opted to host on github pages (I might move to cloudflare at some point) to be able to have the app work as a PWA page thing
- Also had some issues initialising a github repo for the project, but solved them and eventually hosted the app on a github page: https://jollly7.github.io/wh40k-tracker-app-test/


## v1.4 Project Plan

### Phase Detail

#### Phase 1 - Game, Faction and Detachment reminders per battle phase
- [x] - Create location to store instructions (`src/data/reminders.js`)
- [x] - Add instructions for Genestealers - Biosanctic Broodsurge and Orks - War Horde
- [x] - Add location for faction instructions in reminders.js. I.e. we have general_reminders for all armies. We have faction_reminders for specific detachments. We should change faction reminders for factions, and add detachment reminders for detachments.

#### Phase 2 - Timer persistence fix (timestamp-based timers)
- [x] Replace tick-based timer counter with timestamp anchor approach
- [x] Add `timerStartedAt: null` to store state — `Date.now()` ms timestamp set on resume, cleared on pause
- [x] `timers.p1` / `timers.p2` now store **banked** elapsed seconds (written only on pause or player switch, not every second)
- [x] Remove `tickTimer` store action entirely
- [x] `toggleTimerPause`: pause → bank live elapsed into `timers[activePlayer]`, set `timerStartedAt: null`; resume → set `timerStartedAt: Date.now()`
- [x] `advancePhase`: same-player phases re-anchor (`timerStartedAt ?? Date.now()`); player-switch transitions bank outgoing player's timer then set new anchor
- [x] Header `setInterval` now only calls `setTick(t => t+1)` to trigger re-render — no store mutation
- [x] Displayed time computed at render: `timers[player] + (Date.now() - timerStartedAt) / 1000` for active player; banked value for inactive
- [x] `formatTime` updated to floor float input before `% 60`
- [x] `addLog` includes live un-banked elapsed in log timestamps
- [x] `timerStartedAt` excluded from localStorage persistence; forced to `null` on rehydration

