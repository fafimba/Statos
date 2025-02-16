// Función principal que calcula el daño total
export const applyAbilityModifiers = (attackingUnit, defendingUnit, activeProfiles, activeAbilities = { offensive: {}, defensive: {} }) => {
  // Validación de entrada
  if (!attackingUnit || !defendingUnit) {
    return {
      attacker: attackingUnit,
      defender: defendingUnit,
      activeProfiles,
      abilities: activeAbilities
    };
  }

  // Crear estado inicial
  const state = {
    attacker: { ...attackingUnit },
    defender: { ...defendingUnit },
    activeProfiles: activeProfiles || attackingUnit.attack_profiles?.reduce((acc, profile) => ({
      ...acc,
      [profile.name]: true
    }), {}),
    abilities: {
      offensive: [...(attackingUnit.abilities || [])].filter(ability => 
        ability.category === 'offensive' && 
        (activeAbilities ? activeAbilities.offensive[ability.id] : true)
      ),
      defensive: [...(defendingUnit.abilities || [])].filter(ability => 
        ability.category === 'defensive' && 
        (activeAbilities ? activeAbilities.defensive[ability.id] : true)
      )
    }
  };

  // Aplicar todas las habilidades
  const allAbilities = [...state.abilities.offensive, ...state.abilities.defensive];
  
  allAbilities.forEach(ability => {
    if (!checkAbilityConditions(ability, null, state.attacker, state.defender)) return;

    if (ability.effect.type === 'modifier') {
      applyModifierEffect(state, ability.effect);
    }
  });

  // Aplicar modificadores a los perfiles de ataque
  if (state.attacker.attack_profiles) {
    state.attacker.attack_profiles = state.attacker.attack_profiles
      .filter(profile => state.activeProfiles[profile.name])
      .map(profile => applyProfileModifiers(profile, state));
  }

  return state;
};

// Aplica los modificadores de habilidades a un perfil específico
const applyProfileModifiers = (profile, state) => {
  let modifiedProfile = { ...profile };
  
  // Establecer models_override si no existe
  if (!modifiedProfile.models_override) {
    modifiedProfile.models_override = state.attacker.models;
  }
  
  // Filtrar habilidades por condiciones específicas del perfil
  const applicableAbilities = [
    ...state.abilities.offensive.filter(ability => 
      checkAbilityConditions(ability, profile, state.attacker, state.defender)
    ),
    ...state.abilities.defensive.filter(ability => 
      checkAbilityConditions(ability, profile, state.attacker, state.defender)
    )
  ];
  
  // Aplicar modificadores básicos
  applicableAbilities.forEach(ability => {
    if (ability.effect.type === 'modifier') {
      switch (ability.effect.stat) {
        case 'attacks':
          if (ability.effect.value_to_apply === 'set') {
            modifiedProfile.attacks = ability.effect.value;
          } else {
            modifiedProfile.attacks += ability.effect.value;
          }
          break;
        case 'hit':
          if (ability.effect.value_to_apply === 'set') {
            modifiedProfile.hit = ability.effect.value;
          } else {
            modifiedProfile.hit += ability.effect.value;
          }
          break;
        case 'wound':
          if (ability.effect.value_to_apply === 'set') {
            modifiedProfile.wound = ability.effect.value;
          } else {
            modifiedProfile.wound += ability.effect.value;
          }
          break;
        case 'rend':
          if (ability.effect.value_to_apply === 'set') {
            modifiedProfile.rend = ability.effect.value;
          } else {
            modifiedProfile.rend += ability.effect.value;
          }
          break;
        case 'damage':
          if (ability.effect.value_to_apply === 'set') {
            modifiedProfile.damage = ability.effect.value;
          } else {
            modifiedProfile.damage += ability.effect.value;
          }
          break;
      }
    }
  });

  // Aplicar límites
  modifiedProfile.attacks = Math.max(Number(modifiedProfile.attacks) || 1, 1);
  modifiedProfile.hit = Math.min(Math.max(Number(modifiedProfile.hit) || 4, 2), 6);
  modifiedProfile.wound = Math.min(Math.max(Number(modifiedProfile.wound) || 4, 2), 6);
  modifiedProfile.damage = Math.max(Number(modifiedProfile.damage) || 1, 1);
  modifiedProfile.rend = Number(modifiedProfile.rend) || 0;

  // Validar campos numéricos
  const numericFields = ['attacks', 'hit', 'wound', 'damage', 'rend'];
  numericFields.forEach(field => {
    if (isNaN(Number(modifiedProfile[field]))) {
      console.warn(`Campo numérico ${field} inválido en perfil:`, modifiedProfile);
    }
  });

  // Validar campos de texto
  const stringFields = ['type', 'name'];
  stringFields.forEach(field => {
    if (!modifiedProfile[field] || typeof modifiedProfile[field] !== 'string') {
      console.warn(`Campo de texto ${field} inválido en perfil:`, modifiedProfile);
    }
  });

  // Añadir los efectos de habilidad al perfil
  if (!modifiedProfile.abilityEffects) {
    modifiedProfile.abilityEffects = [];
  }
  
  // Añadir todos los efectos aplicables
  applicableAbilities.forEach(ability => {
    if (ability.effect.type !== 'modifier') {  // Los modificadores ya se aplicaron arriba
      modifiedProfile.abilityEffects.push(ability.effect);
    }
  });

  return modifiedProfile;
};

