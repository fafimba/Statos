import { useState, useCallback, useMemo } from 'react';

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
    
    // Procesar habilidades de unidad atacante
    if (unidadAtacante?.abilities && Array.isArray(unidadAtacante.abilities)) {
      unidadAtacante.abilities.forEach(ability => {
        if (ability.category === 'offensive') {
          ofensivas.push({
            id: `${unidadAtacante.name}_${ability.name}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            effect: ability.effect,
            profile: ability.profile,
            source: 'unit'
          });
        }
      });
    }
    
    // Procesar habilidades de unidad defensora
    if (unidadDefensora?.abilities && Array.isArray(unidadDefensora.abilities)) {
      unidadDefensora.abilities.forEach(ability => {
        if (ability.category === 'defensive') {
          defensivas.push({
            id: `${unidadDefensora.name}_${ability.name}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            effect: ability.effect,
            profile: ability.profile,
            source: 'unit'
          });
        }
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

export default useHabilidades; 