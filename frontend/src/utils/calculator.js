import { weapon_abilities } from '../data/weapon_abilities';

// Utilities
const round2 = (num) => Math.round(num * 100) / 100;

const calcularProbabilidad = (objetivo) => {
  const exitosPosibles = 7 - Math.max(1, Math.min(6, objetivo));
  return Math.max(0, exitosPosibles / 6);
};

const calcularValorDado = (dado) => {
  // Si es número, devolver el mismo número
  if (typeof dado === 'number') return dado;
  
  // Si es string, procesar como notación de dados
  if (typeof dado === 'string') {
    // Convertir a mayúsculas y buscar patrones como "2D6" o "D3+2"
    const match = dado.toUpperCase().match(/^(\d+)?D(\d+)(?:\+(\d+))?$/);
    
    if (match) {
      const cantidad = match[1] ? parseInt(match[1]) : 1; // Número de dados (1 si no se especifica)
      const caras = parseInt(match[2]); // Número de caras del dado
      const modificador = match[3] ? parseInt(match[3]) : 0; // Modificador adicional
      
      // Calcular media: (caras + 1)/2 por cada dado + modificador
      return cantidad * ((caras + 1) / 2) + modificador;
    }
  }
  
  return 0; // Valor por defecto si no es válido
};

// Nueva función para aplicar modificadores de perfil según condiciones del enemigo
const applyProfileModifiers = (perfil, enemigo) => {
  // Crear una copia del perfil para modificar sin alterar el original
  let perfilModificado = { ...perfil };
  // Recorrer cada efecto activo (almacenado en abilityEffects)
  (perfil.abilityEffects || []).forEach(effectKey => {

    if (effectKey.conditions) {
      if (effectKey.conditions.target_tag && !enemigo.tags?.includes(effectKey.conditions.target_tag)) {
        return; // No se aplica si la condición no se cumple
      }
    }
    switch(effectKey.target) {
      case 'damage':
        perfilModificado.damage = calcularValorDado(perfilModificado.damage || 0) + (effectKey.value || 0);
        break;
      case 'hit':
        perfilModificado.hit = Math.max(2, calcularValorDado(perfilModificado.hit || 0) - (effectKey.value || 0));
        break;
      case 'wound':
        perfilModificado.wound = Math.max(2, calcularValorDado(perfilModificado.wound || 0) - (effectKey.value || 0));
        break;
      case 'rend':
        perfilModificado.rend = calcularValorDado(perfilModificado.rend || 0) + (effectKey.value || 0);
        break;
      default:
        break;
    }
  });
  return perfilModificado;
};

const calcularRoll = (totalAtaques, dificultad) => {
  const probExito = calcularProbabilidad(dificultad);
  const probCrit = 1 / 6;
  const probNormal = probExito - probCrit;

  return {
    normales: totalAtaques * probNormal,
    criticos: totalAtaques * probCrit
  };
};



const calcularDañoMortal = (hits, damage, salvaguardia) => {
  let dañoMortal = hits.criticos * damage;

  if (salvaguardia > 0) {
    const probFallarSalva = 1 - calcularProbabilidad(salvaguardia);
    dañoMortal *= probFallarSalva;
  }

  return dañoMortal;
};

const calcularDañoNormal = ({ hits, wound, damage, guardia, perforacion, salvaguardia }) => {
  // 1. Calcular heridas
  const probWound = calcularProbabilidad(wound);
  let heridas = hits.normales * probWound;

  // 2. Aplicar guardia
  if (guardia > 0) {
    const guardiaModificada = guardia + perforacion;
    if (guardiaModificada <= 6) {
      const probFallarGuardia = 1 - calcularProbabilidad(guardiaModificada);
      heridas *= probFallarGuardia;
    }
  }

  // 3. Calcular daño base
  let dañoNormal = heridas * damage;

  // 4. Aplicar salvaguardia
  if (salvaguardia > 0) {
    const probFallarSalva = 1 - calcularProbabilidad(salvaguardia);
    dañoNormal *= probFallarSalva;
  }

  return dañoNormal;
};

const calcularDañoAutoWound = ({ hits, damage, guardia, perforacion, salvaguardia }) => {
  const totalHeridas = hits.normales + hits.criticos;
  let dañoFinal = totalHeridas * damage;

  if (guardia > 0) {
    const guardiaModificada = guardia + perforacion;
    if (guardiaModificada <= 6) {
      const probFallarGuardia = 1 - calcularProbabilidad(guardiaModificada);
      dañoFinal *= probFallarGuardia;
    }
  }

  if (salvaguardia > 0) {
    const probFallarSalva = 1 - calcularProbabilidad(salvaguardia);
    dañoFinal *= probFallarSalva;
  }

  return dañoFinal;
};

