import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  Switch
} from '@mui/material';
import { calculateAttacks } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';
import { useHabilidades } from '../../hooks/useHabilidades';

const DanoBar = React.memo(({ 
  nombreUnidad,
  unidadAtacante,
  unidadOponente,
  perfilesModificados,
  maxDanoEjercito,
  damage_final,
  desglose_perfiles
}) => {
  const danoTotal = Number.isFinite(damage_final) ? damage_final : 0;

  // Estado para controlar la visibilidad de cada tooltip individualmente
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  // Preparar arrays de habilidades, filtrando por categoría
  const habilidadesAtacante = [].concat(unidadAtacante.abilities || unidadAtacante.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'offensive');
    
  const habilidadesOponente = [].concat(unidadOponente.abilities || unidadOponente.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'defensive');

  // Modificar la preparación de habilidades para incluir las habilidades de armas
  const habilidades = {
    ofensivas: [
      // Habilidades de unidad ofensivas
      ...habilidadesAtacante
        .filter(hab => {
          const condicionesCumplidas = !hab.effect?.conditions || 
            Object.entries(hab.effect.conditions).every(([key, value]) => {
              switch(key) {
                case 'attack_type':
                  return perfilesModificados.some(perfil => perfil.type === value);
                default:
                  return true;
              }
            });
          return condicionesCumplidas;
        })
        .map(hab => ({
          id: `${unidadAtacante.name}_${hab.name}`,
          ...hab
        })),
      // Habilidades de armas
      ...perfilesModificados.flatMap(perfil => 
        (perfil.abilities || []).map(habilidadId => {
          const habilidadInfo = weapon_abilities[habilidadId];
          return {
            id: `${perfil.name}_${habilidadId}`,
            name: habilidadInfo?.name || habilidadId,
            description: habilidadInfo?.description || '',
            type: habilidadInfo?.type || 'fixed',
            effect: habilidadInfo?.effect,
            profileName: perfil.name
          };
        })
      )
    ],
    defensivas: habilidadesOponente
      .filter(hab => {
        const condicionesCumplidas = !hab.effect?.conditions || 
          Object.entries(hab.effect.conditions).every(([key, value]) => {
            switch(key) {
              case 'attack_type':
                return perfilesModificados.some(perfil => perfil.type === value);
              default:
                return true;
            }
          });
        return condicionesCumplidas;
      })
      .map(hab => ({
        id: `${unidadOponente.name}_${hab.name}`,
        ...hab
      }))
  };

  const { habilidadesActivas, toggleHabilidadOfensiva, toggleHabilidadDefensiva } = useHabilidades(unidadAtacante, unidadOponente);

  // Recalcular el daño cuando cambien las habilidades
  const danoCalculado = useMemo(() => {
    let saveModificado = unidadOponente.save;
    let wardModificado = unidadOponente.ward;
    let modificadoresAtaqueEnemigo = {};
    
    // Manejar array de habilidades defensivas
    if (unidadOponente.abilities || unidadOponente.ability) {
      const habilidades = [].concat(unidadOponente.abilities || unidadOponente.ability).filter(Boolean);
      
      habilidades.forEach(habilidad => {
        const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
        
        // Comprobar si las condiciones se cumplen (si hay)
        const condicionesCumplidas = !habilidad.effect?.conditions || 
          Object.entries(habilidad.effect.conditions).every(([key, value]) => {
            switch(key) {
              case 'attack_type':
                return perfilesModificados.some(perfil => perfil.type === value);
              default:
                return true;
            }
          });

        // Solo aplicar si cumple las condiciones y es fixed o está activa
        const debeAplicarse = condicionesCumplidas && 
          (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
        
        if (debeAplicarse && habilidad.effect) {
          const { type, target, value, affects } = habilidad.effect;
          
          if (type === 'modifier') {
            if (target === 'save') {
              saveModificado = saveModificado - parseInt(value);
            } else if (target === 'ward') {
              if (!wardModificado || parseInt(value) < wardModificado) {
                wardModificado = parseInt(value);
              }
            } else if (affects === 'enemy_attacks') {
              // Verificar las condiciones del ataque antes de aplicar el modificador
              Object.entries(modificadoresAtaqueEnemigo).forEach(([stat, mod]) => {
                if ((!habilidad.effect?.conditions || !habilidad.effect.conditions.attack_type || 
                    perfilesModificados.some(perfil => perfil.type === habilidad.effect.conditions.attack_type))) {
                  modificadoresAtaqueEnemigo[target] = (modificadoresAtaqueEnemigo[target] || 0) + parseInt(value);
                }
              });
            }
          }
        }
      });
    }

    const perfilesConHabilidades = perfilesModificados.map(perfil => {
      let perfilModificado = { ...perfil };
      
      // Aplicar modificadores de ataques enemigos
      if (Object.keys(modificadoresAtaqueEnemigo).length > 0) {
        Object.entries(modificadoresAtaqueEnemigo).forEach(([stat, mod]) => {
          perfilModificado[stat] = parseInt(perfilModificado[stat]) + mod;
        });
      }

      // Aplicar habilidades de armas
      perfil.abilities?.forEach(habilidadId => {
        const habilidadInfo = weapon_abilities[habilidadId];
        const habilidadCompuestaId = `${perfil.name}_${habilidadId}`;
        
        if (habilidadInfo?.type === 'fixed' || habilidadesActivas.ofensivas[habilidadCompuestaId]) {
          // Aplicar los efectos de la habilidad
          if (habilidadInfo?.effect) {
            const { type, target, value } = habilidadInfo.effect;
            if (type === 'modifier') {
              if (target === 'abilities') {
                perfilModificado.abilities = perfilModificado.abilities || [];
                if (!perfilModificado.abilities.includes(value)) {
                  perfilModificado.abilities = [...perfilModificado.abilities, value];
                }
              } else {
                perfilModificado[target] = parseInt(perfilModificado[target]) + 
                  ((['hit', 'wound'].includes(target)) ? -parseInt(value) : parseInt(value));
              }
            }
          }
        }
      });

      // Manejar array de habilidades ofensivas
      if (unidadAtacante.abilities || unidadAtacante.ability) {
        const habilidades = [].concat(unidadAtacante.abilities || unidadAtacante.ability).filter(Boolean);
        
        habilidades.forEach(habilidad => {
          const habilidadId = `${unidadAtacante.name}_${habilidad.name}`;
          const activa = habilidadesActivas.ofensivas[habilidadId];
          
          if (activa) {
            const { type, target, value, conditions } = habilidad.effect;
            
            const aplicarHabilidad = !conditions || (
              (!conditions.profile_name || conditions.profile_name === perfil.name) &&
              (!conditions.attack_type || conditions.attack_type === perfil.type)
            );

            if (aplicarHabilidad) {
              if (type === 'modifier') {
                if (target === 'abilities') {
                  perfilModificado.abilities = perfilModificado.abilities || [];
                  if (!perfilModificado.abilities.includes(value)) {
                    perfilModificado.abilities = [...perfilModificado.abilities, value];
                  }
                } else {
                  perfilModificado[target] = parseInt(perfilModificado[target]) + 
                    ((['hit', 'wound'].includes(target)) ? -parseInt(value) : parseInt(value));
                }
              } else if (type === 'dice_override') {
                // Para dice_override, asegurarnos de que el valor es numérico
                perfilModificado[target] = parseInt(value);
                
                // Debug para ver los valores
                console.log('Aplicando dice_override:', {
                  perfil: perfil.name,
                  target,
                  originalValue: perfil[target],
                  newValue: perfilModificado[target]
                });
              }
            }
          }
        });
      }
      
      return perfilModificado;
    });

    return calculateAttacks({
      perfiles_ataque: perfilesConHabilidades,
      miniaturas: unidadAtacante.models,
      guardia: saveModificado,
      salvaguardia: wardModificado
    });
  }, [perfilesModificados, habilidadesActivas, unidadAtacante, unidadOponente]);

  // Actualizar los manejadores de eventos
  const handleToggleOfensiva = (habilidadId) => {
    console.log('Toggle habilidad ofensiva:', habilidadId);
    toggleHabilidadOfensiva(habilidadId);
  };

  const handleToggleDefensiva = (habilidadId) => {
    console.log('Toggle habilidad defensiva:', habilidadId);
    toggleHabilidadDefensiva(habilidadId);
  };

  const handleMouseEnter = (habilidadId) => {
    // Limpiar cualquier timeout pendiente
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    // Establecer un timeout para mostrar el tooltip específico
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(habilidadId);
    }, 500);
  };

  const handleMouseLeave = () => {
    // Limpiar el timeout si existe
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    // Ocultar el tooltip
    setActiveTooltip(null);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Usar el daño calculado en lugar del damage_final proporcionado
  const danoFinal = danoCalculado.damage_final;
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
    <Box sx={{ 
      width: '180px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      {/* Nombre de la unidad con manejo de nombres largos */}
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#fff',
          textAlign: 'center',
          minHeight: '2.4em', // Altura para dos líneas
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.2em'
        }}
      >
        {nombreUnidad}
      </Typography>

      {/* Caja de daño con altura fija */}
      <Box sx={{ 
        height: '80px', // Altura fija solo para la parte del daño
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Fondo con relleno según porcentaje */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${porcentajeVidaTotal}%`,
          background: `linear-gradient(180deg, 
            rgba(144, 202, 249, 0.15) 0%, 
            rgba(144, 202, 249, 0.3) 100%
          )`,
          transition: 'height 0.3s ease-in-out'
        }} />

        {/* Contenido del daño */}
        <Box sx={{ 
          height: '100%',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="h3" sx={{ 
            color: '#90caf9',
            fontWeight: 'bold',
            lineHeight: 1
          }}>
            {danoFinal.toFixed(1)}
          </Typography>

          <Typography 
            variant="caption" 
            sx={{ 
              color: '#90caf9',
              opacity: 0.8
            }}
          >
            {`${porcentajeVidaTotal.toFixed(0)}%`}
          </Typography>
        </Box>
      </Box>

      {/* Lista de habilidades */}
      {(habilidades.ofensivas.length > 0 || habilidades.defensivas.length > 0) && (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          {/* Habilidades ofensivas */}
          {habilidades.ofensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id} 
              title={habilidad.description} 
              arrow
              open={activeTooltip === habilidad.id}
              onClose={() => setActiveTooltip(null)}
              disableHoverListener
              placement="top"
            >
              <Box 
                onMouseEnter={() => handleMouseEnter(habilidad.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => habilidad.type === 'toggleable' && handleToggleOfensiva(habilidad.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id]
                    ? 'rgba(144, 238, 144, 0.2)' 
                    : 'rgba(144, 238, 144, 0.05)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id]
                    ? 'rgba(144, 238, 144, 0.5)' 
                    : 'rgba(144, 238, 144, 0.1)',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(144, 238, 144, 0.3)',
                    borderColor: 'rgba(144, 238, 144, 0.6)'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id] 
                    ? '#90ee90' 
                    : '#aaa',
                  fontSize: '0.75rem'
                }}>
                  {habilidad.name}
                </Typography>
                {habilidad.type === 'toggleable' && (
                  <Switch
                    size="small"
                    checked={habilidadesActivas.ofensivas[habilidad.id] || false}
                    onChange={() => handleToggleOfensiva(habilidad.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      transform: 'scale(0.6)',
                      ml: 0.5
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}

          {/* Habilidades defensivas */}
          {habilidades.defensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id} 
              title={habilidad.description} 
              arrow
              open={activeTooltip === habilidad.id}
              onClose={() => setActiveTooltip(null)}
              disableHoverListener
              placement="top"
            >
              <Box 
                onMouseEnter={() => handleMouseEnter(habilidad.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => habilidad.type === 'toggleable' && handleToggleDefensiva(habilidad.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id]
                    ? 'rgba(255, 99, 71, 0.2)' 
                    : 'rgba(255, 99, 71, 0.05)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id]
                    ? 'rgba(255, 99, 71, 0.5)' 
                    : 'rgba(255, 99, 71, 0.1)',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(255, 99, 71, 0.3)',
                    borderColor: 'rgba(255, 99, 71, 0.6)'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id] 
                    ? '#ff6347' 
                    : '#aaa',
                  fontSize: '0.75rem'
                }}>
                  {habilidad.name}
                </Typography>
                {habilidad.type === 'toggleable' && (
                  <Switch
                    size="small"
                    checked={habilidadesActivas.defensivas[habilidad.id] || false}
                    onChange={() => handleToggleDefensiva(habilidad.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      transform: 'scale(0.6)',
                      ml: 0.5
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
});

export default DanoBar; 