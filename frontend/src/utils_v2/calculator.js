const round2 = (num) => Math.round(num * 100) / 100;

const calcularProbabilidad = (valor) => {
  return Math.max(0, (7 - valor)) / 6;
};

export const calculateAttacks = ({
  perfiles_ataque,
  miniaturas,
  guardia,
  salvaguardia
}) => {
  try {
    // Referencia al código original en frontend/src/utils/calculator.js
    // startLine: 12
    // endLine: 130

    const perfilesAtaque = perfiles_ataque || [];
    const numMiniaturas = parseInt(miniaturas || 0);
    const valorGuardia = parseInt(guardia || 0);
    const valorSalvaguardia = parseInt(salvaguardia || 0);

    let dañoTotal = 0;
    const desglosePerfiles = [];

    for (const perfil of perfilesAtaque) {
      const ataques = parseInt(perfil.attacks || 0);
      const hit = parseInt(perfil.hit || 0);
      const wound = parseInt(perfil.wound || 0);
      const damage = parseInt(perfil.damage || 0);
      const perforacion = parseInt(perfil.rend || 0);
      const tipoCritico = perfil.crit_type || 'ninguno';

      const guardiaEfectiva = perfil._save_override || valorGuardia;
      const totalAtaques = numMiniaturas * ataques;

      const hitsCriticos = totalAtaques * (1 / 6);
      const probHitNormal = Math.max(0, (7 - hit) - 1) / 6;
      const hitsNormales = totalAtaques * probHitNormal;

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
        const woundsNormales = (hitsNormales + hitsCriticos) * calcularProbabilidad(wound);
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
          const probFallarSalva = 1 - calcularProbabilidad(valorSalvaguardia);
          damageNormal = damageNormal * probFallarSalva;
        }
      }

      const dañoPerfil = damageNormal + damageMortal;
      dañoTotal += dañoPerfil;

      desglosePerfiles.push({
        name: perfil.name,
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