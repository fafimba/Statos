import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import ComparacionEjercitos from './components/ComparacionEjercitos/index.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: '#1e293b',
      darker: '#0d1424',    // Para fondos más oscuros
      lighter: '#334155'    // Para fondos más claros
    },
    primary: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0284c7'
    },
    secondary: {
      main: '#818cf8'
    },
    success: {
      main: '#34d399',
      light: 'rgba(52, 211, 153, 0.2)',  // Para fondos de éxito
      dark: '#059669'
    },
    error: {
      main: '#fb7185',
      light: 'rgba(251, 113, 133, 0.2)', // Para fondos de error
      dark: '#e11d48'
    },
    warning: {
      main: '#fbbf24'
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8'
    },
    action: {
      hover: 'rgba(255, 255, 255, 0.05)',
      selected: 'rgba(255, 255, 255, 0.08)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)'
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    custom: {
      statBackground: 'rgba(0, 0, 0, 0.2)',     // Fondo para stats
      cardHoverBg: 'rgba(144, 202, 249, 0.05)', // Hover de las cards
      inputBackground: 'rgba(0, 0, 0, 0.2)',    // Fondo para inputs
      tooltipBackground: '#1a1a1a',             // Fondo para tooltips
      progressBarBg: 'rgba(144, 202, 249, 0.1)', // Fondo para barras de progreso
      hoverSuccess: 'rgba(144, 238, 144, 0.3)',
      borderSuccess: 'rgba(144, 238, 144, 0.6)',
      hoverError: 'rgba(255, 99, 71, 0.3)',
      borderError: 'rgba(255, 99, 71, 0.6)',
      statText: '#fff',  // Para el texto de los stats
      statValue: '#fff', // Para los valores de los stats
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          scrollbarColor: '#1e293b #0f172a',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#0f172a',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#1e293b',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#334155',
            },
          },
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: { xs: 1, sm: 2, md: 3 }
      }}>
        <ComparacionEjercitos />
      </Box>
    </ThemeProvider>
  );
}

export default App; 