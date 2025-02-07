import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CalculateIcon from '@mui/icons-material/Calculate';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCompareClick = () => {
    // Limpiar el state de la navegación para evitar problemas
    navigate('/compare', { replace: true });
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
          <Button
            color="inherit"
            startIcon={<CalculateIcon />}
            onClick={() => navigate('/')}
            sx={{
              borderBottom: location.pathname === '/' ? '2px solid #ffd700' : 'none',
              borderRadius: 0,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Calculator
          </Button>
          <Button
            color="inherit"
            startIcon={<CompareArrowsIcon />}
            onClick={handleCompareClick}
            sx={{
              borderBottom: location.pathname === '/compare' ? '2px solid #ffd700' : 'none',
              borderRadius: 0,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Army Compare
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar; 