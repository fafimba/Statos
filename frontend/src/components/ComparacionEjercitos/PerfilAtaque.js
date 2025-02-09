import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Switch,
  Tooltip,
  Grid
} from '@mui/material';
import { weapon_abilities } from '../../data/weapon_abilities';   

const PerfilAtaque = React.memo(({ 
  perfil, 
  activo, 
  habilidadesPerfil = {},
  onToggleHabilidad
}) => {
  const statsBase = {
    attacks: perfil.attacks,
    hit: perfil.hit,
    wound: perfil.wound,
    rend: perfil.rend,
    damage: perfil.damage
  };

  const statsModificados = {
    ...statsBase,
    ...habilidadesPerfil
  };

  // Preparar el tooltip de habilidades
  const habilidadesTooltip = perfil.abilities?.map(habilidadId => {
    const habilidad = weapon_abilities[habilidadId];
    return `${habilidad?.name || habilidadId}: ${habilidad?.description || ''}`;
  }).join('\n\n') || '-';

  // Handler para el toggle
  const handleToggle = (e) => {
    // Evitar que el click se propague si viene del switch
    if (e?.stopPropagation) {
      e.stopPropagation();
    }
    onToggleHabilidad(perfil.name, 'active', !activo);
  };

  return (
    <Box 
      onClick={handleToggle}
      sx={{
        mb: 0.5,
        backgroundColor: activo ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.05)',
        p: 0.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        opacity: activo ? 1 : 0.5,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: activo ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.1)'
        }
      }}
    >
      {/* Nombre y Toggle a la izquierda */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        minWidth: '40px',
        flex: '0 0 auto',
      }}>
        <Switch
          checked={activo}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()} // Evitar doble toggle
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: activo ? '#90caf9' : '#666'
            }
          }}
        />
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            color: '#fff',
            maxWidth: '150px',
          }}
        >
          {perfil.name}
        </Typography>
      </Box>

      {/* Stats alineados a la derecha */}
      <Box sx={{ 
        display: 'flex',
        gap: 0.5,
        ml: 'auto',
      }}>
        {[...['attacks', 'hit', 'wound', 'rend', 'damage'], 'abilities'].map(stat => (
          <Tooltip 
            key={stat} 
            title={stat === 'abilities' ? habilidadesTooltip : ''}
            arrow
            placement="top"
          >
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              p: 0.5,
              width: '40px',
              height: '35px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {stat === 'abilities' ? 'AB' : stat.charAt(0).toUpperCase()}
              </Typography>
              {stat === 'abilities' ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '16px'
                }}>
                  {perfil.abilities?.length ? (
                    <Box sx={{
                      width: 6,
                      height: 6,
                      backgroundColor: '#90caf9',
                      borderRadius: '2px',
                      transform: 'rotate(45deg)'
                    }} />
                  ) : (
                    <Typography sx={{ color: '#666' }}>-</Typography>
                  )}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: statsModificados[stat] !== statsBase[stat] ? '#ffd700' : '#90caf9',
                    fontWeight: 'medium',
                    fontSize: '0.85rem'
                  }}
                >
                  {typeof perfil[stat] === 'string' && perfil[stat].toUpperCase().match(/D\d+/) 
                    ? perfil[stat].toUpperCase()
                    : statsModificados[stat]}
                  {(stat === 'hit' || stat === 'wound') ? '+' : ''}
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
});

export default PerfilAtaque; 