import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const calcularValorMedio = (valor) => {
  if (typeof valor === 'string') {
    const match = valor.toUpperCase().match(/D(\d+)/);
    if (match) {
      const caras = parseInt(match[1]);
      return `Average: ${((caras + 1) / 2).toFixed(1)}`;
    }
  }
  return null;
};

const StatBox = React.memo(({ 
  label, 
  value, 
  color = '#90caf9',
  backgroundColor = 'rgba(255, 255, 255, 0.05)'
}) => {
  const valorMedio = calcularValorMedio(value);

  const contenido = (
    <Box sx={{ 
      textAlign: 'center', 
      backgroundColor,
      borderRadius: 1, 
      p: 1,
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)'
      }
    }}>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          display: 'block',
          mb: 0.5 
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color,
          fontWeight: 'medium'
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return valorMedio ? (
    <Tooltip title={valorMedio} arrow>
      {contenido}
    </Tooltip>
  ) : contenido;
});

export default StatBox; 