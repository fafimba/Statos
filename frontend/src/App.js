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
        backgroundColor: theme.colors.background,
        backgroundImage: `
          linear-gradient(to bottom, 
            rgba(30, 33, 40, 0.29) 0%,
            rgba(19, 21, 26, 0.8) 100%
          )
        `,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.05) 0%, transparent 75%)',
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