export const calcularMortalesConDados = ({ cantidad, tipoDado, dificultad, salvaguardia, multiplicador = 1 }) => {

  // 1. Calcular probabilidad de éxito en la tirada según el tipo de dado
  let probExito;
  if (tipoDado === 'd3') {
    const exitosPosibles = 4 - Math.max(1, Math.min(3, dificultad));
    probExito = exitosPosibles / 3;
  } else {
    const exitosPosibles = 7 - Math.max(1, Math.min(6, dificultad));
    probExito = exitosPosibles / 6;
  }
  
  const mortalesBase = cantidad * probExito;

  if (salvaguardia > 0) {
    const probFallarSalva = 1 - calcularProbabilidad(salvaguardia);
    const resultado = mortalesBase * probFallarSalva;
    return resultado * multiplicador;
  }

  return mortalesBase;
};

// Función principal
// Ahora se añade el parámetro "enemigo" para aplicar modificadores según las condiciones del objetivo
export const calculateAttacks = ({ perfiles_ataque, guardia, salvaguardia,enemy_wounds, enemigo }) => {
  try {
    console.log("perfiles_ataque calculateAttacks", perfiles_ataque);
    const perfilesAtaque = perfiles_ataque || [];

    let dañoTotal = 0;
    const desglosePerfiles = [];

    for (const perfil of perfilesAtaque) {
      // Aplicar modificadores al perfil según las condiciones del enemigo
      const perfilCalculado = applyProfileModifiers(perfil, enemigo);
      
      // 1. Preparar datos básicos usando el perfil modificado
      const ataquesPorModelo = calcularValorDado(perfilCalculado.attacks || perfilCalculado.ataques || 0);
      const totalAtaques = perfilCalculado.models_override * ataquesPorModelo;
      const hit = parseInt(perfilCalculado.hit || 0);
      const wound = parseInt(perfilCalculado.wound || 0);
      const damage = calcularValorDado(perfilCalculado.damage || 0);
      const perforacion = parseInt(perfilCalculado.rend || perfilCalculado.perforacion || 0);
      const tipoCritico = (perfilCalculado.abilityEffects || [])
        .find(ability => ability?.type === 'critical')?.action;
      
        console.log("perfilCalculado", perfilCalculado);
      console.log("tipoCritico", tipoCritico);

        let hits_roll = {normales:0, criticos:0};
        let hits=0;
        
        let wounds_roll = {normales:0, criticos:0};
        let wounds=0;
        let mortal_wound=0;

      let guardia_roll = {normales:0, criticos:0};
      let salvaguardia_roll = {normales:0, criticos:0};
        let damage_final=0;
      
      // 1. Calcular hits 
 
       hits_roll = calcularRoll(totalAtaques, hit);
       switch(tipoCritico) {
        case 'extra_hit':
          hits = hits_roll.normales + (hits_roll.criticos * 2);
          break;
        case 'auto_wound':
          wounds = hits_roll.criticos;
          hits = hits_roll.normales;
          break;
         case 'mortal_wound':
           mortal_wound = hits_roll.criticos;
           hits = hits_roll.normales;
           break;
         default:
           hits = hits_roll.normales + hits_roll.criticos;
           break;
       }

      // 2. Calcular wounds
   
      wounds_roll = calcularRoll(hits, wound);
      wounds += (wounds_roll.normales + wounds_roll.criticos) ;

      // 3. Aplicar guardia
      if (guardia > 0) {
        const guardiaModificada = guardia + perforacion;
        if (guardiaModificada <= 6) {
          guardia_roll = calcularRoll(wounds, guardiaModificada);
          wounds -= (guardia_roll.normales + guardia_roll.criticos);
        }
      }
      
      damage_final = (wounds + mortal_wound) * damage;

      // 4. Aplicar salvaguardia
      if (salvaguardia > 0) {
        salvaguardia_roll = calcularRoll(wounds, salvaguardia);
        damage_final -= (salvaguardia_roll.normales + salvaguardia_roll.criticos);
      }

      const dañoPerfil = damage_final;
      dañoTotal += dañoPerfil;

      // 5. Guardar resultados
      desglosePerfiles.push({
        name: perfil.name || perfil.nombre || 'Sin nombre',
        total_attacks: round2(totalAtaques),
        normal_hits: round2(hits_roll.normales),
        critical_hits: round2(hits_roll.criticos),
        total_hits: round2(hits_roll.normales + hits_roll.criticos),
        wounds: round2(wounds),
        mortal_wound: round2(mortal_wound),
        damage_final: round2(damage_final),
      });
    }

    return {
      damage_final: round2(dañoTotal),
      enemy_wounds: enemy_wounds,
      desglose_perfiles: desglosePerfiles,
    };
  } catch (error) {
    throw error;
  }
};