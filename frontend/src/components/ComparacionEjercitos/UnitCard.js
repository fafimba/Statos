import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import CalculateIcon from '@mui/icons-material/Calculate';
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

  // Solo mantenemos el estado para los cálculos
  const [calculosExpandidos, setCalculosExpandidos] = useState(false);

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
    <Box sx={{ 
      mb: { xs: 2, sm: 3 },
      mx: { xs: -2, sm: 0 },
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: { xs: 0, sm: '12px' },
      border: '1px solid rgba(255,255,255,0.1)',
      borderLeft: { xs: 0, sm: '1px solid rgba(255,255,255,0.1)' },
      borderRight: { xs: 0, sm: '1px solid rgba(255,255,255,0.1)' },
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(45deg, transparent 98%, rgba(255,255,255,0.05) 99%),
          linear-gradient(-45deg, transparent 98%, rgba(255,255,255,0.05) 99%)
        `,
        backgroundSize: '10px 10px',
        opacity: 0.4,
        pointerEvents: 'none'
      },
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.12)',
      }
    }}>
      {/* Header de la unidad */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: { xs: 2, sm: 1.5 },
          background: theme => `linear-gradient(90deg, 
            ${ejercitoAtacante.color}10 0%, 
            rgba(0,0,0,0.1) 100%
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
          },
          '&:hover': {
            background: theme => `linear-gradient(90deg, 
              ${ejercitoAtacante.color}15 0%, 
              rgba(0,0,0,0.15) 100%
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
          alignItems: 'center',
          gap: 1
        }}>
          {/* Nombre y tags */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
            overflow: 'hidden'
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
            <Box sx={{ 
              display: 'flex',
              gap: 0.25,
              flexWrap: 'wrap',
              flex: 1
            }}>
              {unidad.tags?.map((tag) => (
                <UnitTag key={tag} label={tag} />
              ))}
            </Box>
          </Box>

          {/* Stats defensivos */}
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'nowrap',
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
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        width: '100%',
        p: { xs: 2, sm: 2 },
        pt: 0.5,
        transition: 'all 0.2s ease',
      }}>
        {/* Perfiles de ataque */}
        <Box>
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

        {/* Botón para mostrar cálculos */}
        <Box 
          onClick={() => setCalculosExpandidos(!calculosExpandidos)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}>
            <CalculateIcon sx={{ 
              fontSize: '0.9rem', 
              opacity: 0.5,
              transition: 'opacity 0.2s ease',
              '&:hover': {
                opacity: 0.8
              }
            }} />
            <Box sx={{ 
              fontSize: '0.9rem', 
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: 0.5,
              transition: 'opacity 0.2s ease',
              '&:hover': {
                opacity: 0.8
              }
            }}>
              {calculosExpandidos ? 'Hide damage calculations' : 'Show damage calculations'}
              <Box sx={{ 
                transform: `rotate(${calculosExpandidos ? '180deg' : '0deg'})`,
                transition: 'transform 0.2s ease',
                display: 'flex',
                fontSize: '0.7rem',
                opacity: 0.8
              }}>
                ▼
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Cálculos de daño */}
        <Box sx={{
          maxHeight: calculosExpandidos ? '2000px' : '0px',
          opacity: calculosExpandidos ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          visibility: calculosExpandidos ? 'visible' : 'hidden'
        }}>
          <Box sx={{
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            width: '100%',
            pb: 0,
            mt: 2,
            '& > *': {
              width: '100%',
              opacity: calculosExpandidos ? 1 : 0,
              transition: 'opacity 0.25s ease-in-out',
              transitionDelay: '0.1s'
            }
          }}>
            {danoBarData.map((datos, index) => (
              <Box key={index} sx={{
                position: 'relative',
                '&:not(:last-child)::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}>
                <DamageCalculator
                  unidadAtacante={datos.unidadAtacante}
                  unidadOponente={datos.unidadOponente}
                  perfilesActivos={datos.perfilesActivos}
                  onDanoCalculado={(dano) => actualizarDano(datos.unidadOponente.name, dano)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default UnitCard; 