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
  // Calculamos las stats base y modificadas
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

  // Preparar las habilidades para mostrar
  const habilidadesMostradas = perfil.abilities?.map(habilidad => ({
    id: habilidad,
    nombre: weapon_abilities[habilidad]?.name || habilidad,
    descripcion: weapon_abilities[habilidad]?.description || '',
    activa: habilidadesPerfil[habilidad] || false,
    onToggle: () => onToggleHabilidad(perfil.name, habilidad)
  })) || [];

  return (
    <Box 
      sx={{ 
        mb: 1,
        p: 1,
        borderRadius: 1,
        backgroundColor: activo ? 'rgba(144, 202, 249, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        transition: 'background-color 0.3s'
      }}
    >
      {/* Cabecera del perfil */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: activo ? '#90caf9' : 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {perfil.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: perfil.type === 'melee' ? '#ff6b6b' : '#4dabf5',
              backgroundColor: perfil.type === 'melee' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(77, 171, 245, 0.1)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              textTransform: 'uppercase',
              fontSize: '0.7rem'
            }}
          >
            {perfil.type}
          </Typography>
          {perfil.range && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#4dabf5',
                backgroundColor: 'rgba(77, 171, 245, 0.1)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem'
              }}
            >
              {perfil.range}"
            </Typography>
          )}
        </Box>
        <Switch
          size="small"
          checked={activo}
          onChange={() => onToggle(perfil.name)}
        />
      </Box>

      {/* Stats del perfil en una línea más compacta */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 1,
        p: 1
      }}>
        {['attacks', 'hit', 'wound', 'rend', 'damage'].map(stat => (
          <Box key={stat} sx={{ textAlign: 'center', minWidth: '50px' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: statsModificados[stat] !== statsBase[stat] ? '#ffd700' : '#90caf9',
                fontWeight: 'medium'
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

      {/* Habilidades del perfil */}
      {perfil.abilities && perfil.abilities.length > 0 && (
        <Box sx={{ 
          mt: 1, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          alignItems: 'center'
        }}>
          {perfil.abilities.map((habilidad) => {
            const habilidadInfo = weapon_abilities[habilidad];
            const esToggleable = habilidadInfo?.type === 'toggleable';

            return (
              <Tooltip 
                key={habilidad}
                title={habilidadInfo?.description || habilidad}
                arrow
              >
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#ffd700',
                      fontSize: '0.7rem'
                    }}
                  >
                    {habilidadInfo?.name || habilidad}
                  </Typography>
                  {esToggleable && (
                    <Switch
                      size="small"
                      checked={habilidadesPerfil[habilidad] || false}
                      onChange={() => onToggleHabilidad(perfil.name, habilidad)}
                      sx={{
                        '& .MuiSwitch-track': {
                          backgroundColor: 'rgba(255, 215, 0, 0.3)'
                        },
                        '& .MuiSwitch-thumb': {
                          backgroundColor: habilidadesPerfil[habilidad] ? '#ffd700' : '#666'
                        }
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
});

export default PerfilAtaque; 