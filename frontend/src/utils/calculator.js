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

export const calcularMortalesConDados = ({ cantidad, tipoDado, dificultad, salvaguardia, multiplicador = 1 }) => {
  console.log('Inputs:', { cantidad, tipoDado, dificultad, salvaguardia });

  // 1. Calcular probabilidad de éxito en la tirada según el tipo de dado
  let probExito;
  if (tipoDado === 'd3') {
    // Para D3, calculamos cuántos números superan o igualan la dificultad
    const exitosPosibles = 4 - Math.max(1, Math.min(3, dificultad));
    probExito = exitosPosibles / 3;
  } else {
    // Para D6 (por defecto)
    const exitosPosibles = 7 - Math.max(1, Math.min(6, dificultad));
    probExito = exitosPosibles / 6;
  }
  console.log('Probabilidad de éxito:', probExito);
  
  // 2. Calcular media de mortales (1 mortal por cada éxito)
  const mortalesBase = cantidad * probExito;
  console.log('Mortales base:', mortalesBase);

  // 3. Aplicar salvaguardia si existe
  if (salvaguardia > 0) {
    const probFallarSalva = 1 - calcularProbabilidad(salvaguardia);
    console.log('Probabilidad fallar salvaguardia:', probFallarSalva);
    const resultado = mortalesBase * probFallarSalva;
    console.log('Resultado final con salvaguardia:', resultado);
    return resultado * multiplicador;
  }

  console.log('Resultado final sin salvaguardia:', mortalesBase);
  return mortalesBase;
};

// Función principal
export const calculateAttacks = ({ perfiles_ataque, miniaturas, guardia, salvaguardia, _save_override, wounds_modificado }) => {
  try {
    const perfilesAtaque = perfiles_ataque || [];
    const numMiniaturas = parseInt(miniaturas || 0);
    const valorGuardia = parseInt(guardia || 0);
    const valorSalvaguardia = parseInt(salvaguardia || 0);
    const guardiaEfectiva = _save_override || valorGuardia;
    const woundsEfectivas = wounds_modificado || 0;

    let dañoTotal = 0;
    const desglosePerfiles = [];

    for (const perfil of perfilesAtaque) {
      // 1. Preparar datos básicos
      const ataquesPorModelo = calcularValorDado(perfil.attacks || perfil.ataques || 0);
      const totalAtaques = numMiniaturas * ataquesPorModelo;
      const hit = parseInt(perfil.hit || 0);
      const wound = parseInt(perfil.wound || 0);
      const damage = calcularValorDado(perfil.damage || 0);
      const perforacion = parseInt(perfil.rend || perfil.perforacion || 0);
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

      if (tipoCritico === 'mortal_wound') {
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
      desglose_perfiles: desglosePerfiles,
      wounds: woundsEfectivas
    };
  } catch (error) {
    throw error;
  }
};