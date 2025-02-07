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
  onToggle,
  habilidadesPerfil = {},
  habilidadUnidad,
  habilidadUnidadActiva,
  onToggleHabilidad = () => {}
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

  const habilidadesMostradas = perfil.abilities?.map(habilidad => ({
    id: habilidad,
    nombre: weapon_abilities[habilidad]?.name || habilidad,
    descripcion: weapon_abilities[habilidad]?.description || '',
    activa: habilidadesPerfil[habilidad] || false,
    onToggle: () => onToggleHabilidad(perfil.name, habilidad)
  })) || [];

  return (
    <Box sx={{
      mb: 1,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
      p: 1,
    }}>
      {/* Contenedor principal - flex column en móvil, row en desktop */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        width: '100%'
      }}>
        {/* Primera fila/columna: Nombre y Stats */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          minWidth: { md: '430px' },
        }}>
          {/* Nombre y Toggle */}
          <Box sx={{ 
            minWidth: { sm: '180px' },
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
          }}>
            <Switch
              checked={activo}
              onChange={(e) => onToggle(perfil.name)}
              size="small"
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: activo ? '#90caf9' : '#666'
                }
              }}
            />
            <Typography variant="body2" noWrap sx={{ color: '#fff' }}>
              {perfil.name}
            </Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            {['attacks', 'hit', 'wound', 'rend', 'damage'].map(stat => (
              <Box key={stat} sx={{ 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                p: 0.5,
                width: '45px',
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                  {stat.charAt(0).toUpperCase()}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: statsModificados[stat] !== statsBase[stat] ? '#ffd700' : '#90caf9',
                    fontWeight: 'medium',
                    fontSize: '0.9rem'
                  }}
                >
                  {typeof perfil[stat] === 'string' && perfil[stat].toUpperCase().match(/D\d+/) 
                    ? perfil[stat].toUpperCase()
                    : statsModificados[stat]}
                  {(stat === 'hit' || stat === 'wound' || stat === 'save') ? '+' : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Habilidades */}
        {habilidadesMostradas.length > 0 && (
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            flex: { md: 1 },
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            pl: { xs: 3, sm: 0 }
          }}>
            {habilidadesMostradas.map(habilidad => {
              const habilidadInfo = weapon_abilities[habilidad.id];
              const esToggleable = habilidadInfo?.type === 'toggleable';

              return (
                <Tooltip key={habilidad.id} title={habilidad.descripcion}>
                  <Box 
                    onClick={() => esToggleable && habilidad.onToggle()}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      padding: '2px 6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      height: '24px',
                      cursor: esToggleable ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': esToggleable ? {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-1px)'
                      } : {},
                      border: habilidad.activa && esToggleable ? 
                        '1px solid rgba(144, 202, 249, 0.5)' : 
                        '1px solid transparent'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      noWrap
                      sx={{
                        color: habilidad.activa && esToggleable ? '#90caf9' : 'inherit'
                      }}
                    >
                      {habilidad.nombre}
                    </Typography>
                    {esToggleable ? (
                      <Switch
                        size="small"
                        checked={habilidad.activa}
                        onChange={habilidad.onToggle}
                        onClick={(e) => e.stopPropagation()} // Evitar doble toggle
                        sx={{
                          transform: 'scale(0.7)',
                          '& .MuiSwitch-thumb': {
                            backgroundColor: habilidad.activa ? '#90caf9' : '#666'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#90caf9',
                        ml: 0.5
                      }} />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default PerfilAtaque; 