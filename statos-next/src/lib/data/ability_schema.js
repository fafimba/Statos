// Esquema base
const abilitySchema = {
  id: "string",          
  name: "string",        
  description: "string", 
  category: "enum",// 'offensive' | 'defensive'
  activation: "enum",// 'toggleable' | 'fixed' 
  effect: {
    type: "enum",// 'modifier' | 'critical' | 'add_profile_effect' | 'extra_mortal_damage' | 'special' | 'reroll'

    // Para type: 'modifier'
    stat: "string",     // 'save' | 'ward' | 'wounds' | 'attacks' | 'hit' | 'wound' | 'rend' | 'damage'
    value: number, 
    value_to_apply: "enum", // 'add' | 'set'
    target: "string",   // 'attacker' | 'defender'
    
    // Para type: 'reroll'
    reroll: {
      type: "enum",     // 'ones' | 'failed' | 'all'
      stat: "string",   // 'hit' | 'wound' | 'save' | 'ward'
    },

    // Para type: 'add_profile_effect'
    profile_effect: {}, // efecto a aplicar al perfil (como un efecto de habilidad)

    // Para type: 'extra_mortal_damage'
    extra_mortal_dice_amount: "enum",  // 'flat' | 'unit_size' | 'enemy_wounds'
    extra_mortal_dice_type: "string",  // 'd3' | 'd6'
    extra_mortal_difficulty: "enum",   // 'fixed' | 'target_wounds' | 'target_save'
    extra_mortal_multiplier: number,

    // Para type: 'critical'
    critical: {
      trigger: number,        // Normalmente 6
      effect: "enum",        // 'mortal' | 'auto_wound' | 'extra_hit'
      mortal_wounds: number, // Para effect: 'mortal'
      extra_hits: number,    // Para effect: 'extra_hit'
      on_modified: boolean   // Si aplica a tiradas modificadas
    },
  }, 
  conditions: {
    attacker_tag: "string",
    attacker_tag_exclude: "string",
    defender_tag: "string",
    defender_tag_exclude: "string",
    attack_type: "string",
    profile_name: "string",
    attacker_size: number,
    enemy_wounds: number,
    roll_value: number,    // Para condiciones basadas en el resultado del dado
    phase: "string",       // 'combat' | 'shooting' | etc
    target_wounds: number,
    target_save: number,
    target_ward: number,
    target_attacks: number,
    target_hit: number,
  },
  casting: {
    difficulty: "enum", // 'fixed' | 'attacker_size' | 'defender_size'
    dice_amount: number,
    dice_type: "string", // 'd3' | 'd6'
  },
  attack_profiles: [
    {
      name: "string",
      type: "enum",     // 'melee' | 'ranged'
      range: number,
      attacks: number,
      hit: number,
      wound: number,
      rend: number,
      damage: number,
      models_override: number  // Por defecto igual a unit.models
    }
  ]
};


//habilidades de ejemplo
// Bendición de Sigmar (modificador de salvación)
const sigmarBlessing = {
  id: "sigmar_blessing",
  name: "Bendición de Sigmar",
  description: "Mejora la salvación de la unidad en 1.",
  category: "offensive",
  activation: "toggleable",
  effect: {
    type: "modifier",
    stat: "save",
    value: -1,
    value_to_apply: "add",
    target: "attacker"
  }
};

// Furia Justiciera (modificador de ataques contra CHAOS)
const righteousFury = {
  id: "righteous_fury",
  name: "Furia Justiciera",
  description: "Añade 1 ataque cuando ataca a unidades CHAOS.",
  category: "offensive",
  activation: "toggleable",
  effect: {
    type: "modifier",
    stat: "attacks",
    value: 1,
    value_to_apply: "add",
    target: "attacker"
  },
  conditions: {
    defender_tag: "CHAOS"
  }
};

// Maestro Espadachín (modificador de hit para un perfil específico)
const masterSwordsman = {
  id: "master_swordsman",
  name: "Maestro Espadachín",
  description: "Este guerrero es especialmente hábil con la espada, mejorando su precisión.",
  category: "offensive",
  activation: "toggleable",
  effect: {
    type: "modifier",
    stat: "hit",
    value: -1,
    value_to_apply: "add",
    target: "attacker"
  },
  conditions: {
    profile_name: "Runefang Sword"
  }
};

// Escudo Místico (modificador de rend para ataques a distancia)
const mysticShield = {
  id: "mystic_shield",
  name: "Escudo Místico",
  description: "Una barrera mágica que reduce la efectividad de los proyectiles enemigos.",
  category: "defensive",
  activation: "toggleable",
  effect: {
    type: "modifier",
    stat: "rend",
    value: 1,
    value_to_apply: "add",
    target: "defender"
  },
  conditions: {
    attack_type: "ranged"
  }
};

// Matador de Monstruos (modificador de ward contra MONSTER)
const monsterSlayer = {
  id: "monster_slayer",
  name: "Matador de Monstruos",
  description: "Este guerrero está entrenado para enfrentarse a las bestias más grandes, obteniendo una protección especial contra ellas.",
  category: "defensive",
  activation: "toggleable",
  effect: {
    type: "modifier",
    stat: "ward",
    value: 4,
    value_to_apply: "set",
    target: "defender"
  },
  conditions: {
    attacker_tag: "MONSTER"
  }
};

// Relentless Attackers (daño mortal extra)
const relentlessAttackers = {
  id: "relentless_attackers",
  name: "Relentless Attackers",
  description: "Pick an enemy INFANTRY unit in combat with this unit to be the target and roll a dice for each model in this unit that is within the target unit's combat range. For each roll that exceeds the target's Health characteristic, inflict 1 mortal damage on it.",
  category: "offensive",
  activation: "toggleable",
  effect: {
    type: "extra_mortal_damage",
    extra_mortal_dice_amount: "unit_size",
    extra_mortal_dice_type: "d6",
    extra_mortal_difficulty: "defender_size",
    extra_mortal_multiplier: 1
  },
  conditions: {
    defender_tag: "INFANTRY",
    attack_type: "melee"
  }
}; 