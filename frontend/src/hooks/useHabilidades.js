import { useState, useCallback, useMemo } from 'react';
import { weapon_abilities } from '../data/weapon_abilities';

export const useHabilidades = (unidadAtacante, unidadDefensora) => {
  // Estado para las habilidades activas
  const [habilidadesActivas, setHabilidadesActivas] = useState({
    ofensivas: {},
    defensivas: {}
  });
  
  // Determinar qué habilidades están disponibles
  const habilidades = useMemo(() => {
    const ofensivas = [];
    const defensivas = [];
    
    // Procesar habilidad de unidad atacante
    if (unidadAtacante?.ability && unidadAtacante.ability.category === 'offensive') {
      ofensivas.push({
        id: `${unidadAtacante.name}_${unidadAtacante.ability.name}`,
        name: unidadAtacante.ability.name,
        description: unidadAtacante.ability.description,
        type: unidadAtacante.ability.type,
        effect: unidadAtacante.ability.effect,
        source: 'unit'
      });
    }
    
    // Procesar habilidad de unidad defensora
    if (unidadDefensora?.ability && unidadDefensora.ability.category === 'defensive') {
      defensivas.push({
        id: `${unidadDefensora.name}_${unidadDefensora.ability.name}`,
        name: unidadDefensora.ability.name,
        description: unidadDefensora.ability.description,
        type: unidadDefensora.ability.type,
        effect: unidadDefensora.ability.effect,
        source: 'unit'
      });
    }
    
    return { ofensivas, defensivas };
  }, [unidadAtacante, unidadDefensora]);

  // Toggle para habilidad ofensiva
  const toggleHabilidadOfensiva = useCallback((habilidadId) => {
    setHabilidadesActivas(prev => ({
      ...prev,
      ofensivas: {
        ...prev.ofensivas,
        [habilidadId]: !prev.ofensivas[habilidadId]
      }
    }));
  }, []);

  // Toggle para habilidad defensiva
  const toggleHabilidadDefensiva = useCallback((habilidadId) => {
    setHabilidadesActivas(prev => ({
      ...prev,
      defensivas: {
        ...prev.defensivas,
        [habilidadId]: !prev.defensivas[habilidadId]
      }
    }));
  }, []);

  // Obtener estado de una habilidad
  const getHabilidadActiva = useCallback((tipo, habilidadId) => {
    return habilidadesActivas[tipo][habilidadId] || false;
  }, [habilidadesActivas]);

  return {
    habilidades,
    habilidadesActivas,
    toggleHabilidadOfensiva,
    toggleHabilidadDefensiva,
    getHabilidadActiva
  };
}; 