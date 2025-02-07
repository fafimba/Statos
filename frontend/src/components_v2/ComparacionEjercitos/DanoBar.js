import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { calculateAttacks } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';
const DanoBar = React.memo(({ 
  nombreUnidad,
  unidadAtacante,
  unidadOponente,
  perfilesModificados,
  maxDanoEjercito,
  habilidadUnidadActiva,
  habilidadesPerfiles,
  damage_final,
  desglose_perfiles
}) => {
  // Debug de los valores recibidos
  console.log('DanoBar recibe:', {
    unidadAtacante: unidadAtacante.name,
    unidadObjetivo: nombreUnidad,
    perfilesModificados,
    damage_final,
    desglose_perfiles
  });

  // Verificar si hay habilidades defensivas afectando
  const habilidadesDefensivas = useMemo(() => {
    if (!unidadOponente.ability?.effect) return [];

    // Solo mostrar si debe mostrarse en el cálculo de daño
    if (!unidadOponente.ability.effect.display?.in_damage_calc) return [];

    // Verificar si la habilidad aplica basado en el tipo de ataque
    const habilidadAplica = perfilesModificados.some(perfil => {
      const { condition } = unidadOponente.ability.effect;
      if (!condition) return true;

      switch (condition.type) {
        case 'enemy_weapon':
          return perfil[condition.property] === condition.value;
        default:
          return true;
      }
    });

    return habilidadAplica ? [unidadOponente.ability] : [];
  }, [unidadOponente, perfilesModificados]);

  // Usar el daño precalculado
  const danoFinal = damage_final;
  const vidaTotal = unidadOponente.wounds * unidadOponente.models;
  const porcentajeVidaTotal = Math.min((danoFinal / vidaTotal) * 100, 100);

  // Debug de los cálculos
  console.log('DanoBar calcula:', {
    danoFinal,
    vidaTotal,
    porcentajeVidaTotal,
    wounds: unidadOponente.wounds,
    models: unidadOponente.models
  });

  return (
    <Card variant="outlined" sx={{ 
      mt: 1, 
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transition: 'none'
    }}>
      <CardContent sx={{ 
        p: 1, 
        '&:last-child': { pb: 1 },
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {/* Daño numérico */}
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#90caf9',
            minWidth: '60px',
            fontWeight: 'bold'
          }}
        >
          {danoFinal.toFixed(1)}
        </Typography>

        {/* Información de la unidad objetivo */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              damage potential vs
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {nombreUnidad}
            </Typography>
          </Box>

          {/* Habilidades defensivas activas - solo si deben mostrarse */}
          {habilidadesDefensivas.map((habilidad, index) => (
            <Tooltip 
              key={index}
              title={
                <div>
                  <div>{habilidad.name}</div>
                  <div>{habilidad.description}</div>
                </div>
              }
              arrow
            >
              <Box sx={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="caption" sx={{ color: '#ffd700' }}>
                  {habilidad.name}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Barra de progreso y estadísticas */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: '200px'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 0.5,
              textAlign: 'right'
            }}
          >
            kills {porcentajeVidaTotal.toFixed(0)}% of unit ({unidadOponente.models}×{unidadOponente.wounds} wounds)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={porcentajeVidaTotal}
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ffd700',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

export default DanoBar; 