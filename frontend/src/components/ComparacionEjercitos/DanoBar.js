import React, { useMemo } from 'react';
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
  // Preparar arrays de habilidades, filtrando por categoría
  const habilidadesAtacante = [].concat(unidadAtacante.abilities || unidadAtacante.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'offensive');
    
  const habilidadesOponente = [].concat(unidadOponente.abilities || unidadOponente.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'defensive');

  // Separar habilidades por categoría
  const habilidades = {
    ofensivas: habilidadesAtacante.map(hab => ({
      id: `${unidadAtacante.name}_${hab.name}`,
      ...hab
    })),
    defensivas: habilidadesOponente.map(hab => ({
      id: `${unidadOponente.name}_${hab.name}`,
      ...hab
    }))
  };

  const { habilidadesActivas, toggleHabilidadOfensiva, toggleHabilidadDefensiva } = useHabilidades(unidadAtacante, unidadOponente);

  // Recalcular el daño cuando cambien las habilidades
  const danoCalculado = useMemo(() => {
    // Primero calculamos las modificaciones a la salvación base del oponente
    let saveModificado = unidadOponente.save;
    let wardModificado = unidadOponente.ward;
    
    // Manejar array de habilidades defensivas
    if (unidadOponente.abilities || unidadOponente.ability) {
      const habilidades = [].concat(unidadOponente.abilities || unidadOponente.ability).filter(Boolean);
      
      habilidades.forEach(habilidad => {
        const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
        const activa = habilidadesActivas.defensivas[habilidadId];
        
        if (activa) {
          const { type, target, value } = habilidad.effect;
          
          if (type === 'modifier') {
            if (target === 'save') {
              saveModificado = saveModificado - parseInt(value);
            } else if (target === 'ward') {
              // Si no hay ward previo o el nuevo ward es mejor (número más bajo), usamos el nuevo
              if (!wardModificado || parseInt(value) < wardModificado) {
                wardModificado = parseInt(value);
              }
            }
          }
        }
      });
    }

    const perfilesConHabilidades = perfilesModificados.map(perfil => {
      let perfilModificado = { ...perfil };
      
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
    <Card variant="outlined" sx={{ 
      mt: 1, 
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transition: 'none'
    }}>
      <CardContent sx={{ 
        p: 1, 
        '&:last-child': { pb: 1 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {/* Primera fila: daño y nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ color: '#90caf9', minWidth: '60px', fontWeight: 'bold' }}>
            {danoFinal.toFixed(1)}
          </Typography>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              damage potential vs
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {nombreUnidad}
            </Typography>
          </Box>
        </Box>

        {/* Segunda fila: habilidades ofensivas y defensivas */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Habilidades ofensivas */}
          {habilidades.ofensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id}
              title={habilidad.description}
              arrow
            >
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: 'rgba(144, 238, 144, 0.1)',
                border: '1px solid rgba(144, 238, 144, 0.3)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="caption" sx={{ color: '#90ee90' }}>
                  {habilidad.name}
                </Typography>
                <Switch
                  size="small"
                  checked={habilidadesActivas.ofensivas[habilidad.id] || false}
                  onChange={() => handleToggleOfensiva(habilidad.id)}
                  sx={{
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(144, 238, 144, 0.3)'
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: habilidadesActivas.ofensivas[habilidad.id] ? '#90ee90' : '#666'
                    }
                  }}
                />
              </Box>
            </Tooltip>
          ))}

          {/* Habilidades defensivas */}
          {habilidades.defensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id}
              title={habilidad.description}
              arrow
            >
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                border: '1px solid rgba(255, 99, 71, 0.3)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="caption" sx={{ color: '#ff6347' }}>
                  {habilidad.name}
                </Typography>
                <Switch
                  size="small"
                  checked={habilidadesActivas.defensivas[habilidad.id] || false}
                  onChange={() => handleToggleDefensiva(habilidad.id)}
                  sx={{
                    '& .MuiSwitch-track': {
                      backgroundColor: 'rgba(255, 99, 71, 0.3)'
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: habilidadesActivas.defensivas[habilidad.id] ? '#ff6347' : '#666'
                    }
                  }}
                />
              </Box>
            </Tooltip>
          ))}
        </Box>

        {/* Tercera fila: barra de progreso */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary',
            fontSize: '0.7rem',
            mb: 0.5,
            textAlign: 'right'
          }}>
            kills {Math.min((danoFinal / (unidadOponente.wounds * unidadOponente.models)) * 100, 100).toFixed(0)}% 
            of unit ({unidadOponente.models}×{unidadOponente.wounds} wounds)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((danoFinal / (unidadOponente.wounds * unidadOponente.models)) * 100, 100)}
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ffd700'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

export default DanoBar; 