// Funciones para aplicar modificadores (pueden expandirse según necesidades)
const applyAttackModifiers = (attacks, abilities) => {
  let modifiedAttacks = attacks;
  
  abilities.forEach(ability => {
    if (!ability.effect?.attack_modifier) return;
    
    switch (ability.effect.attack_modifier.type) {
      case 'multiply':
        modifiedAttacks *= ability.effect.attack_modifier.value;
        break;
      case 'add':
        modifiedAttacks += ability.effect.attack_modifier.value;
        break;
      case 'override':
        modifiedAttacks = ability.effect.attack_modifier.value;
        break;
    }
  });
  
  return Math.max(modifiedAttacks, 1);
};

// Aplica los modificadores de impacto a un perfil específico
const applyHitModifiers = (currentHit, abilities) => {
  let modifiedHit = currentHit;
  
  abilities.forEach(ability => {
    if (!ability.effect?.hit_modifier) return;
    
    switch (ability.effect.hit_modifier.type) {
      case 'add':
        modifiedHit -= ability.effect.hit_modifier.value;
        break;
      case 'set':
        modifiedHit = ability.effect.hit_modifier.value;
        break;
    }
  });
  
  return Math.min(Math.max(modifiedHit, 2), 6); // Limitar entre 2+ y 6+
};

// Aplica los modificadores de heridas a un perfil específico
const applyWoundModifiers = (currentWound, abilities) => {
  let modifiedWound = currentWound;
  
  abilities.forEach(ability => {
    if (!ability.effect?.wound_modifier) return;
    
    switch (ability.effect.wound_modifier.type) {
      case 'add':
        modifiedWound -= ability.effect.wound_modifier.value;
        break;
      case 'set':
        modifiedWound = ability.effect.wound_modifier.value;
        break;
    }
  });
  
  return Math.min(Math.max(modifiedWound, 2), 6);
};

// Aplica los modificadores de rend a un perfil específico
const applyRendModifiers = (currentRend, abilities) => {
  let modifiedRend = currentRend;
  
  abilities.forEach(ability => {
    if (!ability.effect?.rend_modifier) return;
    
    switch (ability.effect.rend_modifier.type) {
      case 'improve':
        modifiedRend += ability.effect.rend_modifier.value;
        break;
      case 'set':
        modifiedRend = ability.effect.rend_modifier.value;
        break;
    }
  });
  
  return Math.max(modifiedRend, 0);
};

// Aplica los modificadores de daño a un perfil específico
const applyDamageModifiers = (damage, abilities) => {
  let modifiedDamage = damage;
  
  abilities.forEach(ability => {
    if (!ability.effect?.damage_modifier) return;
    
    switch (ability.effect.damage_modifier.type) {
      case 'add':
        modifiedDamage += ability.effect.damage_modifier.value;
        break;
      case 'set':
        modifiedDamage = ability.effect.damage_modifier.value;
        break;
    }
  });
  
  return Math.max(modifiedDamage, 1);
};

const applyModifierEffect = (state, effect) => {
  const target = effect.target === 'attacker' ? state.attacker : state.defender;
  const stat = effect.stat;
  const currentValue = Number(target[stat]) || 0;
  
  if (effect.value_to_apply === 'set') {
    target[stat] = Number(effect.value);
  } else {
    target[stat] = currentValue + Number(effect.value);
  }

  // Aplicar límites según el tipo de stat
  switch (stat) {
    case 'save':
    case 'ward':
      target[stat] = Math.min(Math.max(target[stat], 2), 6);
      break;
    case 'wounds':
    case 'models':
      target[stat] = Math.max(target[stat], 1);
      break;
  }
};

const checkAbilityConditions = (ability, profile, attacker, defender) => {
  if (!ability.conditions) return true;
  
  const conditions = ability.conditions;
  
  // Comprobar tags
  if (conditions.attacker_tag && !attacker.tags?.includes(conditions.attacker_tag)) return false;
  if (conditions.attacker_tag_exclude && attacker.tags?.includes(conditions.attacker_tag_exclude)) return false;
  if (conditions.defender_tag && !defender.tags?.includes(conditions.defender_tag)) return false;
  if (conditions.defender_tag_exclude && defender.tags?.includes(conditions.defender_tag_exclude)) return false;
  
  // Solo comprobar condiciones relacionadas con el perfil si tenemos un perfil
  if (profile) {
    // Comprobar tipo de ataque
    if (conditions.attack_type && profile.type !== conditions.attack_type) return false;
    
    // Comprobar nombre de perfil
    if (conditions.profile_name && profile.name !== conditions.profile_name) return false;
  } else {
    // Si no hay perfil pero hay condiciones que requieren perfil, retornar false
    if (conditions.attack_type || conditions.profile_name) return false;
  }
  
  // Comprobar tamaños
  if (conditions.attacker_size && attacker.models !== conditions.attacker_size) return false;
  
  // Comprobar características
  if (conditions.target_wounds && defender.wounds !== conditions.target_wounds) return false;
  if (conditions.target_save && defender.save !== conditions.target_save) return false;
  if (conditions.target_ward && defender.ward !== conditions.target_ward) return false;
  
  return true;
};




// ... Implementar las otras funciones de aplicación de efectos ... 