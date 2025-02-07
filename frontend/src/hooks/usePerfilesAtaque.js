import { useState, useCallback, useMemo } from 'react';
import { useHabilidades } from './useHabilidades';
import { weapon_abilities } from '../data/weapon_abilities';

export const usePerfilesAtaque = (unidad) => {
  // Estado para perfiles activos
  const [perfilesActivos, setPerfilesActivos] = useState(() => {
    if (!unidad?.attack_profiles) return {};
    return unidad.attack_profiles.reduce((acc, perfil) => ({
      ...acc,
      [perfil.name]: true
    }), {});
  });

  // Estado para habilidades de perfiles
  const [habilidadesPerfiles, setHabilidadesPerfiles] = useState(() => {
    if (!unidad?.attack_profiles) return {};
    
    return unidad.attack_profiles.reduce((acc, perfil) => {
      const habilidades = perfil.abilities || [];
      const habilidadesToggleables = habilidades.reduce((habAcc, hab) => {
        const habilidadConfig = weapon_abilities[hab];
        if (habilidadConfig?.type === 'toggleable') {
          return {
            ...habAcc,
            [hab]: false // Inicialmente desactivadas
          };
        }
        return habAcc;
      }, {});

      return {
        ...acc,
        [perfil.name]: habilidadesToggleables
      };
    }, {});
  });

  // Función para modificar una habilidad de perfil
  const modificarPerfil = useCallback((nombrePerfil, nombreHabilidad) => {
    console.log('Modificando habilidad:', {
      perfil: nombrePerfil,
      habilidad: nombreHabilidad,
      estadoActual: habilidadesPerfiles[nombrePerfil]?.[nombreHabilidad]
    });

    setHabilidadesPerfiles(prev => ({
      ...prev,
      [nombrePerfil]: {
        ...prev[nombrePerfil],
        [nombreHabilidad]: !prev[nombrePerfil]?.[nombreHabilidad]
      }
    }));
  }, [habilidadesPerfiles]);

  // Obtener habilidades de unidad
  const habilidadesUnidad = useMemo(() => {
    if (!unidad?.ability) return [];
    return [unidad.ability].filter(Boolean);
  }, [unidad]);

  console.log('Estado actual de perfiles:', {
    perfilesActivos,
    habilidadesPerfiles,
    habilidadesUnidad
  });

  return {
    perfilesActivos,
    setPerfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
    habilidadesUnidad
  };
};