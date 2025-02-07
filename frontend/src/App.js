import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Calculadora from './components/Calculadora';
import ComparacionEjercitos from './components/ComparacionEjercitos';
import NavigationBar from './components/NavigationBar';
import { CalculatorProvider } from './context/CalculatorContext';
import { ArmyComparisonProvider } from './context/ArmyComparisonContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Crear tema oscuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CalculatorProvider>
        <ArmyComparisonProvider>
          <Router>
            <Box sx={{ 
              minHeight: '100vh',
              backgroundColor: '#121212'
            }}>
              <NavigationBar />
              <Routes>
                <Route path="/" element={<Calculadora />} />
                <Route path="/compare" element={<ComparacionEjercitos />} />
              </Routes>
            </Box>
          </Router>
        </ArmyComparisonProvider>
      </CalculatorProvider>
    </ThemeProvider>
  );
}

export default App; 