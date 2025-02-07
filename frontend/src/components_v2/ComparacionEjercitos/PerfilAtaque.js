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
  // Calcular stats base y modificados
  const statsBase = React.useMemo(() => ({ ...perfil }), [perfil]);
  const statsModificados = React.useMemo(() => {
    let stats = { ...statsBase };

    // Función auxiliar para aplicar modificadores según el tipo de stat
    const aplicarModificador = (stat, valor) => {
      if (['hit', 'wound', 'save'].includes(stat)) {
        stats[stat] = parseInt(stats[stat]) - parseInt(valor);
      } else if (stat === 'attacks') {
        if (typeof stats[stat] === 'string' && stats[stat].toUpperCase().match(/D\d+/)) {
          return;
        }
        stats[stat] = parseInt(stats[stat]) + parseInt(valor);
      } else {
        stats[stat] = parseInt(stats[stat]) + parseInt(valor);
      }
    };

    // Aplicar modificadores de habilidades del perfil
    if (perfil.abilities && Array.isArray(perfil.abilities)) {
      perfil.abilities.forEach(abilityId => {
        const habilidad = weapon_abilities[abilityId];
        if (!habilidad) return;

        if (habilidad.effect?.type === 'modifier' && 
           (habilidad.type === 'fixed' || 
            (habilidad.type === 'toggleable' && habilidadesPerfil[abilityId]))) {
          const { target, value } = habilidad.effect;
          if (target === 'hit' || target === 'wound' || 
              target === 'damage' || target === 'rend' || target === 'attacks') {
            aplicarModificador(target, value);
          }
        }
      });
    }

    // Aplicar modificadores de la habilidad de unidad
    if (habilidadUnidad?.effect?.type === 'modifier' && 
        habilidadUnidad.effect.display?.in_profile &&
       (habilidadUnidad.type === 'fixed' || 
        (habilidadUnidad.type === 'toggleable' && habilidadUnidadActiva))) {
      const efecto = habilidadUnidad.effect;
      
      // Verificar si el efecto aplica a este perfil específico
      if (!efecto.affects_profile || efecto.affects_profile === perfil.name) {
        if (['hit', 'wound', 'damage', 'rend', 'attacks'].includes(efecto.target)) {
          aplicarModificador(efecto.target, efecto.value);
        }
      }
    }

    return stats;
  }, [statsBase, perfil.abilities, habilidadesPerfil, habilidadUnidad, habilidadUnidadActiva]);

  // Añadir habilidades condicionales al renderizado
  const habilidadesAMostrar = useMemo(() => {
    const habilidades = [...(perfil.abilities || [])];
    
    if (habilidadUnidad?.effect?.type === 'conditional_ability' &&
        habilidadUnidad.effect.display?.in_profile &&
        (habilidadUnidad.type === 'fixed' || 
         (habilidadUnidad.type === 'toggleable' && habilidadUnidadActiva))) {
      if (habilidadUnidad.effect.affects === 'all_profiles' || 
          habilidadUnidad.effect.affects === perfil.name) {
        habilidades.push(habilidadUnidad.effect.ability);
      }
    }
    
    return habilidades;
  }, [perfil.abilities, habilidadUnidad, habilidadUnidadActiva]);

  // Obtener habilidades del perfil
  const habilidadesMostradas = useMemo(() => {
    if (!perfil.abilities || !Array.isArray(perfil.abilities)) return [];

    return perfil.abilities
      .map(habilidadId => {
        const configHabilidad = weapon_abilities[habilidadId];
        if (!configHabilidad) return null;

        return {
          id: habilidadId,
          nombre: configHabilidad.name,
          descripcion: configHabilidad.description,
          tipo: configHabilidad.type,
          activa: habilidadesPerfil[habilidadId] || false
        };
      })
      .filter(Boolean);
  }, [perfil.abilities, habilidadesPerfil]);

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
          <Switch
            size="small"
            checked={activo}
            onChange={() => onToggle(perfil.name)}
          />
        </Typography>
      </Box>

      {/* Stats del perfil */}
      <Grid container spacing={1}>
        {['attacks', 'hit', 'wound', 'rend', 'damage'].map(stat => (
          <Grid item xs key={stat}>
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1,
              p: 1
            }}>
              <Typography variant="caption" color="text.secondary">
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: statsModificados[stat] !== statsBase[stat] 
                    ? '#ffd700' 
                    : '#90caf9'
                }}
              >
                {typeof perfil[stat] === 'string' && perfil[stat].toUpperCase().match(/D\d+/) 
                  ? perfil[stat].toUpperCase()
                  : statsModificados[stat]}
                {(stat === 'hit' || stat === 'wound' || stat === 'save') ? '+' : ''}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Habilidades del perfil */}
      {habilidadesMostradas.map((habilidad) => (
        <Tooltip 
          key={habilidad.id}
          title={habilidad.descripcion}
          arrow
        >
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mr: 2,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 1,
            px: 1,
            py: 0.5
          }}>
            <Typography variant="caption" sx={{ color: '#ffd700' }}>
              {habilidad.nombre}
            </Typography>
            {habilidad.tipo === 'toggleable' && (
              <Switch
                size="small"
                checked={habilidad.activa}
                onChange={() => onToggleHabilidad(perfil.name, habilidad.id)}
                sx={{
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '& .MuiSwitch-thumb': {
                    backgroundColor: habilidad.activa ? '#ffd700' : '#666'
                  }
                }}
              />
            )}
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
});

export default PerfilAtaque; 