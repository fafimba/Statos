import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { armies } from '../data/armies';

// Verificar que los datos se están cargando
console.log('Armies loaded:', armies);

const ArmyComparisonContext = createContext();

// Funciones auxiliares para localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function ArmyComparisonProvider({ children }) {
  // Estados base
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState(() => 
    loadFromStorage('selectedEjercitoAtacante', Object.keys(armies)[0] || '')
  );
  
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState(() => 
    loadFromStorage('selectedEjercitoDefensor', Object.keys(armies)[0] || '')
  );

  // Memoizar las unidades ordenadas
  const unidadesAtacantesOrdenadas = useMemo(() => {
    if (selectedEjercitoAtacante && armies[selectedEjercitoAtacante]) {
      return Object.entries(armies[selectedEjercitoAtacante].units || {});
    }
    return [];
  }, [selectedEjercitoAtacante]);

  const unidadesDefensorasOrdenadas = useMemo(() => {
    if (selectedEjercitoDefensor && armies[selectedEjercitoDefensor]) {
      return Object.entries(armies[selectedEjercitoDefensor].units || {});
    }
    return [];
  }, [selectedEjercitoDefensor]);
  
  const [perfilesActivos, setPerfilesActivos] = useState(() => {
    const storedPerfiles = loadFromStorage('perfilesActivos', null);
    if (storedPerfiles) return storedPerfiles;

    const perfilesInicialesActivos = {};
    Object.values(armies).forEach(army => {
      Object.entries(army.units || {}).forEach(([nombreUnidad, unidad]) => {
        const key = `${nombreUnidad}_atacante`;
        const keyDefensor = `${nombreUnidad}_defensor`;
        perfilesInicialesActivos[key] = Object.fromEntries(
          (unidad.attack_profiles || []).map(p => [p.name, true])
        );
        perfilesInicialesActivos[keyDefensor] = Object.fromEntries(
          (unidad.attack_profiles || []).map(p => [p.name, true])
        );
      });
    });
    return perfilesInicialesActivos;
  });

  // Guardar cambios en localStorage de manera optimizada
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveToStorage('selectedEjercitoAtacante', selectedEjercitoAtacante);
      saveToStorage('selectedEjercitoDefensor', selectedEjercitoDefensor);
      saveToStorage('perfilesActivos', perfilesActivos);
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(saveTimeout);
  }, [selectedEjercitoAtacante, selectedEjercitoDefensor, perfilesActivos]);

  const value = useMemo(() => ({
    selectedEjercitoAtacante,
    setSelectedEjercitoAtacante,
    selectedEjercitoDefensor,
    setSelectedEjercitoDefensor,
    unidadesAtacantesOrdenadas,
    unidadesDefensorasOrdenadas,
    perfilesActivos,
    setPerfilesActivos
  }), [
    selectedEjercitoAtacante,
    selectedEjercitoDefensor,
    unidadesAtacantesOrdenadas,
    unidadesDefensorasOrdenadas,
    perfilesActivos
  ]);

  return (
    <ArmyComparisonContext.Provider value={value}>
      {children}
    </ArmyComparisonContext.Provider>
  );
}

export function useArmyComparison() {
  const context = useContext(ArmyComparisonContext);
  if (!context) {
    throw new Error('useArmyComparison must be used within an ArmyComparisonProvider');
  }
  return context;
} 