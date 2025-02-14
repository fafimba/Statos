import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ComparacionEjercitos from './components/ComparacionEjercitos';
import { theme } from './theme';
import AbilityTester from './pages/AbilityTester';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{
          minHeight: '100vh',
          background: `
            linear-gradient(180deg, #121212 0%, #1a1a1a 100%)
          `,
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%),
              radial-gradient(circle at 0% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }
        }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/spearhead" element={<ComparacionEjercitos />} />
            <Route path="/ability-tester" element={<AbilityTester />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 