// Unidades basadas en maggotkin_of_nurgle.json
const baseUnits = {
  pusgoyle_blightlord: {
    name: "Pusgoyle Blightlord",
    models: 2,
    wounds: 8,
    save: 4,
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
          type: "extra_mortal_damage",
          extra_mortal_dice_amount: 1,
          extra_mortal_dice_type: "d3",
          extra_mortal_difficulty: 1,
          extra_mortal_multiplier: 1
        }
      }
    ],
    attack_profiles: [
      {
        name: "Blighted Scythe",
        type: "melee",
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: 2,
        damage: 1,
        models_override: 1
      },
      {
        name: "Rot Fly's Mouthparts and Sting",
        type: "melee",
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
          type: "extra_mortal_damage",
          extra_mortal_dice_amount: 1,
          extra_mortal_dice_type: "d3",
          extra_mortal_difficulty: 1,
          extra_mortal_multiplier: 1,
          conditions: {
            defender_tag: "infantry"
          }
        }
      },
      {
        id: "charge_damage",
        name: "Charge Damage",
        description: "+1 damage when charging",
        category: "offensive",
        activation: "toggleable",
        effect: {
          type: "modifier",
          stat: "damage",
          value: 1,
          value_to_apply: "add",
          conditions: {
            profile_name: "Templar Lance or Templar Blade"
          }
        }
      }
    ],
    attack_profiles: [
      {
        name: "Templar Lance or Templar Blade",
        type: "melee",
        attacks: 3,
        hit: 3,
        wound: 3,
        rend: 1,
        damage: 1,
        models_override: 5
      },
      {
        name: "Nightmare's Hooves and Teeth",
        type: "melee",
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
  attacker: baseUnits.blood_knights,
  defender: baseUnits.pusgoyle_blightlord
}; 