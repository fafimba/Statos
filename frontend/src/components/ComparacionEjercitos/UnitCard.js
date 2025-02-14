import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import { UnitTag } from './UnitTag';
import AttackProfile from './AttackProfile';
import useActiveAttackProfiles from './hooks/useAttackProfiles';
import DamageCalculator from './DamageCalculator';
    

const UnitCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, ejercitoAtacante }) => {
  // Usar el hook de perfiles de ataque
  const {
    perfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
  } = useActiveAttackProfiles(unidad);

  // Estado para habilidades toggleables de unidad
  const [expandido, setExpandido] = useState(false);

  const danoBarData = useMemo(() => {
    if (!ejercitoOponente?.units) return [];

    // Crear un array de objetos con unidadAtacante, unidadOponente y perfiles activos
    return Object.entries(ejercitoOponente.units).map(([nombreUnidad, unidadOponente]) => ({
      unidadAtacante: unidad,
      unidadOponente: unidadOponente,
      perfilesActivos: perfilesActivos
    }));
    
  }, [ejercitoOponente?.units, unidad, perfilesActivos]);

  // Estado para almacenar los daños calculados por cada DanoBar
  const [danosPorUnidad, setDanosPorUnidad] = useState({});

  // Callback para actualizar el daño de una unidad específica
  const actualizarDano = useCallback((nombreUnidadOponente, dano) => {
    if (dano === undefined || dano === null) return;
    
    setDanosPorUnidad(prev => ({
      ...prev,
      [nombreUnidadOponente]: parseFloat(dano)
    }));
  }, []);

  // Calcular el daño medio cuando cambien los daños
  const danoMedio = useMemo(() => {
    const danos = Object.values(danosPorUnidad);
    if (danos.length === 0) return '0.0';
    
    const suma = danos.reduce((sum, dano) => sum + dano, 0);
    return (suma / danos.length).toFixed(1);
  }, [danosPorUnidad]);

  if (!unidad) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header de la unidad */}
      <Box
        onClick={() => setExpandido(!expandido)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          background: theme => `linear-gradient(90deg, 
            ${ejercitoAtacante.color}15 0%, 
            rgba(0,0,0,0.2) 100%
          )`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: theme => ejercitoAtacante.color,
            opacity: 0.5,
            borderRadius: '4px 0 0 4px'
          },
          borderRadius: '8px',
          cursor: 'pointer',
          '&:hover': {
            background: theme => `linear-gradient(90deg, 
              ${ejercitoAtacante.color}20 0%, 
              rgba(0,0,0,0.25) 100%
            )`,
            '&::before': {
              opacity: 0.7
            }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2
        }}>
          {/* Columna izquierda: nombre y atributos */}
          <Box sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}>
            <Typography 
              variant="h6"
              sx={{ 
                color: 'text.primary',
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              {nombreUnidad}
            </Typography>
          </Box>

          {/* Columna derecha: daño y flecha */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginLeft: 'auto',
            minWidth: 'fit-content'
          }}>
            {!expandido && (
              <Tooltip
                title="Average damage dealt by this unit against all units in the opposing army"
                arrow
                placement="left"
                enterDelay={1000}
                leaveDelay={0}
              >
                <Typography sx={{ 
                  color: danoMedio >= 8 ? '#ff4d4d' : danoMedio >= 5 ? 'primary.main' : 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  opacity: 1,
                  minWidth: '60px',
                  textAlign: 'right',
                  cursor: 'help',
                  textShadow: '0 0 10px rgba(0, 207, 200, 0.4)'
                }}>
                  {danoMedio}
                </Typography>
              </Tooltip>
            )}
            <Box sx={{ 
              color: 'text.secondary',
              opacity: 1,
              fontSize: '0.8rem',
              transition: 'transform 0.3s ease',
              transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </Box>
          </Box>
        </Box>
      </Box>

      {expandido && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          mt: 1
        }}>
          {/* Stats y tags en una línea */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 0.5,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {/* Tags */}
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5,
              flexWrap: 'wrap',
              flex: 1
            }}>
              {unidad.tags?.map((tag) => (
                <UnitTag key={tag} label={tag} />
              ))}
            </Box>
            {/* Stats defensivos */}
            <Box sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.models}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.wounds}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ShieldIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.save}+
                </Typography>
              </Box>
              {unidad.ward && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SecurityIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {unidad.ward}+
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Perfiles de ataque */}
          <Box sx={{ mb: 2 }}>
            {unidad.attack_profiles?.map(perfil => (
              <AttackProfile
                key={perfil.name}
                perfil={perfil}
                activo={perfilesActivos[perfil.name]}
                habilidadesPerfil={habilidadesPerfiles[perfil.name]}
                onToggleHabilidad={modificarPerfil}
              />
            ))}
          </Box>

          {/* Daños contra unidades */}
          <Box sx={{
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
            pb: 0,
            '& > *': {
              flex: 1,
              maxWidth: window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)',
              minWidth: window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)'
            }
          }}>
            {danoBarData.map((datos, index) => (
              <DamageCalculator
                key={index}
                unidadAtacante={datos.unidadAtacante}
                unidadOponente={datos.unidadOponente}
                perfilesActivos={datos.perfilesActivos}
                onDanoCalculado={(dano) => actualizarDano(datos.unidadOponente.name, dano)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default UnitCard; 