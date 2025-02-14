import { useState, useCallback, useMemo } from 'react';
import { weapon_abilities } from '../../../data/weapon_abilities';

export const useAttackProfiles = (unidad) => {
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
  const modificarPerfil = useCallback((nombrePerfil, tipo, valor) => {
    if (tipo === 'active') {
      setPerfilesActivos(prev => ({
        ...prev,
        [nombrePerfil]: valor
      }));
    } else {
      setHabilidadesPerfiles(prev => ({
        ...prev,
        [nombrePerfil]: {
          ...prev[nombrePerfil],
          [tipo]: valor
        }
      }));
    }
  }, []);

  // Obtener habilidades de unidad
  const habilidadesUnidad = useMemo(() => {
    if (!unidad?.abilities) return [];
    return unidad.abilities.filter(Boolean);
  }, [unidad]);

  return {
    perfilesActivos,
    setPerfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
    habilidadesUnidad
  };
};

export default useAttackProfiles; 