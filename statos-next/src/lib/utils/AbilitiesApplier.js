import { calcularMortalesConDados } from './calculator';

// Añadir la función round2 al principio del archivo
const round2 = (num) => Math.round(num * 100) / 100;

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
    if (!checkAbilityConditionsForProfile(ability, null, state.attacker, state.defender)) return;

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
      checkAbilityConditionsForProfile(ability, profile, state.attacker, state.defender)
    ),
    ...state.abilities.defensive.filter(ability => 
      checkAbilityConditionsForProfile(ability, profile, state.attacker, state.defender)
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

export const checkAbilityConditions = (ability, attacker, defender, activeProfiles = null) => {
  if (!ability.effect.conditions) return true;

  // Verificar cada perfil del atacante
  const profilesToCheck = activeProfiles 
    ? attacker.attack_profiles.filter(profile => activeProfiles[profile.name])
    : attacker.attack_profiles;

  if (!profilesToCheck.some(profile => 
    checkAbilityConditionsForProfile(ability, profile, attacker, defender))) return false;

  // Comprobar tamaños
  if (ability.effect.conditions && 'attacker_size' in ability.effect.conditions && attacker.models !== ability.effect.conditions.attacker_size) return false;
  if (ability.effect.conditions && 'defender_size' in ability.effect.conditions && defender.models !== ability.effect.conditions.defender_size) return false;
  
  // Comprobar características
  if (ability.effect.conditions && 'attacker_wounds' in ability.effect.conditions && attacker.wounds !== ability.effect.conditions.attacker_wounds) return false;
  if (ability.effect.conditions && 'defender_wounds' in ability.effect.conditions && defender.wounds !== ability.effect.conditions.defender_wounds) return false;
  if (ability.effect.conditions && 'attacker_save' in ability.effect.conditions && attacker.save !== ability.effect.conditions.attacker_save) return false;
  if (ability.effect.conditions && 'defender_save' in ability.effect.conditions && defender.save !== ability.effect.conditions.defender_save) return false;
  if (ability.effect.conditions && 'attacker_ward' in ability.effect.conditions && attacker.ward !== ability.effect.conditions.attacker_ward) return false;
  if (ability.effect.conditions && 'defender_ward' in ability.effect.conditions && defender.ward !== ability.effect.conditions.defender_ward) return false;

  // Comprobar tags
  if (ability.effect.conditions && 'attacker_tag' in ability.effect.conditions && !attacker.tags?.includes(ability.effect.conditions.attacker_tag)) return false;
  if (ability.effect.conditions && 'attacker_tag_exclude' in ability.effect.conditions && attacker.tags?.includes(ability.effect.conditions.attacker_tag_exclude)) return false;
  if (ability.effect.conditions && 'defender_tag' in ability.effect.conditions && !defender.tags?.includes(ability.effect.conditions.defender_tag)) return false;
  if (ability.effect.conditions && 'defender_tag_exclude' in ability.effect.conditions && defender.tags?.includes(ability.effect.conditions.defender_tag_exclude)) return false;
    
  
  return true;
};

export const checkAbilityConditionsForProfile = (ability, profile) => {
  if (!ability.effect.conditions) return true;
  
  const conditions = ability.effect.conditions;

  // Si no hay perfil pero hay condiciones que requieren perfil
  if (!profile && ('attack_type' in conditions || 'profile_name' in conditions)) return false;

  // Si no hay perfil, no hay que hacer más comprobaciones (la habilidad no necesita perfil)
  if (!profile) return true;

  // Comprobar tipo de ataque
  if ('profile_name' in conditions && profile.name !== conditions.profile_name) return false;
  if ('attack_type' in conditions && profile.type !== conditions.attack_type) return false;

  return true;
 
};

export const GetMortalDamageFromAbilities = (attackingUnit, defendingUnit, activeAbilities = { offensive: {}, defensive: {} }) => {
  if (!attackingUnit || !defendingUnit) {
    return 0;
  }

  let mortalDamage = 0;

  // Filtrar habilidades ofensivas activas
  const activeOffensiveAbilities = [...(attackingUnit.abilities || [])].filter(ability => 
    ability.category === 'offensive' && 
    (activeAbilities ? activeAbilities.offensive[ability.id] : true)
  );

  // Por ahora solo procesamos habilidades ofensivas que causan daño mortal
  activeOffensiveAbilities.forEach(ability => {
    if (
      ability.effect.type === 'extra_mortal_damage' && 
      checkAbilityConditionsForProfile(ability, null, attackingUnit, defendingUnit)
    ) {
      const effect = ability.effect;
      
      // Determinar la cantidad de dados según el tipo
      let cantidad = 0;
      switch (effect.extra_mortal_dice_amount) {
        case 'defender_unit_size':
          cantidad = defendingUnit.models || 0;
          break;
        case 'attacker_unit_size':
          cantidad = attackingUnit.models || 0;
          break;
        case 'defender_wounds':
          cantidad = defendingUnit.wounds || 0;
          break;
        case 'attacker_wounds':
          cantidad = attackingUnit.wounds || 0;
          break;
        default:
          cantidad = parseInt(effect.extra_mortal_dice_amount) || 0;
          break;
      }

      // Determinar la dificultad según el tipo
      let dificultad = effect.value || 4; // valor por defecto
      switch (effect.extra_mortal_difficulty) {
        case 'defender_wounds':
          dificultad = defendingUnit.wounds || 4;
          break;
        case 'attacker_wounds':
          dificultad = attackingUnit.wounds || 4;
          break;
        case 'defender_save':
          dificultad = defendingUnit.save || 4;
          break;
        case 'attacker_save':
          dificultad = attackingUnit.save || 4;
          break;
        default:
          dificultad = parseInt(effect.extra_mortal_difficulty) || 4;
          break;
      }

      console.log("habilidad", ability);
      console.log("cantidad", cantidad);
      console.log("dificultad", dificultad);

      const mortalesCalculados = calcularMortalesConDados({
        cantidad: cantidad,
        tipoDado: effect.extra_mortal_dice_type || 'd6',
        dificultad: dificultad,
        salvaguardia: defendingUnit.ward || 0,
        multiplicador: effect.extra_mortal_multiplier || 1
      });

      mortalDamage += mortalesCalculados;
    }
  });

  return round2(mortalDamage);
};

