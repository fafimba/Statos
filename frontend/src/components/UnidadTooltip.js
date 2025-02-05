import React from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Box,
  useTheme
} from '@mui/material';

function UnidadTooltip({ unidad, daños, mostrarDaños = false }) {
  const theme = useTheme();

  if (!unidad) return null;

  // Valores por defecto para campos que pueden faltar
  const defaultStats = {
    movimiento: '-',
    puntos_vida: '-',
    puntos_control: '-',
    habilidades: [],
    tags: []
  };

  // Combinar los valores por defecto con los datos de la unidad
  const unidadCompleta = { ...defaultStats, ...unidad };

  const stats = [
    { label: 'MOVE', value: unidadCompleta.movimiento ? `${unidadCompleta.movimiento}"` : '-' },
    { label: 'HEALTH', value: unidadCompleta.puntos_vida || '-' },
    { label: 'SAVE', value: `${unidadCompleta.salvaguardia}+` },
    { label: 'CONTROL', value: unidadCompleta.puntos_control || '-' }
  ];

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 2, 
        maxWidth: 400,
        minWidth: 350,
        bgcolor: '#1a1a1a',
        color: 'white',
        border: '2px solid #333',
        borderRadius: 2,
        '& .MuiTypography-root': {
          fontFamily: '"Roboto Condensed", "Helvetica", "Arial", sans-serif',
        }
      }}
    >
      {/* Título */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          textAlign: 'center',
          color: '#ffd700',
          borderBottom: '2px solid #333',
          pb: 1
        }}
      >
        {unidad.nombre}
      </Typography>

      {/* Stats Box */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={3} key={index}>
            <Box sx={{ 
              bgcolor: '#2a2a2a',
              border: '1px solid #444',
              p: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              transform: 'rotate(-5deg)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'rotate(0deg) scale(1.05)',
                bgcolor: '#333'
              }
            }}>
              <Typography variant="h5" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#aaa' }}>
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Weapons Table */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            bgcolor: '#2a2a2a',
            color: '#ffd700',
            p: 1,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            fontWeight: 'bold'
          }}
        >
          MELEE WEAPONS
        </Typography>
        <Box sx={{ 
          bgcolor: '#2a2a2a',
          p: 1,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4
        }}>
          <Grid container sx={{ borderBottom: '1px solid #444', pb: 0.5, mb: 1 }}>
            {['A', 'Hit', 'Wnd', 'Rnd', 'Dmg', 'Crit'].map((header, index) => (
              <Grid item xs={2} key={index} sx={{ textAlign: 'center', color: '#aaa' }}>
                {header}
              </Grid>
            ))}
          </Grid>
          <Grid container>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.ataques_por_miniatura}</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.hit}+</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.wound}+</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.perforacion}</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.damage}</Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>{unidad.tipo_critico?.charAt(0).toUpperCase()}</Grid>
          </Grid>
        </Box>
      </Box>

      {/* Abilities */}
      {unidadCompleta.habilidades && unidadCompleta.habilidades.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              bgcolor: '#8b0000',
              color: '#fff',
              p: 1,
              borderRadius: '4px 4px 0 0',
              fontWeight: 'bold'
            }}
          >
            ABILITIES
          </Typography>
          <Box sx={{ 
            bgcolor: '#2a2a2a',
            p: 1.5,
            borderRadius: '0 0 4px 4px'
          }}>
            {unidadCompleta.habilidades.map((habilidad, index) => (
              <Box key={index} sx={{ mb: index !== unidadCompleta.habilidades.length - 1 ? 2 : 0 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#ffd700',
                    fontWeight: 'bold',
                    mb: 0.5
                  }}
                >
                  {habilidad.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ddd' }}>
                  {habilidad.descripcion}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Keywords */}
      {unidadCompleta.tags && unidadCompleta.tags.length > 0 && (
        <Box sx={{ 
          bgcolor: '#2a2a2a',
          p: 1.5,
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="subtitle2" sx={{ color: '#ffd700', mb: 0.5 }}>
            KEYWORDS
          </Typography>
          <Typography variant="body2" sx={{ color: '#ddd' }}>
            {unidadCompleta.tags.join(', ')}
          </Typography>
        </Box>
      )}

      {/* Solo mostrar sección de daños si mostrarDaños es true y hay daños */}
      {mostrarDaños && daños && Object.keys(daños).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#ffd700', mb: 1 }}>
            DAÑO SIMULADO CONTRA
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(daños).map(([objetivo, daño]) => (
              <Grid item xs={12} key={objetivo}>
                <Box sx={{
                  bgcolor: '#2a2a2a',
                  p: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: '#ddd' }}>
                    {objetivo}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: daño > 5 ? '#ff6b6b' : 
                           daño > 3 ? '#ffd93d' : 
                           '#6dd5a7',
                    fontWeight: 'bold',
                    ml: 2
                  }}>
                    {typeof daño === 'number' ? daño.toFixed(2) : '-'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
}

export default UnidadTooltip; 