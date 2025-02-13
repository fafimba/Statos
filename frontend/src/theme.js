import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  colors: {
    background: '#1a1d24',
    surface: '#1e2128',
    primary: '#ffd700',
    secondary: '#8b734b',
    text: {
      primary: '#ffffff',
      secondary: '#8b8b8b',
      gold: '#ffd700'
    },
    border: 'rgba(255, 215, 0, 0.2)'
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#13151a',
      paper: '#242424',
      darker: '#161616',
    },
    primary: {
      main: '#ffd700',
      dark: '#b39700',
      light: '#ffe14d',
      blue: '#00e5ff',
    },
    secondary: {
      main: '#00e5ff',
      dark: '#005c69',
      light: '#00e5ff',
      
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      stats: '#8a8a8a',
      damage: '#ffd700',
      blue: '#00e5ff'

    },
    ability: {
      offensive: {
        background: '#ff75a3',
        backgroundActive: '#ff75a3',
        border: '#ff75a3',
        borderActive: '#ff75a3',

      },
      defensive: {
        background: '#4dd0e1',
        backgroundActive: '#4dd0e1',
        border: '#4dd0e1',
        borderActive: '#4dd0e1',
      },
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    custom: {
      statBadge: {
        background: '#2a2a2a',
        border: '#3a3a3a',
      },
      damageBar: {
        background: 'rgba(255, 215, 0, 0.15)',
        fill: '#00e5ff',
      }
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          borderRadius: '4px',
          border: '1px solid #2a2a2a',
          '&:hover': {
            borderColor: '#3a3a3a',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 7,
        },
        thumb: {
          backgroundColor: '#ffd700',
        },
        track: {
          backgroundColor: '#404040',
          '.Mui-checked.Mui-checked + &': {
            backgroundColor: 'rgba(255, 215, 0, 0.3)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#242424',
          '&:hover': {
            backgroundColor: '#2a2a2a',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#2a2a2a',
          },
          '&.Mui-selected': {
            backgroundColor: '#333333',
            '&:hover': {
              backgroundColor: '#383838',
            },
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    stats: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    damage: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#ffd700',
    },
  },
}); 