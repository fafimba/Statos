import { useState, useCallback, useMemo } from 'react';
import { weapon_abilities } from '../data/weapon_abilities';

export const useHabilidades = (unidad, perfil = null) => {
  // Estado para las habilidades activas
  const [habilidadesActivas, setHabilidadesActivas] = useState({});
  
  // Determinar qué habilidades están disponibles
  const habilidadesDisponibles = useMemo(() => {
    const habilidades = [];
    
    // Añadir habilidad de unidad si existe
    if (unidad?.ability) {
      habilidades.push({
        id: `unit_${unidad.ability.name}`,
        name: unidad.ability.name,
        description: unidad.ability.description,
        type: unidad.ability.type,
        effect: unidad.ability.effect,
        source: 'unit'
      });
    }
    
    // Añadir habilidades de perfil si existe
    if (perfil?.abilities) {
      perfil.abilities.forEach(abilityId => {
        const ability = weapon_abilities[abilityId];
        if (ability) {
          habilidades.push({
            id: `weapon_${abilityId}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            effect: ability.effect,
            source: 'weapon'
          });
        }
      });
    }
    
    return habilidades;
  }, [unidad, perfil]);

  // Evaluar si una habilidad cumple sus condiciones
  const evaluarCondicion = useCallback((habilidad, objetivo) => {
    if (!habilidad?.effect?.condition) return true;
    
    const { type, property, value } = habilidad.effect.condition;
    
    switch (type) {
      case 'enemy_unit':
        return objetivo?.tags?.includes(value) || false;
      case 'enemy_weapon':
        return objetivo?.attack_profiles?.[0]?.[property] === value;
      case 'enemy_models':
        if (!objetivo?.models) return false;
        const numModels = parseInt(objetivo.models);
        const condition = value.split(' ');
        switch(condition[0]) {
          case '>=': return numModels >= parseInt(condition[1]);
          case '<=': return numModels <= parseInt(condition[1]);
          case '>': return numModels > parseInt(condition[1]);
          case '<': return numModels < parseInt(condition[1]);
          default: return numModels === parseInt(condition[1]);
        }
      default:
        return false;
    }
  }, []);

  // Obtener modificadores activos
  const getModificadoresActivos = useCallback((objetivo) => {
    if (!objetivo) return [];
    
    return habilidadesDisponibles
      .filter(habilidad => 
        habilidad.type === 'fixed' || 
        (habilidad.type === 'toggleable' && habilidadesActivas[habilidad.id])
      )
      .filter(habilidad => evaluarCondicion(habilidad, objetivo));
  }, [habilidadesDisponibles, habilidadesActivas, evaluarCondicion]);

  // Toggle de habilidad
  const toggleHabilidad = useCallback((habilidadId) => {
    setHabilidadesActivas(prev => ({
      ...prev,
      [habilidadId]: !prev[habilidadId]
    }));
  }, []);

  return {
    habilidadesDisponibles,
    habilidadesActivas,
    toggleHabilidad,
    getModificadoresActivos
  };
}; 