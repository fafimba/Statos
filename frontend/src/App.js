import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Calculadora from './components/Calculadora';
import ComparacionEjercitos from './components/ComparacionEjercitos';
import Navigation from './components/Navigation';
import { Box, Typography } from '@mui/material';

function App() {
  const [armies, setArmies] = useState(null);
  const [attackingArmy, setAttackingArmy] = useState('');
  const [defendingArmy, setDefendingArmy] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArmies = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/armies');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArmies(data);
        const firstArmy = Object.keys(data)[0];
        setAttackingArmy(firstArmy);
        setDefendingArmy(firstArmy);
      } catch (error) {
        console.error('Error loading armies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArmies();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route exact path="/" element={<Calculadora />} />
          <Route 
            path="/ejercitos" 
            element={
              isLoading ? (
                <Box sx={{ p: 3 }}>
                  <Typography>Cargando ejércitos...</Typography>
                </Box>
              ) : (
                <ComparacionEjercitos 
                  ejercitos={armies}
                  ejercitoAtacante={attackingArmy}
                  ejercitoDefensor={defendingArmy}
                />
              )
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 