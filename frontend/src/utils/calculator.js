import { weapon_abilities } from '../data/weapon_abilities';

// Utilities
const round2 = (num) => Math.round(num * 100) / 100;

const calcularProbabilidad = (objetivo) => {
  const exitosPosibles = 7 - Math.max(1, Math.min(6, objetivo));
  return Math.max(0, exitosPosibles / 6);
};

const calcularValorDado = (dado) => {
  if (typeof dado === 'number') return dado;
  if (typeof dado === 'string') {
    const match = dado.toUpperCase().match(/D(\d+)/);
    if (match) {
      const caras = parseInt(match[1]);
      return (caras + 1) / 2;
    }
  }
  return 0;
};

// Cálculos específicos
const calcularHits = (totalAtaques, hit) => {
  const probHit = calcularProbabilidad(hit);
  const probCrit = 1/6;
  const probNormalHit = probHit - probCrit;

  return {
    normales: totalAtaques * probNormalHit,
    criticos: totalAtaques * probCrit
  };
};

const aplicarHabilidadesCriticas = (hits, habilidades) => {
  let { normales, criticos } = hits;
  
  habilidades.forEach(habilidad => {
    if (habilidad.effect.action === 'extra_hit') {
      criticos += criticos * habilidad.effect.value;
    }
  });

  return { normales, criticos };
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

// Función principal
export const calculateAttacks = ({ perfiles_ataque, miniaturas, guardia, salvaguardia, _save_override }) => {
  try {
    console.log("perfiles_ataque en calculateAttacks", perfiles_ataque);
    const perfilesAtaque = perfiles_ataque || [];
    const numMiniaturas = parseInt(miniaturas || 0);
    const valorGuardia = parseInt(guardia || 0);
    const valorSalvaguardia = parseInt(salvaguardia || 0);
    const guardiaEfectiva = _save_override || valorGuardia;

    let dañoTotal = 0;
    const desglosePerfiles = [];

    for (const perfil of perfilesAtaque) {
      console.log("perfil en calculateAttacks", perfil);
      // 1. Preparar datos básicos
      const ataquesPorModelo = calcularValorDado(perfil.attacks || perfil.ataques || 0);
      const totalAtaques = numMiniaturas * ataquesPorModelo;
      const hit = parseInt(perfil.hit || 0);
      const wound = parseInt(perfil.wound || 0);
      const damage = calcularValorDado(perfil.damage || 0);
      const perforacion = parseInt(perfil.rend || perfil.perforacion || 0);
      console.log("perfil.abilities", perfil.abilities);
      const tipoCritico = (perfil.abilities || [])
        .map(abilityId => weapon_abilities[abilityId])
        .find(ability => ability?.effect?.type === 'critical')?.effect?.action || 
        perfil.abilities?.find(ability => ability?.effect?.type === 'critical')?.effect?.action;
      
      // 2. Calcular hits base
      let hits = calcularHits(totalAtaques, hit);

      // 3. Aplicar habilidades críticas
      const habilidadesCriticas = (perfil.abilities || [])
        .map(abilityId => weapon_abilities[abilityId])
        .filter(ability => ability?.effect?.type === 'critical');
      
      hits = aplicarHabilidadesCriticas(hits, habilidadesCriticas);

      // 4. Calcular daño según tipo de crítico
      let dañoMortal = 0;
      let dañoNormal = 0;
      console.log("!!!!!tipoCritico", tipoCritico);
      if (tipoCritico === 'mortal_wound') {
        console.log("ha entrado en mortal_wound");
        dañoMortal = calcularDañoMortal(hits, damage, valorSalvaguardia);
        dañoNormal = calcularDañoNormal({
          hits,
          wound,
          damage,
          guardia: guardiaEfectiva,
          perforacion,
          salvaguardia: valorSalvaguardia
        });
      } else if (tipoCritico === 'auto_wound') {
        dañoNormal = calcularDañoAutoWound({
          hits,
          damage,
          guardia: guardiaEfectiva,
          perforacion,
          salvaguardia: valorSalvaguardia
        });
      } else {
        dañoNormal = calcularDañoNormal({
          hits: { normales: hits.normales + hits.criticos, criticos: 0 },
          wound,
          damage,
          guardia: guardiaEfectiva,
          perforacion,
          salvaguardia: valorSalvaguardia
        });
      }

      const dañoPerfil = dañoNormal + dañoMortal;
      dañoTotal += dañoPerfil;

      // 5. Guardar resultados
      desglosePerfiles.push({
        name: perfil.name || perfil.nombre || 'Sin nombre',
        total_attacks: round2(totalAtaques),
        normal_hits: round2(hits.normales),
        critical_hits: round2(hits.criticos),
        total_hits: round2(hits.normales + hits.criticos),
        damage_final: round2(dañoPerfil),
        mortal_damage: round2(dañoMortal),
        normal_damage: round2(dañoNormal)
      });
    }

    return {
      damage_final: round2(dañoTotal),
      desglose_perfiles: desglosePerfiles
    };
  } catch (error) {
    console.error("Error in calculateAttacks:", error);
    throw error;
  }
};