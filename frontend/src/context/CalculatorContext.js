import React, { createContext, useState, useContext } from 'react';

const CalculatorContext = createContext();

export function CalculatorProvider({ children }) {
  const [calculatorData, setCalculatorData] = useState({
    models: '5',
    attacks_per_model: '1',
    hit: '3',
    wound: '3',
    damage: '1',
    rend: '0',
    crit_type: 'none',
    save: '-',
    ward: '-'
  });

  return (
    <CalculatorContext.Provider value={{ calculatorData, setCalculatorData }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  return useContext(CalculatorContext);
} 