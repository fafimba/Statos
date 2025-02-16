// Unidades basadas en maggotkin_of_nurgle.json
const baseUnits = {
  lord_of_afflictions: {
    name: "Lord of Afflictions",
    models: 1,
    wounds: 8,
    save: 4,
    ward: null,
    tags: ["CHAOS", "DAEMON", "MORTAL", "NURGLE", "HERO", "ROTBRINGER", "LORD OF AFFLICTIONS"],
    abilities: [
      {
        id: "spear_of_corruption",
        name: "Spear of Corruption",
        description: "Add 2 to the Attacks characteristic of this model's Plague-ridden Great Blade if this model made a charge move in the same turn.",
        category: "offensive",
        activation: "toggleable",
        effect: {
          type: "modifier",
          stat: "attacks",
          value: 2,
          value_to_apply: "add",
          target: "self"
        }
      },
      {
        id: "disgustingly_resilient",
        name: "Disgustingly Resilient",
        description: "Roll a dice each time a wound is allocated to this model. On a 5+, that wound is negated.",
        category: "defensive",
        activation: "fixed",
        effect: {
          type: "modifier",
          stat: "ward",
          value: 5,
          value_to_apply: "set",
          target: "self"
        }
      }
    ],
    attack_profiles: [
      {
        name: "Plague-ridden Great Blade",
        type: "melee",
        range: 2,
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: -2,
        damage: 2,
        models_override: 1
      },
      {
        name: "Dolorous Tocsin",
        type: "melee",
        range: 1,
        attacks: 2,
        hit: 4,
        wound: 3,
        rend: 0,
        damage: 1,
        models_override: 1
      }
    ]
  },
  putrid_blightkings: {
    name: "Putrid Blightkings",
    models: 5,
    wounds: 4,
    save: 4,
    ward: null,
    tags: ["CHAOS", "MORTAL", "NURGLE", "ROTBRINGER", "PUTRID BLIGHTKINGS"],
    abilities: [
      {
        id: "blighted_weapons",
        name: "Blighted Weapons",
        description: "Unmodified wound rolls of 6 inflict 1 mortal wound in addition to any normal damage.",
        category: "offensive",
        activation: "fixed",
        effect: {
          type: "critical",
          critical: {
            effect: "mortal_wound",
            mortal_wounds: 1,
            on_modified: false
          }
        }
      }
    ],
    attack_profiles: [
      {
        name: "Blighted Weapon",
        type: "melee",
        range: 1,
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: 1,
        damage: 2,
        models_override: 5
      }
    ]
  },
  beast_of_nurgle: {
    name: "Beast of Nurgle",
    models: 1,
    wounds: 7,
    save: 4,
    ward: null,
    tags: ["CHAOS", "DAEMON", "NURGLE", "BEAST OF NURGLE"],
    abilities: [
      {
        id: "attention_seeker",
        name: "Attention Seeker",
        description: "Add 1 to hit rolls for attacks made by this model while it is within 3\" of any enemy HEROES.",
        category: "offensive",
        activation: "fixed",
        effect: {
          type: "modifier",
          stat: "hit",
          value: -1,
          value_to_apply: "add",
          target: "self"
        },
        conditions: {
          defender_tag: "HERO"
        }
      }
    ],
    attack_profiles: [
      {
        name: "Tentacles and Slobbering Tongue",
        type: "melee",
        range: 1,
        attacks: 7,
        hit: 3,
        wound: 3,
        rend: 0,
        damage: 1,
        models_override: 1
      }
    ]
  },
  pusgoyle_blightlord: {
    name: "Pusgoyle Blightlord",
    models: 1,
    wounds: 8,
    save: 3,
    ward: 5,
    tags: ["CHAOS", "MORTAL", "NURGLE", "CAVALRY", "FLY"],
    abilities: [
      {
        id: "gardener_of_nurgle",
        name: "Gardener of Nurgle",
        description: "If your general is contesting an objective not contested by any enemy models, roll a dice. On a 3+, that objective is considered by you to be desecrated. Friendly units have WARD (4+) while they are contesting a desecrated objective. If your opponent gains control of a desecrated objective, it is no longer desecrated.",
        category: "defensive",
        activation: "toggleable",
        effect: {
          type: "modifier",
          stat: "ward",
          value: 4,
          value_to_apply: "set",
          target: "self",
          conditions: {
            objective_status: "desecrated"
          }
        }
      },
      {
        id: "gift_of_febrile_frenzy",
        name: "Gift of Febrile Frenzy",
        description: "Until the end of the phase, add 1 to the Attacks characteristic of melee weapons used by friendly units while they are wholly within 7\" of your general",
        category: "offensive",
        activation: "toggleable",
        effect: {
          type: "modifier",
          stat: "attacks",
          value: 1,
          value_to_apply: "add",
          target: "self",
          conditions: {
            attack_type: "melee",
            range: 7
          }
        }
      },
      {
        id: "wrack_and_ruin",
        name: "Wrack and Ruin",
        description: "If this unit charged this phase, pick an enemy unit within 1\" of it to be the target and roll a dice. On a 2+, inflict D3 mortal damage on the target.",
        category: "offensive",
        activation: "toggleable",
        effect: {
          type: "extra_mortal",
          dice_amount: 1,
          dice_type: "d3",
          difficulty: 1,
          conditions: {
            charge: true,
            range: 1
          }
        }
      }
    ],
    attack_profiles: [
      {
        name: "Blighted Scythe",
        type: "melee",
        range: 1,
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: -2,
        damage: 1,
        models_override: 1
      },
      {
        name: "Rot Fly's Mouthparts and Sting",
        type: "melee",
        range: 1,
        attacks: 6,
        hit: 4,
        wound: 2,
        rend: 0,
        damage: 1,
        models_override: 1
      }
    ]
  },
  blood_knights: {
    name: "Blood Knights",
    models: 5,
    wounds: 3,
    save: 3,
    ward: 6,
    tags: ["DEATH", "SOULBLIGHT", "VAMPIRE", "CAVALRY"],
    abilities: [
      {
        id: "ruinous_chargers",
        name: "Ruinous Chargers",
        description: "Inflict D3 mortal damage on each enemy unit it passed across during that CHARGE ability.",
        category: "offensive",
        activation: "toggleable",
        effect: {
          type: "extra_mortal",
          dice_amount: 1,
          dice_type: "d3",
          difficulty: 1,
          damage: "1d3",
          conditions: {
            target_tag: "infantry"
          }
        }
      }
    ],
    attack_profiles: [
      {
        name: "Templar Lance or Templar Blade",
        type: "melee",
        range: 1,
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: 1,
        damage: 1,
        models_override: 5,
        abilities: ["charge_damage"]
      },
      {
        name: "Nightmare's Hooves and Teeth",
        type: "melee",
        range: 1,
        attacks: 3,
        hit: 5,
        wound: 3,
        rend: 0,
        damage: 1,
        models_override: 5,
        abilities: ["companion"]
      }
    ]
  }
};

// Exportamos todas las unidades disponibles
export const allUnits = baseUnits;

// Unidades iniciales para el tester
export const testUnits = {
  attacker: allUnits.lord_of_afflictions,
  defender: allUnits.putrid_blightkings
}; 