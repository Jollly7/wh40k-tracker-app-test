// Reminders are keyed by phase name: 'command' | 'movement' | 'shooting' | 'charge' | 'fight'
// Each value is an array of reminder strings.

// ─── GENERAL ─────────────────────────────────────────────────────
// Shown to all players regardless of faction
export const GENERAL_REMINDERS = {
  command: [
    "Check for Battle-Shock.",
    "Score Primary VP at end of the Command Phase.",
  ],
  fight: [
    "Remember to score Secondary VP at end of Turn.",
  ],
};

// ─── FACTION / DETACHMENT CONTAINERS ─────────────────────────────
// Keyed by faction name — exact strings from factions.js
export const FACTION_REMINDERS = {};

// Keyed by faction name, then detachment name — exact strings from factions.js
export const DETACHMENT_REMINDERS = {};


// ─── GENESTEALER CULTS ───────────────────────────────────────────
FACTION_REMINDERS["Genestealer Cults"] = {
  movement: [
    "Cult Ambush: in your opponent's Movement phase you may set up units from Cult Ambush using a Cult Ambush Marker — position >9\" from all enemy models.",
    "Resurgence: when a friendly unit is destroyed, spend Resurgence points to add an identical unit back to Cult Ambush.",
    "Cult Ambush Markers are removed if an enemy model ends its move within 9\" of one — protect your markers.",
  ],
};

DETACHMENT_REMINDERS["Genestealer Cults"] = {
  "Biosanctic Broodsurge": {
    movement: [
      "Hypermorphic Fury: units set up as Reinforcements this phase have weapons with [SUSTAINED HITS 1] and [IGNORES COVER] until the end of your next Fight phase.",
    ],
  },
};


// ─── GREY KNIGHTS ────────────────────────────────────────────────
FACTION_REMINDERS["Grey Knights"] = {
  fight: [
    "Gate of Infinity: at the end of your opponent's Fight phase, you may place eligible GREY KNIGHTS units not in Engagement Range into Strategic Reserves.",
  ],
};

DETACHMENT_REMINDERS["Grey Knights"] = {
  "Warpbane Task Force": {
    command: [
      "BEACON OF ABSOLUTION (2CP): at end of Command Phase, select one GREY KNIGHTS Character — until end of next turn, friendly units within 6\" gain a 5+ invulnerable save.",
    ],
    shooting: [
      "PURIFYING FLAME (1CP): select one GREY KNIGHTS unit — until end of Shooting Phase, its psychic weapons gain [SUSTAINED HITS 1].",
    ],
    fight: [
      "Hallowed Ground: GREY KNIGHTS PSYKER units have an invulnerable save; on a 5+, mortal wounds are ignored.",
      "IMPENETRABLE WARD (1CP): use in opponent's Shooting or Fight phase — subtract 1 from Wound rolls against one GREY KNIGHTS PSYKER unit until end of phase.",
    ],
  },
};


// ─── ORKS ────────────────────────────────────────────────────────
FACTION_REMINDERS["Orks"] = {
  command: [
    "WAAAGH!: once per battle at the start of your Command Phase, you may call a WAAAGH! — until your next Command Phase: ORKS units can charge after Advancing; melee weapons gain +1 Strength and +1 Attack; models gain a 5+ invulnerable save.",
  ],
  movement: [
    "If WAAAGH! is active: all ORKS units may declare charges even if they Advanced this phase.",
  ],
  charge: [
    "ERE WE GO (1CP): add +2 to an ORKS unit's Advance or Charge roll.",
  ],
  fight: [
    "If WAAAGH! is active: all ORKS melee weapons gain +1 Strength and +1 Attack.",
  ],
};

DETACHMENT_REMINDERS["Orks"] = {
  "War Horde": {
    command: [
      "MOB RULE (1CP): at end of Command Phase, remove the Battle-shocked condition from one nearby ORKS unit.",
    ],
    fight: [
      "Get Stuck In: all ORKS melee weapons in your army have [SUSTAINED HITS 1].",
      "UNBRIDLED CARNAGE (1CP): until end of Fight phase, unmodified Hit rolls of 5+ count as Critical Hits for one ORKS unit.",
      "ORKS IS NEVER BEATEN (2CP): when an ORKS unit is destroyed in the Fight phase, its models may fight before being removed.",
    ],
  },
};


// ─── T'AU EMPIRE ─────────────────────────────────────────────────
FACTION_REMINDERS["T'au Empire"] = {
  shooting: [
    "For the Greater Good: at the start of the Shooting phase, select Observer units — each designates one visible enemy as its Spotted unit.",
    "Guided units targeting their Spotted unit gain +1 BS. If the Observer has MARKERLIGHT, Guided units also gain [IGNORES COVER] against the Spotted unit.",
  ],
};

DETACHMENT_REMINDERS["T'au Empire"] = {
  "Mont'ka": {
    movement: [
      "Aggressive Mobility (1CP): add 6\" to Move for one T'AU EMPIRE unit that Advances this phase.",
    ],
    shooting: [
      "Killing Blow: in battle rounds 1–3, T'AU EMPIRE ranged weapons gain [ASSAULT]. While a unit is Guided, its ranged weapons also gain [LETHAL HITS].",
      "Focused Fire (1CP): select two T'AU EMPIRE units targeting the same enemy unit — those attacks gain +1 AP.",
      "Pulse Onslaught (2CP): select one enemy unit — it becomes Shaken (−2\" Move, Advance, and Charge) until end of turn.",
    ],
  },
};
