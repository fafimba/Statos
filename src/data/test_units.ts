export interface Ability {
  id: string;
  name: string;
  description: string;
  category: 'offensive' | 'defensive';
  activation: 'toggleable' | 'fixed';
  effect: {
    type: string;
    stat?: string;
    value?: number;
    value_to_apply?: string;
    target?: string;
    critical?: {
      effect: string;
      mortal_wounds: number;
      on_modified: boolean;
    };
    conditions?: {
      [key: string]: any;
    };
  };
}

export interface AttackProfile {
  name: string;
  type: 'melee' | 'ranged';
  range: number;
  attacks: number;
  hit: number;
  wound: number;
  rend: number;
  damage: number;
  models_override: number;
  abilities?: string[];
}

export interface Unit {
  name: string;
  models: number;
  wounds: number;
  save: number;
  ward: number | null;
  tags: string[];
  abilities: Ability[];
  attack_profiles: AttackProfile[];
}

// Unidades basadas en maggotkin_of_nurgle.json
const baseUnits: Record<string, Unit> = {
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
  }
};

export const allUnits = baseUnits;

export const testUnits = {
  attacker: allUnits.lord_of_afflictions,
  defender: allUnits.putrid_blightkings
}; 