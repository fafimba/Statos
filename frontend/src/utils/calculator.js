import { weapon_abilities } from '../data/weapon_abilities';

// Función para calcular la probabilidad de éxito
const calcularProbabilidad = (objetivo) => {
  const exitosPosibles = 7 - Math.max(1, Math.min(6, objetivo));
  return Math.max(0, exitosPosibles / 6);
};

// Función auxiliar para redondear a 2 decimales
const round2 = (num) => {
  return Math.round(num * 100) / 100;
};

// Función para calcular el valor medio de un dado
const calcularValorDado = (dado) => {
  if (typeof dado === 'number') return dado;
  if (typeof dado === 'string') {
    // Manejar notación de dados (D3, D6, etc)
    const match = dado.toUpperCase().match(/D(\d+)/);
    if (match) {
      const caras = parseInt(match[1]);
      return (caras + 1) / 2; // Valor medio del dado
    }
  }
  return 0;
};

export const calculateAttacks = ({ perfiles_ataque, miniaturas, guardia, salvaguardia, _save_override }) => {
  try {
    const perfilesAtaque = perfiles_ataque || [];
    const numMiniaturas = parseInt(miniaturas || 0);
    const valorGuardia = parseInt(guardia || 0);
    const valorSalvaguardia = parseInt(salvaguardia || 0);

    let dañoTotal = 0;
    const desglosePerfiles = [];

    for (const perfil of perfilesAtaque) {
      // Obtener habilidades críticas
      const habilidadesCriticas = (perfil.abilities || [])
        .map(abilityId => weapon_abilities[abilityId])
        .filter(ability => ability?.effect?.type === 'critical');

      // Calcular ataques considerando dados
      const ataquesPorModelo = calcularValorDado(perfil.attacks || perfil.ataques || 0);
      const totalAtaques = numMiniaturas * ataquesPorModelo;

      // Calcular probabilidades de impacto
      const probHit = calcularProbabilidad(perfil.hit);
      const probCrit = 1/6; // Probabilidad de crítico (6+)
      const probNormalHit = probHit - probCrit;

      // Calcular hits totales considerando críticos
      let hitsNormales = totalAtaques * probNormalHit;
      let hitsCriticos = totalAtaques * probCrit;

      // Aplicar efectos de críticos
      habilidadesCriticas.forEach(habilidad => {
        if (habilidad.effect.damage_type === 'hits') {
          // Para habilidades que dan hits extra en críticos
          hitsCriticos *= habilidad.effect.value;
        }
      });

      const totalHits = hitsNormales + hitsCriticos;

      const hit = parseInt(perfil.hit || 0);
      const wound = parseInt(perfil.wound || 0);
      const damage = parseInt(perfil.damage || 0);
      const perforacion = parseInt(perfil.rend || perfil.perforacion || 0);
      const tipoCritico = perfil.crit_type || perfil.tipo_critico || 'ninguno';

      // Usar la salvación modificada si existe
      const guardiaEfectiva = perfil._save_override || valorGuardia;

      // Probabilidad de hit crítico y normal
      const hitsCriticosProb = hitsCriticos / totalHits;
      const hitsNormalesProb = hitsNormales / totalHits;

      // Inicializar variables para daño
      let damageMortal = 0;
      let damageNormal = 0;

      if (tipoCritico === 'mortal') {
        damageMortal = hitsCriticosProb * damage;
        let probFallarSalva = 1;
        if (valorSalvaguardia > 0) {
          probFallarSalva = 1 - calcularProbabilidad(valorSalvaguardia);
          damageMortal = damageMortal * probFallarSalva;
        }

        const woundsNormales = hitsNormalesProb * calcularProbabilidad(wound);
        let woundsTrasGuardia = 0;
        if (guardiaEfectiva > 0) {
          const guardiaModificada = guardiaEfectiva + perforacion;
          if (guardiaModificada > 6) {
            woundsTrasGuardia = woundsNormales;
          } else {
            const probFallarGuardia = 1 - calcularProbabilidad(guardiaModificada);
            woundsTrasGuardia = woundsNormales * probFallarGuardia;
          }
        } else {
          woundsTrasGuardia = woundsNormales;
        }

        damageNormal = woundsTrasGuardia * damage;
        if (valorSalvaguardia > 0) {
          damageNormal = damageNormal * probFallarSalva;
        }
      } else {
        let woundsEsperados = 0;
        if (tipoCritico === 'auto_wound') {
          woundsEsperados = (hitsNormalesProb * calcularProbabilidad(wound)) + hitsCriticosProb;
        } else {
          woundsEsperados = totalHits * calcularProbabilidad(wound);
        }

        let woundsTrasGuardia = 0;
        if (guardiaEfectiva > 0) {
          const guardiaModificada = guardiaEfectiva + perforacion;
          if (guardiaModificada > 6) {
            woundsTrasGuardia = woundsEsperados;
          } else {
            const probFallarGuardia = 1 - calcularProbabilidad(guardiaModificada);
            woundsTrasGuardia = woundsEsperados * probFallarGuardia;
          }
        } else {
          woundsTrasGuardia = woundsEsperados;
        }

        let damageFinal = woundsTrasGuardia * damage;
        if (valorSalvaguardia > 0) {
          const probFallarSalva = 1 - calcularProbabilidad(valorSalvaguardia);
          damageFinal = damageFinal * probFallarSalva;
        }
        damageNormal = damageFinal;
      }

      const dañoPerfil = damageNormal + damageMortal;
      dañoTotal += dañoPerfil;

      desglosePerfiles.push({
        name: perfil.name || perfil.nombre || 'Sin nombre',
        total_attacks: totalAtaques,
        normal_hits: round2(hitsNormales),
        critical_hits: round2(hitsCriticos),
        total_hits: round2(totalHits),
        damage_final: round2(dañoPerfil),
        mortal_damage: round2(damageMortal),
        normal_damage: round2(damageNormal)
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