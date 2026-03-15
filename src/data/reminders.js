// Reminders are keyed by phase name: 'command' | 'movement' | 'shooting' | 'charge' | 'fight'
// Each value is an array of reminder strings.

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

// Keyed by faction name — exact strings from factions.js
// Only include phases with meaningful actionable reminders
export const FACTION_REMINDERS = {
  "Genestealer Cults": {
    movement: [
      "Cult Ambush: units set up in Strategic Reserves may arrive this phase using the Cult Ambush ability (set up anywhere >9\" from enemies).",
    ],
  },
  "Orks": {
      command: [
        "WAAAGH?"
      ]
  }
};

// Keyed by faction name, then detachment name — exact strings from factions.js
export const DETACHMENT_REMINDERS = {

  // Genestealer Cults
  "Genestealer Cults": {
    "Biosanctic Broodsurge": {
      charge: [
        "+1 to Charge rolls for ABERRANTS, BIOPHAGUS, and PURESTRAIN GENESTEALERS.",
      ],
      fight: [
        "ABERRANTS, BIOPHAGUS, and PURESTRAIN GENESTEALERS that charged this turn: +1 Attack on all their melee weapons.",
      ],
    },
  },

  // Orks
  "Orks": {
    "War Horde": {
      fight: [
        "All ORKS melee weapons have [SUSTAINED HITS 1].",
        "If WAAAGH! was declared this round: all ORKS units also gain +1 Attack.",
      ],
    },
  },

};
