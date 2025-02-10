import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import ComparacionEjercitos from './components/ComparacionEjercitos/index.js';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: '#161616',
        backgroundImage: `
          linear-gradient(to bottom, 
            rgba(26, 26, 26, 0.8) 0%,
            rgba(22, 22, 22, 1) 100%
          )
        `,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        p: { xs: 1, sm: 2, md: 3 },
        display: 'flex',
        overflow: 'auto',
      }}>
        <ComparacionEjercitos />
      </Box>
    </ThemeProvider>
  );
}

export default App; 