import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import ComparacionEjercitos from './components/ComparacionEjercitos/index.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1e2c',
      paper: '#2a3040'
    },
    primary: {
      main: '#90caf9'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1a1e2c',
          color: '#fff'
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#1a1e2c',
        p: { xs: 1, sm: 2, md: 3 }
      }}>
        <ComparacionEjercitos />
      </Box>
    </ThemeProvider>
  );
}

export default App; 