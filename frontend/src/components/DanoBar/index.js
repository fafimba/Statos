import { Box, Typography, IconButton } from '@mui/material';
import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

const HabilidadItem = ({ habilidad, tipo }) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box sx={{
        flex: 1,
        backgroundColor: tipo === 'ofensivas' ? 'rgba(0,207,200,0.1)' : 'rgba(255,77,77,0.1)',
        borderRadius: '4px',
        p: 0.5,
        fontSize: '0.75rem'
      }}>
        {habilidad.name}
      </Box>
      <IconButton
        size="small"
        title={habilidad.description}
        sx={{ 
          p: 0.5,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <InfoIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Box>
  );
};

const HabilidadesList = ({ habilidades, tipo }) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      minWidth: '120px'
    }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: tipo === 'ofensivas' ? 'primary.main' : '#ff4d4d',
          fontWeight: 500,
          opacity: 0.8
        }}
      >
        {tipo === 'ofensivas' ? 'Ofensivas' : 'Defensivas'}
      </Typography>
      {habilidades.map(hab => (
        <HabilidadItem 
          key={hab.name}
          habilidad={hab}
          tipo={tipo}
        />
      ))}
    </Box>
  );
};

export const VidaBar = ({ unidadOponente, porcentajeVidaTotal }) => {
  console.log("unidadOponente", unidadOponente);
  console.log("porcentajeVidaTotal", porcentajeVidaTotal);
  return (
    <Box sx={{
      position: 'relative',
      width: `${Math.min(100, unidadOponente.models * unidadOponente.wounds * 5.6)}%`,
      height: '8px',
      maskImage: `
        repeating-linear-gradient(
          to right,
          transparent 0px,
          transparent 3px,
          white 0,
          white ${100 / (unidadOponente.models)}%
        )`,
      backgroundRepeat: 'no-repeat',
    }}>
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        maskImage: `
          repeating-linear-gradient(
            to right,
            transparent 0px,
            transparent 1.5px,
            white 0,
            white ${100 / (unidadOponente.models * unidadOponente.wounds)}%
          )`,
        backgroundRepeat: 'no-repeat',
      }}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'secondary.dark',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: `${porcentajeVidaTotal}%`,
            height: '100%',
            backgroundColor: 'primary.main',
            transition: 'width 0.5s ease'
          }}
        />
      </Box>
    </Box>
  );
};

export const DanoBar = ({ unidadOponente, danoFinal, porcentajeVidaTotal, habilidades }) => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { 
        xs: '1fr',  // Móvil: una columna
        sm: '250px 1fr auto'  // Desktop: tres columnas
      },
      gap: 1,
      p: 1.5,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.25)',
      }
    }}>
      {/* Nombre y stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle2">
          {unidadOponente.name}
        </Typography>
      </Box>

      {/* Daño y barra */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: danoFinal >= 10 ? '#ff4d4d' : danoFinal >= 8 ? 'primary.main' : 'text.primary',
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          {danoFinal.toFixed(1)}
        </Typography>
        <VidaBar {...{ unidadOponente, porcentajeVidaTotal }} />
      </Box>

      {/* Habilidades en dos columnas */}
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end'
      }}>
        {habilidades?.ofensivas?.length > 0 && (
          <HabilidadesList 
            habilidades={habilidades.ofensivas} 
            tipo="ofensivas"
          />
        )}
        {habilidades?.defensivas?.length > 0 && (
          <HabilidadesList 
            habilidades={habilidades.defensivas} 
            tipo="defensivas"
          />
        )}
      </Box>
    </Box>
  );
};

export default DanoBar; 