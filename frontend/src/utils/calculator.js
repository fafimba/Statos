// Función para calcular la probabilidad de éxito
const calcularProbabilidad = (objetivo) => {
  const exitosPosibles = 7 - objetivo;
  return Math.max(0, exitosPosibles / 6);
};

// Función auxiliar para redondear a 2 decimales
const round2 = (num) => {
  return Math.round(num * 100) / 100;
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
      const ataques = parseInt(perfil.attacks || perfil.ataques || 0);
      const hit = parseInt(perfil.hit || 0);
      const wound = parseInt(perfil.wound || 0);
      const damage = parseInt(perfil.damage || 0);
      const perforacion = parseInt(perfil.rend || perfil.perforacion || 0);
      const tipoCritico = perfil.crit_type || perfil.tipo_critico || 'ninguno';

      // Usar la salvación modificada si existe
      const guardiaEfectiva = perfil._save_override || valorGuardia;

      // Cálculo total de ataques para este perfil
      const totalAtaques = numMiniaturas * ataques;

      // Probabilidad de hit crítico y normal
      const hitsCriticos = totalAtaques * (1 / 6);
      const probHitNormal = Math.max(0, (7 - hit) - 1) / 6;
      const hitsNormales = totalAtaques * probHitNormal;

      // Inicializar variables para daño
      let damageMortal = 0;
      let damageNormal = 0;

      if (tipoCritico === 'mortal') {
        damageMortal = hitsCriticos * damage;
        let probFallarSalva = 1;
        if (valorSalvaguardia > 0) {
          probFallarSalva = 1 - calcularProbabilidad(valorSalvaguardia);
          damageMortal = damageMortal * probFallarSalva;
        }

        const woundsNormales = hitsNormales * calcularProbabilidad(wound);
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
        let hitsTotales = 0;
        if (tipoCritico === 'two_hits' || tipoCritico === 'dos_hits') {
          hitsTotales = hitsNormales + (hitsCriticos * 2);
        } else {
          hitsTotales = hitsNormales + hitsCriticos;
        }

        let woundsEsperados = 0;
        if (tipoCritico === 'auto_wound') {
          woundsEsperados = (hitsNormales * calcularProbabilidad(wound)) + hitsCriticos;
        } else {
          woundsEsperados = hitsTotales * calcularProbabilidad(wound);
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
        total_hits: round2(hitsNormales + hitsCriticos),
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